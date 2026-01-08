"use client";

import { useState, useMemo } from "react";
import { LocalNote } from "@/types";
import { NoteCard } from "./NoteCard";
import { SearchInput } from "@/components/ui";
import { cn } from "@/utils/cn";
import Image from "next/image";

interface NotesListProps {
  notes: LocalNote[];
  selectedNoteId?: string;
  onNoteSelect: (note: LocalNote) => void;
  onNoteDelete: (note: LocalNote) => void;
  isLoading?: boolean;
}

const NotesList = ({
  notes,
  selectedNoteId,
  onNoteSelect,
  onNoteDelete,
  isLoading,
}: NotesListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;

    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">
          <Image src="/lgoo1.png" width={100} height={20} alt="Pullus Africa" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and view controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            placeholder="Search notes..."
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-100  rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-white  shadow-sm text-green-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            aria-label="Grid view"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-white  shadow-sm text-green-600"
                : "text-gray-500 hover:text-gray-700"
            )}
            aria-label="List view"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes count */}
      {searchQuery && (
        <p className="text-sm text-gray-500 text-end ">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
          {searchQuery && notes.length !== filteredNotes.length && (
            <span> (filtered from {notes.length})</span>
          )}
        </p>
      )}

      {/* Notes grid/list */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 ">
            {searchQuery ? "No notes found" : "No notes yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try a different search term"
              : "Get started by creating a new note"}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"
          )}
        >
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.localId}
              note={note}
              isSelected={selectedNoteId === note.localId}
              onClick={() => onNoteSelect(note)}
              onDelete={() => onNoteDelete(note)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { NotesList };
export default NotesList;
