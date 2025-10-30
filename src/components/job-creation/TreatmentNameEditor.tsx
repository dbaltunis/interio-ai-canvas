import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TreatmentNameEditorProps {
  treatmentName: string;
  onSave: (name: string) => void;
  className?: string;
  readOnly?: boolean;
}

export const TreatmentNameEditor: React.FC<TreatmentNameEditorProps> = ({
  treatmentName,
  onSave,
  className = '',
  readOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(treatmentName);

  const handleSave = () => {
    if (editValue.trim() && editValue !== treatmentName) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(treatmentName);
    setIsEditing(false);
  };

  if (readOnly) {
    return <span className={`font-semibold ${className}`}>{treatmentName}</span>;
  }

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
        className={`h-8 font-semibold ${className}`}
        autoFocus
      />
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <span className="font-semibold">{treatmentName}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
};
