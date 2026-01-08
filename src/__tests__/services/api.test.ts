import { api, ApiError } from '@/services/api';

// Mock the constants
jest.mock('@/lib/constants', () => ({
  SUPABASE_URL: 'https://test.supabase.co/rest/v1',
  SUPABASE_ANON_KEY: 'test-key',
  USER_ID: 'test@example.com',
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchNotes', () => {
    it('should fetch notes successfully', async () => {
      const mockNotes = [
        {
          id: '1',
          user_id: 'test@example.com',
          title: 'Test Note',
          content: 'Test content',
          created_at: '2026-01-08T00:00:00.000Z',
          modified_at: '2026-01-08T00:00:00.000Z',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockNotes),
      });

      const result = await api.fetchNotes();

      expect(result).toEqual(mockNotes);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should throw ApiError on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid API key' }),
      });

      await expect(api.fetchNotes()).rejects.toThrow(ApiError);
    });
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const newNote = {
        user_id: 'test@example.com',
        title: 'New Note',
        content: 'New content',
        modified_at: '2026-01-08T00:00:00.000Z',
      };

      const createdNote = {
        ...newNote,
        id: '123',
        created_at: '2026-01-08T00:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve([createdNote]),
      });

      const result = await api.createNote(newNote);

      expect(result).toEqual(createdNote);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newNote),
        })
      );
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updatedNote = {
        id: '123',
        user_id: 'test@example.com',
        title: 'Updated Title',
        content: 'Updated content',
        created_at: '2026-01-08T00:00:00.000Z',
        modified_at: '2026-01-08T01:00:00.000Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([updatedNote]),
      });

      const result = await api.updateNote('123', updateData);

      expect(result).toEqual(updatedNote);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=eq.123'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should throw error if note not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      await expect(api.updateNote('nonexistent', {})).rejects.toThrow(
        'Note not found or unauthorized'
      );
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(api.deleteNote('123')).resolves.not.toThrow();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=eq.123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('checkConnection', () => {
    it('should return true when online', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const result = await api.checkConnection();
      expect(result).toBe(true);
    });

    it('should return false when offline', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await api.checkConnection();
      expect(result).toBe(false);
    });
  });
});

describe('ApiError', () => {
  it('should create an error with status and code', () => {
    const error = new ApiError('Test error', 404, 'NOT_FOUND');

    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.name).toBe('ApiError');
  });
});
