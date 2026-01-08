'use client';

import { cn } from '@/utils/cn';
import { SyncStatus as SyncStatusType } from '@/types';

interface SyncStatusProps {
  status: SyncStatusType;
  className?: string;
  showLabel?: boolean;
}

const statusConfig: Record<SyncStatusType, { label: string; color: string; icon: string }> = {
  synced: {
    label: 'Synced',
    color: 'text-green-600 bg-green-100  ',
    icon: 'M5 13l4 4L19 7',
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-600 bg-yellow-100  ',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  syncing: {
    label: 'Syncing',
    color: 'text-green-600 bg-green-100  ',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-600 bg-red-100  ',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  conflict: {
    label: 'Conflict',
    color: 'text-orange-600 bg-orange-100  ',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
};

const SyncStatus = ({ status, className, showLabel = false }: SyncStatusProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.color,
        className
      )}
      title={config.label}
    >
      <svg
        className={cn('w-3 h-3', status === 'syncing' && 'animate-spin')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={config.icon}
        />
      </svg>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export { SyncStatus };
export default SyncStatus;
