import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InventoryDeductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deductions?: any[];
  projectId?: string;
}

export const InventoryDeductionDialog = ({
  open,
  onOpenChange,
  deductions = [],
  projectId,
}: InventoryDeductionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inventory Deductions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Review materials to be deducted from inventory for this project.
          </p>
          {deductions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No deductions needed.
            </p>
          ) : (
            <div className="space-y-2">
              {deductions.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.name || 'Item'}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Confirm Deductions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
