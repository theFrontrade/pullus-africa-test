import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { LocalNote, PendingOperation } from '@/types';
import { DB_NAME, DB_VERSION, STORES } from '@/lib/constants';

/**
 * IndexedDB schema definition
 */
interface NotesDBSchema extends DBSchema {
  [STORES.NOTES]: {
    key: string;
    value: LocalNote;
    indexes: {
      'by-user': string;
      'by-sync-status': string;
      'by-modified': string;
    };
  };
  [STORES.PENDING_OPERATIONS]: {
    key: string;
    value: PendingOperation;
    indexes: {
      'by-timestamp': string;
      'by-note-id': string;
    };
  };
  [STORES.SYNC_META]: {
    key: string;
    value: {
      key: string;
      value: string | number | boolean;
      updatedAt: string;
    };
  };
}

let dbInstance: IDBPDatabase<NotesDBSchema> | null = null;

/**
 * Initialize and get the database instance
 */
export const getDB = async (): Promise<IDBPDatabase<NotesDBSchema>> => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<NotesDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'localId' });
        notesStore.createIndex('by-user', 'user_id');
        notesStore.createIndex('by-sync-status', 'syncStatus');
        notesStore.createIndex('by-modified', 'modified_at');
      }

      // Pending operations store
      if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_OPERATIONS, { keyPath: 'id' });
        pendingStore.createIndex('by-timestamp', 'timestamp');
        pendingStore.createIndex('by-note-id', 'noteId');
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
        db.createObjectStore(STORES.SYNC_META, { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
};

/**
 * Database operations for notes
 */
export const notesDB = {
  /**
   * Get all notes from local storage
   */
  async getAll(): Promise<LocalNote[]> {
    const db = await getDB();
    const notes = await db.getAll(STORES.NOTES);
    return notes.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Get a single note by localId
   */
  async getByLocalId(localId: string): Promise<LocalNote | undefined> {
    const db = await getDB();
    return db.get(STORES.NOTES, localId);
  },

  /**
   * Get a note by server ID
   */
  async getByServerId(serverId: string): Promise<LocalNote | undefined> {
    const db = await getDB();
    const allNotes = await db.getAll(STORES.NOTES);
    return allNotes.find(note => note.id === serverId);
  },

  /**
   * Add or update a note
   */
  async put(note: LocalNote): Promise<void> {
    const db = await getDB();
    await db.put(STORES.NOTES, note);
  },

  /**
   * Add multiple notes (for bulk sync)
   */
  async putMany(notes: LocalNote[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(STORES.NOTES, 'readwrite');
    await Promise.all([
      ...notes.map(note => tx.store.put(note)),
      tx.done,
    ]);
  },

  /**
   * Delete a note by localId
   */
  async delete(localId: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.NOTES, localId);
  },

  /**
   * Get notes by sync status
   */
  async getBySyncStatus(status: LocalNote['syncStatus']): Promise<LocalNote[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORES.NOTES, 'by-sync-status', status);
  },

  /**
   * Clear all notes (use with caution)
   */
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORES.NOTES);
  },
};

/**
 * Database operations for pending sync operations
 */
export const pendingOpsDB = {
  /**
   * Get all pending operations
   */
  async getAll(): Promise<PendingOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORES.PENDING_OPERATIONS, 'by-timestamp');
  },

  /**
   * Add a pending operation
   */
  async add(operation: PendingOperation): Promise<void> {
    const db = await getDB();
    await db.put(STORES.PENDING_OPERATIONS, operation);
  },

  /**
   * Remove a pending operation
   */
  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.PENDING_OPERATIONS, id);
  },

  /**
   * Get operations for a specific note
   */
  async getByNoteId(noteId: string): Promise<PendingOperation[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORES.PENDING_OPERATIONS, 'by-note-id', noteId);
  },

  /**
   * Update operation retry count
   */
  async updateRetryCount(id: string, retryCount: number): Promise<void> {
    const db = await getDB();
    const op = await db.get(STORES.PENDING_OPERATIONS, id);
    if (op) {
      op.retryCount = retryCount;
      await db.put(STORES.PENDING_OPERATIONS, op);
    }
  },

  /**
   * Clear all pending operations
   */
  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORES.PENDING_OPERATIONS);
  },

  /**
   * Get count of pending operations
   */
  async count(): Promise<number> {
    const db = await getDB();
    return db.count(STORES.PENDING_OPERATIONS);
  },
};

/**
 * Database operations for sync metadata
 */
export const syncMetaDB = {
  /**
   * Get a metadata value
   */
  async get(key: string): Promise<string | number | boolean | undefined> {
    const db = await getDB();
    const meta = await db.get(STORES.SYNC_META, key);
    return meta?.value;
  },

  /**
   * Set a metadata value
   */
  async set(key: string, value: string | number | boolean): Promise<void> {
    const db = await getDB();
    await db.put(STORES.SYNC_META, {
      key,
      value,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<string | undefined> {
    const value = await this.get('lastSyncTime');
    return typeof value === 'string' ? value : undefined;
  },

  /**
   * Set last sync timestamp
   */
  async setLastSyncTime(timestamp: string): Promise<void> {
    await this.set('lastSyncTime', timestamp);
  },
};

export default { notesDB, pendingOpsDB, syncMetaDB, getDB };
