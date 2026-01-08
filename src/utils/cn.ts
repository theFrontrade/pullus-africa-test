import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function for conditional class names
 * Uses clsx for conditional class merging
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
