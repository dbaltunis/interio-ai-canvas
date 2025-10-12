import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

interface WindowRenameButtonProps {
  windowName: string;
  onRename: (newName: string) => void;
  disabled?: boolean;
}

export const WindowRenameButton = ({ windowName, onRename, disabled }: WindowRenameButtonProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(windowName);

  const handleSave = () => {
    if (editName.trim() && editName.trim() !== windowName) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(windowName);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="h-8 text-sm font-semibold"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur from firing
            handleSave();
          }}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur from firing
            handleCancel();
          }}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span className="font-semibold text-lg truncate">{windowName}</span>
      {!disabled && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground transition-opacity"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};