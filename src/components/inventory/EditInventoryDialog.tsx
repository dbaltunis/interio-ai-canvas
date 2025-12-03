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
    setOpen(true);
  };

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger as React.ReactElement, {
          onClick: handleTriggerClick
        })
      ) : (
        <Button variant="outline" size="sm" onClick={handleTriggerClick}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
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
