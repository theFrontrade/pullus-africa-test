'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700  mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg shadow-sm transition-colors resize-none',
            'focus:outline-none  focus:ring-green-500 focus:border-green-500',
            '',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : '',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 ">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 ">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
