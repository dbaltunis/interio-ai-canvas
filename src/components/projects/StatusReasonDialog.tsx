import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface StatusReasonDialogProps {
  isOpen: boolean;
  statusName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const StatusReasonDialog = ({
  isOpen,
  statusName,
  onConfirm,
  onCancel,
  isLoading = false,
}: StatusReasonDialogProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason("");
    }
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md z-[10001]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Reason Required
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for changing the status to "{statusName}".
            This will be recorded in the project history.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for this status change..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
