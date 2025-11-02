import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface InlineTextEditorProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
}

export const InlineTextEditor = ({
  value,
  onSave,
  onCancel,
  multiline = false,
  placeholder = 'Click to edit...',
}: InlineTextEditorProps) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="relative inline-block w-full">
      {multiline ? (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[100px] text-sm"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full text-sm"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div className="flex gap-1 mt-2">
        <Button size="sm" onClick={handleSave} className="h-7">
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="h-7">
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        {multiline && (
          <span className="text-xs text-muted-foreground ml-2 flex items-center">
            Ctrl+Enter to save
          </span>
        )}
      </div>
    </div>
  );
};
