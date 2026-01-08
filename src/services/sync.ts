import { v4 as uuidv4 } from 'uuid';
import { Note, LocalNote, PendingOperation, SyncStatus, NoteFormData } from '@/types';
import { api, ApiError } from './api';
import { notesDB, pendingOpsDB, syncMetaDB } from './db';
import { USER_ID, SYNC_CONFIG } from '@/lib/constants';

/**
 * Sync service result type
 */
export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: number;
  error?: string;
}

/**
 * Convert a server note to local note format
 */
export const serverToLocalNote = (note: Note, syncStatus: SyncStatus = 'synced'): LocalNote => ({
  ...note,
  localId: note.id, // Use server ID as localId for synced notes
  syncStatus,
  version: 1,
});

/**
 * Create a new local note
 */
export const createLocalNote = (data: NoteFormData): LocalNote => {
  const now = new Date().toISOString();
  const localId = uuidv4();

  return {
    id: '', // Will be assigned by server
    localId,
    user_id: USER_ID,
    title: data.title,
    content: data.content,
    created_at: now,
    modified_at: now,
    syncStatus: 'pending',
    version: 1,
  };
};

/**
 * Sync service for handling offline/online synchronization
 */
export const syncService = {
  /**
   * Create a note (offline-first)
   */
  async createNote(data: NoteFormData): Promise<LocalNote> {
    const localNote = createLocalNote(data);

    // Save to IndexedDB first
    await notesDB.put(localNote);

    // Add pending operation
    const operation: PendingOperation = {
      id: uuidv4(),
      type: 'create',
      noteId: '',
      localId: localNote.localId,
      data: {
        user_id: localNote.user_id,
        title: localNote.title,
        content: localNote.content,
      },
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    await pendingOpsDB.add(operation);

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.syncPendingOperations();
    } else {
      // Register for background sync
      this.registerBackgroundSync();
    }

    // Return the latest version of the note
    const updatedNote = await notesDB.getByLocalId(localNote.localId);
    return updatedNote || localNote;
  },

  /**
   * Update a note (offline-first)
   */
  async updateNote(localId: string, data: NoteFormData): Promise<LocalNote> {
    const existingNote = await notesDB.getByLocalId(localId);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    const updatedNote: LocalNote = {
      ...existingNote,
      title: data.title,
      content: data.content,
      modified_at: new Date().toISOString(),
      syncStatus: 'pending',
      version: existingNote.version + 1,
    };

    // Save to IndexedDB
    await notesDB.put(updatedNote);

    // Add pending operation (if note has server ID)
    if (existingNote.id) {
      const operation: PendingOperation = {
        id: uuidv4(),
        type: 'update',
        noteId: existingNote.id,
        localId: localId,
        data: {
          title: data.title,
          content: data.content,
          modified_at: updatedNote.modified_at,
        },
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      await pendingOpsDB.add(operation);
    }

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.syncPendingOperations();
    } else {
      this.registerBackgroundSync();
    }

    // Return the latest version
    const latestNote = await notesDB.getByLocalId(localId);
    return latestNote || updatedNote;
  },

  /**
   * Delete a note (offline-first)
   */
  async deleteNote(localId: string): Promise<void> {
    const existingNote = await notesDB.getByLocalId(localId);
    if (!existingNote) {
      return;
    }

    // If the note has a server ID, add a delete operation
    if (existingNote.id) {
      const operation: PendingOperation = {
        id: uuidv4(),
        type: 'delete',
        noteId: existingNote.id,
        localId: localId,
        data: {},
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };
      await pendingOpsDB.add(operation);
    }

    // Remove from local database
    await notesDB.delete(localId);

    // Remove any pending operations for this note that are not deletes
    const pendingOps = await pendingOpsDB.getByNoteId(existingNote.id || localId);
    for (const op of pendingOps) {
      if (op.type !== 'delete') {
        await pendingOpsDB.remove(op.id);
      }
    }

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.syncPendingOperations();
    } else {
      this.registerBackgroundSync();
    }
  },

  /**
   * Get all notes (from local storage)
   */
  async getNotes(): Promise<LocalNote[]> {
    return notesDB.getAll();
  },

  /**
   * Get a single note by localId
   */
  async getNote(localId: string): Promise<LocalNote | undefined> {
    return notesDB.getByLocalId(localId);
  },

  /**
   * Full sync - fetch all notes from server and merge with local
   */
  async fullSync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      synced: 0,
      failed: 0,
      conflicts: 0,
    };

    try {
      // First, process pending operations
      await this.syncPendingOperations();

      // Fetch server notes
      const serverNotes = await api.fetchNotes();
      const localNotes = await notesDB.getAll();

      // Create a map of server note IDs for efficient lookup
      const serverNotesMap = new Map(serverNotes.map(n => [n.id, n]));

      // Create a map of local notes by server ID (only for notes that have been synced)
      const localNotesByServerId = new Map<string, LocalNote>();
      for (const localNote of localNotes) {
        if (localNote.id) {
          localNotesByServerId.set(localNote.id, localNote);
        }
      }

      // Process server notes
      for (const serverNote of serverNotes) {
        const localNote = localNotesByServerId.get(serverNote.id);

        if (!localNote) {
          // New note from server - check it's not a duplicate of a pending local note
          // by comparing title, content, and similar timestamps
          const possibleDuplicate = localNotes.find(ln =>
            !ln.id && // Only check notes without server ID (pending creates)
            ln.title === serverNote.title &&
            ln.content === serverNote.content
          );

          if (possibleDuplicate) {
            // This is likely our note that was synced - update it with server data
            await notesDB.put({
              ...serverToLocalNote(serverNote),
              localId: possibleDuplicate.localId, // Keep the original localId
            });
          } else {
            // Truly new note from server (created on another device)
            await notesDB.put(serverToLocalNote(serverNote));
          }
          result.synced++;
        } else if (localNote.syncStatus === 'synced') {
          // Update local with server version
          await notesDB.put({
            ...serverToLocalNote(serverNote),
            localId: localNote.localId,
          });
          result.synced++;
        } else {
          // Conflict resolution - last write wins based on modified_at
          const resolved = this.resolveConflict(localNote, serverNote);
          await notesDB.put(resolved);
          if (resolved.syncStatus === 'conflict') {
            result.conflicts++;
          } else {
            result.synced++;
          }
        }
      }

      // Check for local notes that don't exist on server (deleted remotely)
      // Only remove synced notes - pending notes haven't been created on server yet
      for (const localNote of localNotes) {
        if (localNote.id && !serverNotesMap.has(localNote.id) && localNote.syncStatus === 'synced') {
          // Note was deleted on server
          await notesDB.delete(localNote.localId);
        }
      }

      await syncMetaDB.setLastSyncTime(new Date().toISOString());
      result.success = true;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Sync failed';
      result.success = false;
    }

    return result;
  },

  /**
   * Resolve conflict between local and server versions
   * Strategy: Last Write Wins (based on modified_at timestamp)
   */
  resolveConflict(local: LocalNote, server: Note): LocalNote {
    const localModified = new Date(local.modified_at).getTime();
    const serverModified = new Date(server.modified_at).getTime();

    // If local is newer, keep local changes and mark for sync
    if (localModified > serverModified) {
      return {
        ...local,
        syncStatus: 'pending',
      };
    }

    // If server is newer or same, use server version
    return {
      ...serverToLocalNote(server),
      localId: local.localId,
    };
  },

  /**
   * Process all pending operations
   */
  async syncPendingOperations(): Promise<{ synced: number; failed: number }> {
    const pendingOps = await pendingOpsDB.getAll();
    let synced = 0;
    let failed = 0;

    // Deduplicate operations - keep only the latest operation per localId
    const latestOps = new Map<string, PendingOperation>();
    for (const op of pendingOps) {
      const existing = latestOps.get(op.localId);
      // If delete operation exists, it takes precedence
      if (op.type === 'delete') {
        latestOps.set(op.localId, op);
      } else if (!existing || new Date(op.timestamp) > new Date(existing.timestamp)) {
        // Keep the latest non-delete operation
        if (existing?.type !== 'delete') {
          latestOps.set(op.localId, op);
        }
      }
    }

    // Remove duplicate operations from the database
    for (const op of pendingOps) {
      const latest = latestOps.get(op.localId);
      if (latest && op.id !== latest.id) {
        await pendingOpsDB.remove(op.id);
      }
    }

    // Process deduplicated operations
    for (const operation of latestOps.values()) {
      try {
        await this.processOperation(operation);
        await pendingOpsDB.remove(operation.id);
        synced++;
      } catch (error) {
        if (operation.retryCount < SYNC_CONFIG.MAX_RETRY_COUNT) {
          await pendingOpsDB.updateRetryCount(operation.id, operation.retryCount + 1);
        } else {
          // Mark the note as failed
          const localNote = await notesDB.getByLocalId(operation.localId);
          if (localNote) {
            await notesDB.put({
              ...localNote,
              syncStatus: 'failed',
            });
          }
        }
        failed++;
        console.error('Failed to process operation:', operation, error);
      }
    }

    return { synced, failed };
  },

  /**
   * Process a single pending operation
   */
  async processOperation(operation: PendingOperation): Promise<void> {
    switch (operation.type) {
      case 'create': {
        // First check if the local note still exists and doesn't already have a server ID
        const localNote = await notesDB.getByLocalId(operation.localId);

        // Skip if note was deleted locally or already has a server ID
        if (!localNote) {
          return;
        }

        if (localNote.id) {
          // Note already has server ID - just mark as synced
          await notesDB.put({
            ...localNote,
            syncStatus: 'synced',
          });
          return;
        }

        const serverNote = await api.createNote({
          user_id: operation.data.user_id as string,
          title: operation.data.title as string,
          content: operation.data.content as string,
          modified_at: new Date().toISOString(),
        });

        // Update local note with server ID
        await notesDB.put({
          ...localNote,
          id: serverNote.id,
          created_at: serverNote.created_at,
          syncStatus: 'synced',
        });
        break;
      }

      case 'update': {
        await api.updateNote(operation.noteId, {
          title: operation.data.title,
          content: operation.data.content,
          modified_at: operation.data.modified_at,
        });

        // Update sync status
        const localNote = await notesDB.getByLocalId(operation.localId);
        if (localNote) {
          await notesDB.put({
            ...localNote,
            syncStatus: 'synced',
          });
        }
        break;
      }

      case 'delete': {
        try {
          await api.deleteNote(operation.noteId);
        } catch (error) {
          // If note doesn't exist on server, that's fine
          if (error instanceof ApiError && error.status !== 404) {
            throw error;
          }
        }
        break;
      }
    }
  },

  /**
   * Register for background sync (if supported)
   */
  registerBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
          .sync.register(SYNC_CONFIG.SYNC_TAG)
          .catch(err => {
            console.warn('Background sync registration failed:', err);
          });
      });
    }
  },

  /**
   * Get pending operation count
   */
  async getPendingCount(): Promise<number> {
    return pendingOpsDB.count();
  },
};

export default syncService;
