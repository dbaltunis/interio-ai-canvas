import { useState } from "react";
import { DialogTrigger } from "@/components/ui/dialog";
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
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      
      <UnifiedInventoryDialog
        open={open}
        onOpenChange={setOpen}
        mode="create"
        onSuccess={onSuccess}
      />
    </>
  );
};
