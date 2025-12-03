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

  // Render trigger with wrapper that captures clicks before they bubble to Card
  const renderTrigger = () => {
    if (!trigger) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(true);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      );
    }

    // Wrap trigger in a span that captures clicks BEFORE they bubble to Card
    return (
      <span 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        onClickCapture={(e) => {
          e.stopPropagation();
        }}
        className="inline-flex"
      >
        {trigger}
      </span>
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
