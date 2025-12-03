import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { usePersistedDialogState } from "@/hooks/usePersistedDialogState";

interface EditInventoryDialogProps {
  item: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const EditInventoryDialog = ({ item, trigger, onSuccess }: EditInventoryDialogProps) => {
  const [open, setOpen] = usePersistedDialogState(`edit_inventory_${item?.id}`);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  // Clone trigger and merge click handlers
  const renderTrigger = () => {
    if (!trigger) {
      return (
        <Button variant="outline" size="sm" onClick={handleTriggerClick}>
          <Edit className="h-4 w-4" />
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
        mode="edit"
        item={item}
        onSuccess={onSuccess}
      />
    </>
  );
};
