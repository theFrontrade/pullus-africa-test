import { Note, NoteCreate, NoteUpdate } from '@/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, USER_ID } from '@/lib/constants';

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base headers for all Supabase requests
 */
const getHeaders = (includePrefer = false): HeadersInit => {
  const headers: HeadersInit = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  if (includePrefer) {
    headers['Prefer'] = 'return=representation';
  }

  return headers;
};

/**
 * Handle API response and throw errors appropriately
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode: string | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return [] as T;
  }

  return response.json();
};

/**
 * API service for Supabase operations
 */
export const api = {
  /**
   * Fetch all notes for the current user
   */
  async fetchNotes(): Promise<Note[]> {
    const encodedUserId = encodeURIComponent(USER_ID);
    const url = `${SUPABASE_URL}/notes?user_id=eq.${encodedUserId}&order=created_at.desc`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    return handleResponse<Note[]>(response);
  },

  /**
   * Fetch a single note by ID
   */
  async fetchNote(noteId: string): Promise<Note | null> {
    const encodedUserId = encodeURIComponent(USER_ID);
    const url = `${SUPABASE_URL}/notes?id=eq.${noteId}&user_id=eq.${encodedUserId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const notes = await handleResponse<Note[]>(response);
    return notes.length > 0 ? notes[0] : null;
  },

  /**
   * Create a new note
   */
  async createNote(data: NoteCreate): Promise<Note> {
    const url = `${SUPABASE_URL}/notes`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });

    const notes = await handleResponse<Note[]>(response);
    return notes[0];
  },

  /**
   * Update an existing note
   */
  async updateNote(noteId: string, data: NoteUpdate): Promise<Note> {
    const encodedUserId = encodeURIComponent(USER_ID);
    const url = `${SUPABASE_URL}/notes?id=eq.${noteId}&user_id=eq.${encodedUserId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({
        ...data,
        modified_at: new Date().toISOString(),
      }),
    });

    const notes = await handleResponse<Note[]>(response);
    if (notes.length === 0) {
      throw new ApiError('Note not found or unauthorized', 404);
    }
    return notes[0];
  },

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    const encodedUserId = encodeURIComponent(USER_ID);
    const url = `${SUPABASE_URL}/notes?id=eq.${noteId}&user_id=eq.${encodedUserId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    await handleResponse<void>(response);
  },

  /**
   * Check if online by pinging the API
   */
  async checkConnection(): Promise<boolean> {
    try {
      const encodedUserId = encodeURIComponent(USER_ID);
      const url = `${SUPABASE_URL}/notes?user_id=eq.${encodedUserId}&limit=1`;

      const response = await fetch(url, {
        method: 'HEAD',
        headers: getHeaders(),
      });

      return response.ok;
    } catch {
      return false;
    }
  },
};

export default api;
