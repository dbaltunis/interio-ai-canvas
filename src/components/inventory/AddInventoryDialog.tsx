import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";

interface AddInventoryDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const AddInventoryDialog = ({ trigger, onSuccess }: AddInventoryDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      )}
      
      <UnifiedInventoryDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        onSuccess={onSuccess}
      />
    </>
  );
};
