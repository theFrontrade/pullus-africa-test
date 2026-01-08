/**
 * Core Note type matching the Supabase schema
 */
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  modified_at: string;
}

/**
 * Note without server-generated fields (for creation)
 */
export type NoteCreate = Omit<Note, 'id' | 'created_at'>;

/**
 * Note fields that can be updated
 */
export type NoteUpdate = Partial<Pick<Note, 'title' | 'content' | 'modified_at'>>;

/**
 * Local note with sync metadata
 */
export interface LocalNote extends Note {
  syncStatus: SyncStatus;
  localId: string; // Used for offline-created notes before server assigns ID
  pendingOperation?: PendingOperation;
  version: number; // For conflict resolution
}

/**
 * Sync status for UI display
 */
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed' | 'conflict';

/**
 * Types of pending operations to sync
 */
export type PendingOperationType = 'create' | 'update' | 'delete';

/**
 * Pending operation stored for background sync
 */
export interface PendingOperation {
  id: string;
  type: PendingOperationType;
  noteId: string;
  localId: string;
  data: Partial<Note>;
  timestamp: string;
  retryCount: number;
}

/**
 * Conflict data for resolution
 */
export interface ConflictData {
  localNote: LocalNote;
  serverNote: Note;
  resolvedAt?: string;
  resolution?: 'local' | 'server' | 'merged';
}

/**
 * Form data for creating/editing notes
 */
export interface NoteFormData {
  title: string;
  content: string;
}

/**
 * Validation constraints
 */
export const NOTE_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 5000,
} as const;
