import { NOTE_CONSTRAINTS } from '@/types/note';

describe('Note Constraints', () => {
  it('should have correct title max length', () => {
    expect(NOTE_CONSTRAINTS.TITLE_MAX_LENGTH).toBe(100);
  });

  it('should have correct content max length', () => {
    expect(NOTE_CONSTRAINTS.CONTENT_MAX_LENGTH).toBe(5000);
  });
});
