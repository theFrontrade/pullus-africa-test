"use client";

import { useState, useCallback, useEffect } from "react";
import { LocalNote, NoteFormData } from "@/types";
import { useNotes, useOnlineStatus, useServiceWorker } from "@/hooks";
import { NotesList, NoteForm, DeleteConfirmModal } from "@/components/notes";
import { Button, Modal, OnlineIndicator } from "@/components/ui";
import ServiceWorkerWarning from "@/components/ui/serviceWarning";
import NotesSummary from "@/components/notes/summary";
import Image from "next/image";

export default function HomePage() {
  const { isOnline } = useOnlineStatus();
  const { isSupported, updateAvailable, skipWaiting } = useServiceWorker();
  const {
    notes,
    isLoading,
    error,
    pendingCount,
    isSyncing,
    createNote,
    updateNote,
    deleteNote,
    syncNotes,
  } = useNotes();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<LocalNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<LocalNote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    if (updateAvailable) {
      showNotification("New version available! Click to update.");
    }
  }, [updateAvailable, showNotification]);

  const handleCreateNew = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleEdit = (note: LocalNote) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
  };

  const handleSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.localId, data);
        showNotification("Note updated successfully");
      } else {
        await createNote(data);
        showNotification("Note created successfully");
      }
      handleCloseForm();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Failed to save note"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNote) return;

    setIsSubmitting(true);
    try {
      await deleteNote(deletingNote.localId);
      showNotification("Note deleted successfully");
      setDeletingNote(null);
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : "Failed to delete note"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    const result = await syncNotes();
    if (result.success) {
      showNotification(`Synced ${result.synced} notes`);
    } else {
      showNotification(result.error || "Sync failed");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#f5f5f5] backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="">
                <Image 
                src="/lgoo1.png"
                width={50}
                height={10}
                alt="Pullus Africa"
                /> 
              </div>
              <div>
                <h1 className="md:text-xl  font-bold text-gray-900">
                  Pullus Africa Notes
                </h1>
                <p className="text-xs text-gray-500">Offline-First PWA</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <OnlineIndicator
                isOnline={isOnline}
                pendingCount={pendingCount}
                isSyncing={isSyncing}
              />

              {isOnline && pendingCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  <svg
                    className={`w-4 h-4 mr-1 ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sync
                </Button>
              )}

              <Button variant="primary" onClick={handleCreateNew}>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Note
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl  mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {!isOnline && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
              <p className="text-sm text-yellow-800">
                You&apos;re offline. Changes will sync when you&apos;re back
                online.
              </p>
            </div>
          </div>
        )}
        <div>
          <NotesSummary
            total={notes.length}
            pending={pendingCount}
            synced={notes.length - pendingCount}
          />
        </div>
        <NotesList
          notes={notes}
          onNoteSelect={handleEdit}
          onNoteDelete={setDeletingNote}
          isLoading={isLoading}
        />
      </main>

      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingNote ? "Edit Note" : "Create Note"}
        size="lg"
      >
        <NoteForm
          initialData={editingNote || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      </Modal>

      <DeleteConfirmModal
        isOpen={!!deletingNote}
        note={deletingNote}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingNote(null)}
        isLoading={isSubmitting}
      />

      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
            {notification}
          </div>
        </div>
      )}

      {updateAvailable && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={skipWaiting}
            className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
          >
            Update available - Click to refresh
          </button>
        </div>
      )}

      <ServiceWorkerWarning isSupported={isSupported} />
    </div>
  );
}
