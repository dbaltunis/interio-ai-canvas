import React, { useState, useEffect } from "react";
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

  // Sync local state with prop changes
  useEffect(() => {
    setEditName(windowName);
  }, [windowName]);

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
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              handleCancel();
            }
          }}
          className="h-6 text-xs font-semibold flex-1 min-w-0 bg-background border-input"
          autoFocus
          placeholder="Enter design name"
        />
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur from firing
            handleSave();
          }}
          className="h-6 w-6 p-0 hover:bg-transparent text-green-600 hover:text-green-700 shrink-0"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur from firing
            handleCancel();
          }}
          className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span className="text-xs font-semibold truncate flex-1">{windowName}</span>
      {!disabled && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0 hover:bg-transparent opacity-60 hover:opacity-100 shrink-0"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};