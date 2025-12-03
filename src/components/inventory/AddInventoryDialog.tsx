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

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  // If no trigger provided, use default button with onClick directly attached
  const defaultTrigger = (
    <Button onClick={handleOpen}>
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  );

  // Clone the trigger and inject onClick directly
  const triggerElement = trigger 
    ? React.cloneElement(trigger as React.ReactElement, { onClick: handleOpen })
    : defaultTrigger;

  return (
    <>
      {triggerElement}
      
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
