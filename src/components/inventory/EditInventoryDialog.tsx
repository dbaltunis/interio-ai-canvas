import { useState } from "react";
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
  // Use stable key to prevent dialog state issues during re-renders
  const itemId = item?.id ?? 'new';
  const [open, setOpen] = usePersistedDialogState(`edit_inventory_${itemId}`);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  const renderTrigger = () => {
    if (!trigger) {
      return (
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <Edit className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <div onClick={handleOpen} className="inline-flex cursor-pointer">
        {trigger}
      </div>
    );
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
