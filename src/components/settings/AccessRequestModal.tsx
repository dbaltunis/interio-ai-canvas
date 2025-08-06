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
import { useCreateAccessRequest } from "@/hooks/useAccessRequests";

interface AccessRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordType: string;
  recordId: string;
  approverId: string;
  recordTitle?: string;
}

export const AccessRequestModal = ({
  open,
  onOpenChange,
  recordType,
  recordId,
  approverId,
  recordTitle,
}: AccessRequestModalProps) => {
  const [reason, setReason] = useState("");
  const createAccessRequest = useCreateAccessRequest();

  const handleSubmit = async () => {
    await createAccessRequest.mutateAsync({
      approver_id: approverId,
      record_type: recordType,
      record_id: recordId,
      request_reason: reason,
    });
    
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Edit Access</DialogTitle>
          <DialogDescription>
            Request permission to edit {recordTitle ? `"${recordTitle}"` : `this ${recordType}`}.
            The account owner will be notified of your request.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for access (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Briefly explain why you need edit access..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createAccessRequest.isPending}
          >
            {createAccessRequest.isPending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};