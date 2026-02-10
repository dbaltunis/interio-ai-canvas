import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LeftoverCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leftovers: any[];
  projectId: string;
  projectName: string;
}

export const LeftoverCaptureDialog = ({
  open,
  onOpenChange,
  leftovers,
  projectId,
  projectName,
}: LeftoverCaptureDialogProps) => {
  if (!leftovers || leftovers.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leftover Materials - {projectName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The following leftover materials were identified from this project.
          </p>
          <div className="space-y-2">
            {leftovers.map((leftover: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{leftover.name || 'Material'}</p>
                  <p className="text-xs text-muted-foreground">
                    {leftover.quantity || 0} {leftover.unit || 'units'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Skip
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Save to Inventory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
