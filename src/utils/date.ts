/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Less than a minute ago
  if (diffInMins < 1) {
    return 'Just now';
  }

  // Less than an hour ago
  if (diffInMins < 60) {
    return `${diffInMins}m ago`;
  }

  // Less than a day ago
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than a week ago
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // More than a week ago - show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format a date for full display with time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
