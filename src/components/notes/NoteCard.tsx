'use client';

import { LocalNote } from '@/types';
import { SyncStatus } from '@/components/ui';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';

interface NoteCardProps {
  note: LocalNote;
  onClick: () => void;
  onDelete: () => void;
  isSelected?: boolean;
}

const NoteCard = ({ note, onClick, onDelete, isSelected }: NoteCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative p-4 bg-white  rounded-xl border cursor-pointer',
        'transition-all duration-200  hover:border-green-300 ',
        isSelected
          ? 'border-green-500 shadow-md'
          : 'border-gray-100 '
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900  line-clamp-1">
          {note.title || 'Untitled'}
        </h3>
        <SyncStatus status={note.syncStatus} />
      </div>

      {/* Content preview */}
      <p className="text-sm text-gray-600  line-clamp-3 mb-3">
        {note.content || 'No content'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 ">
        <time dateTime={note.modified_at}>
          {formatDate(note.modified_at)}
        </time>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className={cn(
            'p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50',
            '',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500'
          )}
          aria-label={`Delete note: ${note.title}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </article>
  );
};

export { NoteCard };
export default NoteCard;
