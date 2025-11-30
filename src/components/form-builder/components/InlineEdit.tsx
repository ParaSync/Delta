/**
 * Inline editable text component for form builder
 * Allows editing text directly in the canvas while keeping properties panel sync
 */

import { useState, useRef, useEffect, useCallback } from 'react';

interface InlineEditProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'label';
  disabled?: boolean;
}

export function InlineEdit({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit...',
  as: Component = 'span',
  disabled = false,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      setIsEditing(true);
    },
    [disabled]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  }, [editValue, value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Stop propagation for all keys to prevent parent handlers from interfering
      e.stopPropagation();
      
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBlur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditValue(value);
        setIsEditing(false);
      }
    },
    [handleBlur, value]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-transparent border-none outline-none ring-1 ring-primary rounded px-1 -mx-1 w-full ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Component
      onDoubleClick={handleDoubleClick}
      className={`cursor-text hover:bg-primary/5 rounded px-1 -mx-1 transition-colors ${className}`}
      title="Double-click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </Component>
  );
}

interface InlineEditTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEditTextarea({
  value,
  onChange,
  className = '',
  placeholder = 'Click to edit...',
  disabled = false,
}: InlineEditTextareaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      setIsEditing(true);
    },
    [disabled]
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  }, [editValue, value, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Stop propagation for all keys to prevent parent handlers from interfering
      e.stopPropagation();
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditValue(value);
        setIsEditing(false);
      }
    },
    [value]
  );

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-transparent border-none outline-none ring-1 ring-primary rounded px-1 -mx-1 w-full min-h-[60px] resize-y ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <p
      onDoubleClick={handleDoubleClick}
      className={`cursor-text hover:bg-primary/5 rounded px-1 -mx-1 transition-colors whitespace-pre-wrap ${className}`}
      title="Double-click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </p>
  );
}
