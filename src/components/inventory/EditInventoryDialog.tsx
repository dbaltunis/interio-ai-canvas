import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";

interface EditInventoryDialogProps {
  item: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const EditInventoryDialog = ({ item, trigger, onSuccess }: EditInventoryDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setOpen(false);
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
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
      
      {open && (
        <UnifiedInventoryDialog
          open={open}
          onOpenChange={handleOpenChange}
          mode="edit"
          item={item}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};
