/**
 * Supabase configuration
 */
export const SUPABASE_URL = 'https://scwaxiuduzyziuyjfwda.supabase.co/rest/v1';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_ANON_KEY || 'test-key';

/**
 * User ID - Replace with your assigned email
 * This is used to filter notes and isolate your data
 */
export const USER_ID = process.env.NEXT_PUBLIC_USER_ID || 'test@example.com';

/**
 * IndexedDB configuration
 */
export const DB_NAME = 'notes-pwa-db';
export const DB_VERSION = 1;

/**
 * Store names
 */
export const STORES = {
  NOTES: 'notes',
  PENDING_OPERATIONS: 'pending_operations',
  SYNC_META: 'sync_meta',
} as const;

/**
 * Sync configuration
 */
export const SYNC_CONFIG = {
  MAX_RETRY_COUNT: 3,
  RETRY_DELAY_MS: 1000,
  SYNC_TAG: 'notes-sync',
} as const;

/**
 * Cache names for service worker
 */
export const CACHE_NAMES = {
  STATIC: 'static-cache-v1',
  DYNAMIC: 'dynamic-cache-v1',
  API: 'api-cache-v1',
} as const;
