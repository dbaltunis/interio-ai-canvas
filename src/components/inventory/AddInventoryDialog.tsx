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
    setOpen(true);
  };

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement, {
          onClick: handleTriggerClick
        })
      ) : (
        <Button onClick={handleTriggerClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      )}
      
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
