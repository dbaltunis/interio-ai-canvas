import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { usePersistedDialogState } from "@/hooks/usePersistedDialogState";

interface AddInventoryDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  initialCategory?: string;
  initialSubcategory?: string;
}

export const AddInventoryDialog = ({ trigger, onSuccess, initialCategory, initialSubcategory }: AddInventoryDialogProps) => {
  const [open, setOpen] = usePersistedDialogState('add_inventory');

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  // Clone trigger and merge click handlers
  const renderTrigger = () => {
    if (!trigger) {
      return (
        <Button onClick={handleTriggerClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      );
    }

    // Get original onClick if it exists
    const originalElement = trigger as React.ReactElement;
    const originalOnClick = originalElement.props?.onClick;

    return React.cloneElement(originalElement, {
      onClick: (e: React.MouseEvent) => {
        // Call original onClick first (for stopPropagation etc)
        if (originalOnClick) {
          originalOnClick(e);
        }
        // Then open the dialog
        e.stopPropagation();
        e.preventDefault();
        setOpen(true);
      }
    });
  };

  return (
    <>
      {renderTrigger()}
      
      <UnifiedInventoryDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        onSuccess={onSuccess}
        initialCategory={initialCategory}
        initialSubcategory={initialSubcategory}
      />
    </>
  );
};
