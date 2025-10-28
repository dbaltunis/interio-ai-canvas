import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateBatchOrder } from "@/hooks/useBatchOrders";
import { useAddTrackingUpdate } from "@/hooks/useOrderTracking";
import { toast } from "sonner";
import { Mail, FileText, Loader2 } from "lucide-react";

interface SendBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchOrder: any;
  onSuccess?: () => void;
}

export const SendBatchDialog = ({ open, onOpenChange, batchOrder, onSuccess }: SendBatchDialogProps) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const updateBatch = useUpdateBatchOrder();
  const addTracking = useAddTrackingUpdate();

  const handleSend = async () => {
    try {
      // Update batch order status
      await updateBatch.mutateAsync({
        id: batchOrder.id,
        updates: {
          status: 'sent',
          sent_date: new Date().toISOString(),
          tracking_number: trackingNumber || undefined,
        }
      });

      // Add tracking history
      await addTracking.mutateAsync({
        batch_order_id: batchOrder.id,
        status: 'sent',
        notes: additionalNotes || 'Order sent to supplier',
      });

      // TODO: Send email to supplier if enabled
      if (sendEmail && batchOrder.suppliers?.email) {
        toast.info("Email notification feature coming soon");
      }

      toast.success("Batch order sent successfully");
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setTrackingNumber("");
      setAdditionalNotes("");
    } catch (error) {
      console.error('Failed to send batch:', error);
      toast.error("Failed to send batch order");
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // TODO: Implement PDF generation
      toast.info("PDF generation feature coming soon");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!batchOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Batch Order</DialogTitle>
          <DialogDescription>
            Send batch order #{batchOrder.batch_number} to {batchOrder.suppliers?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Supplier:</span>
              <span className="font-medium">{batchOrder.suppliers?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items:</span>
              <span className="font-medium">{batchOrder.total_items || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium">${Number(batchOrder.total_amount || 0).toFixed(2)}</span>
            </div>
            {batchOrder.suppliers?.email && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{batchOrder.suppliers.email}</span>
              </div>
            )}
          </div>

          {/* Tracking Number */}
          <div className="space-y-2">
            <Label>Tracking Number (Optional)</Label>
            <Input
              placeholder="Enter tracking number if available"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Add any additional notes for the supplier..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Email Option */}
          {batchOrder.suppliers?.email && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(!!checked)}
              />
              <label
                htmlFor="send-email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send email notification to supplier
              </label>
            </div>
          )}

          {/* Generate PDF */}
          <Button
            variant="outline"
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            className="w-full"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Preview & Download PDF
              </>
            )}
          </Button>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={updateBatch.isPending || addTracking.isPending}
            >
              {updateBatch.isPending || addTracking.isPending ? 'Sending...' : 'Send to Supplier'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
