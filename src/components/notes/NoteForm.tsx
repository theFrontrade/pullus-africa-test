'use client';

import { useState, useEffect, FormEvent } from 'react';
import { LocalNote, NoteFormData, NOTE_CONSTRAINTS } from '@/types';
import { Button, Input, Textarea } from '@/components/ui';

interface NoteFormProps {
  initialData?: LocalNote;
  onSubmit: (data: NoteFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const NoteForm = ({ initialData, onSubmit, onCancel, isLoading }: NoteFormProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const isEditing = !!initialData;

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      setTitle('');
      setContent('');
    }
    setErrors({});
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > NOTE_CONSTRAINTS.TITLE_MAX_LENGTH) {
      newErrors.title = `Title must be ${NOTE_CONSTRAINTS.TITLE_MAX_LENGTH} characters or less`;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length > NOTE_CONSTRAINTS.CONTENT_MAX_LENGTH) {
      newErrors.content = `Content must be ${NOTE_CONSTRAINTS.CONTENT_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
    });
  };

  const titleCharsRemaining = NOTE_CONSTRAINTS.TITLE_MAX_LENGTH - title.length;
  const contentCharsRemaining = NOTE_CONSTRAINTS.CONTENT_MAX_LENGTH - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Enter note title..."
        maxLength={NOTE_CONSTRAINTS.TITLE_MAX_LENGTH}
        helperText={
          titleCharsRemaining <= 20
            ? `${titleCharsRemaining} characters remaining`
            : undefined
        }
        disabled={isLoading}
        autoFocus
      />

      <Textarea
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        placeholder="Write your note content..."
        rows={8}
        maxLength={NOTE_CONSTRAINTS.CONTENT_MAX_LENGTH}
        helperText={
          contentCharsRemaining <= 100
            ? `${contentCharsRemaining} characters remaining`
            : undefined
        }
        disabled={isLoading}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isEditing ? 'Save Changes' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
};

export { NoteForm };
export default NoteForm;
