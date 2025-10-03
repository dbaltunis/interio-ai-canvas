import { useState } from "react";
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

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
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
