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
  const itemId = item?.id ?? 'new';
  const [open, setOpen] = usePersistedDialogState(`edit_inventory_${itemId}`);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  // If no trigger provided, use default button with onClick directly attached
  const defaultTrigger = (
    <Button variant="outline" size="sm" onClick={handleOpen}>
      <Edit className="h-4 w-4" />
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
        mode="edit"
        item={item}
        onSuccess={onSuccess}
      />
    </>
  );
};
