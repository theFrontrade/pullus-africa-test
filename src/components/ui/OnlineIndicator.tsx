'use client';

import { cn } from '@/utils/cn';

interface OnlineIndicatorProps {
  isOnline: boolean;
  pendingCount?: number;
  isSyncing?: boolean;
  className?: string;
}

const OnlineIndicator = ({
  isOnline,
  pendingCount = 0,
  isSyncing = false,
  className,
}: OnlineIndicatorProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
        isOnline
          ? 'bg-green-100 text-green-700 '
          : 'bg-red-100 text-red-700 ',
        className
      )}
    >
      {/* Status dot */}
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          isOnline ? 'bg-green-500' : 'bg-red-500',
          isSyncing && 'animate-pulse'
        )}
      />

      {/* Status text */}
      <span>
        {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
      </span>

      {/* Pending count badge */}
      {pendingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
            'bg-yellow-500 text-white'
          )}
          title={`${pendingCount} pending ${pendingCount === 1 ? 'change' : 'changes'}`}
        >
          {pendingCount}
        </span>
      )}
    </div>
  );
};

export { OnlineIndicator };
export default OnlineIndicator;
