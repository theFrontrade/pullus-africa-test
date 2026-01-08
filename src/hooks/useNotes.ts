'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalNote, NoteFormData } from '@/types';
import { syncService, SyncResult } from '@/services';

interface UseNotesReturn {
  notes: LocalNote[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  createNote: (data: NoteFormData) => Promise<LocalNote>;
  updateNote: (localId: string, data: NoteFormData) => Promise<LocalNote>;
  deleteNote: (localId: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  syncNotes: () => Promise<SyncResult>;
}

/**
 * Hook for managing notes with offline-first capabilities
 */
export function useNotes(): UseNotesReturn {
  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  /**
   * Refresh notes from local storage
   */
  const refreshNotes = useCallback(async () => {
    try {
      const localNotes = await syncService.getNotes();
      setNotes(localNotes);
      const count = await syncService.getPendingCount();
      setPendingCount(count);
    } catch (err) {
      console.error('Failed to refresh notes:', err);
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load from local storage first
        await refreshNotes();

        // Then sync with server if online
        if (navigator.onLine) {
          await syncNotes();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [refreshNotes]);

  /**
   * Listen for service worker sync requests
   */
  useEffect(() => {
    const handleSyncRequest = () => {
      if (navigator.onLine) {
        syncNotes();
      }
    };

    window.addEventListener('sw-sync-requested', handleSyncRequest);
    window.addEventListener('online', handleSyncRequest);

    return () => {
      window.removeEventListener('sw-sync-requested', handleSyncRequest);
      window.removeEventListener('online', handleSyncRequest);
    };
  }, []);

  /**
   * Sync notes with server
   */
  const syncNotes = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const result = await syncService.fullSync();
      setLastSyncResult(result);
      await refreshNotes();
      return result;
    } catch (err) {
      const result: SyncResult = {
        success: false,
        synced: 0,
        failed: 0,
        conflicts: 0,
        error: err instanceof Error ? err.message : 'Sync failed',
      };
      setLastSyncResult(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshNotes]);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (data: NoteFormData): Promise<LocalNote> => {
    setError(null);
    try {
      const newNote = await syncService.createNote(data);
      await refreshNotes();
      return newNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note';
      setError(message);
      throw new Error(message);
    }
  }, [refreshNotes]);

  /**
   * Update an existing note
   */
  const updateNote = useCallback(async (localId: string, data: NoteFormData): Promise<LocalNote> => {
    setError(null);
    try {
      const updatedNote = await syncService.updateNote(localId, data);
      await refreshNotes();
      return updatedNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note';
      setError(message);
      throw new Error(message);
    }
  }, [refreshNotes]);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (localId: string): Promise<void> => {
    setError(null);
    try {
      await syncService.deleteNote(localId);
      await refreshNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      throw new Error(message);
    }
  }, [refreshNotes]);

  return {
    notes,
    isLoading,
    error,
    pendingCount,
    isSyncing,
    lastSyncResult,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    syncNotes,
  };
}

export default useNotes;
