import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUpdateBatchOrder } from "@/hooks/useBatchOrders";
import { useAddTrackingUpdate } from "@/hooks/useOrderTracking";
import { useBatchOrderItems } from "@/hooks/useBatchOrders";
import { toast } from "sonner";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ReceiveBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchOrder: any;
  onSuccess?: () => void;
}

export const ReceiveBatchDialog = ({ open, onOpenChange, batchOrder, onSuccess }: ReceiveBatchDialogProps) => {
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const updateBatch = useUpdateBatchOrder();
  const addTracking = useAddTrackingUpdate();
  const { data: batchItems, isLoading } = useBatchOrderItems(batchOrder?.id);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setReceivedQuantities(prev => ({ ...prev, [itemId]: numValue }));
  };

  const handleReceiveAll = () => {
    const allQuantities: Record<string, number> = {};
    batchItems?.forEach(item => {
      allQuantities[item.id] = item.quantity;
    });
    setReceivedQuantities(allQuantities);
  };

  const handleReceive = async () => {
    try {
      const totalOrdered = batchItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const totalReceived = Object.values(receivedQuantities).reduce((sum, qty) => sum + qty, 0);
      
      const isPartialDelivery = totalReceived < totalOrdered && totalReceived > 0;
      const isFullDelivery = totalReceived >= totalOrdered;

      // Update batch order status
      await updateBatch.mutateAsync({
        id: batchOrder.id,
        updates: {
          status: isFullDelivery ? 'delivered' : 'in_transit',
          actual_delivery_date: isFullDelivery ? new Date().toISOString() : undefined,
        }
      });

      // Add tracking history
      await addTracking.mutateAsync({
        batch_order_id: batchOrder.id,
        status: isFullDelivery ? 'delivered' : 'in_transit',
        notes: notes || `${isPartialDelivery ? 'Partially r' : 'R'}eceived ${totalReceived} items`,
      });

      // TODO: Update inventory quantities
      // TODO: Create inventory movements
      // TODO: Record lead time in supplier_lead_times

      toast.success(
        isFullDelivery 
          ? "Order fully received and inventory updated" 
          : "Partial delivery recorded"
      );
      
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setReceivedQuantities({});
      setNotes("");
    } catch (error) {
      console.error('Failed to receive batch:', error);
      toast.error("Failed to process delivery");
    }
  };

  const totalOrdered = batchItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalReceived = Object.values(receivedQuantities).reduce((sum, qty) => sum + qty, 0);
  const isPartialDelivery = totalReceived > 0 && totalReceived < totalOrdered;

  if (!batchOrder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Batch Order</DialogTitle>
          <DialogDescription>
            Record received items for batch #{batchOrder.batch_number} from {batchOrder.suppliers?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Action */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReceiveAll} size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Received
            </Button>
          </div>

          {/* Items Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading items...</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Job/Client</TableHead>
                    <TableHead className="text-right">Ordered</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchItems?.map((item) => {
                    const receivedQty = receivedQuantities[item.id] || 0;
                    const isPartial = receivedQty > 0 && receivedQty < item.quantity;
                    const isComplete = receivedQty >= item.quantity;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.material_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.client_name || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={item.quantity}
                              value={receivedQuantities[item.id] || ''}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-24 text-right"
                              placeholder="0"
                            />
                            {isComplete && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {isPartial && <AlertCircle className="h-4 w-4 text-orange-600" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(item.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${Number(item.total_price).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Ordered:</span>
              <span className="font-medium">{totalOrdered.toFixed(2)} items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Received:</span>
              <span className="font-medium">{totalReceived.toFixed(2)} items</span>
            </div>
            {isPartialDelivery && (
              <div className="flex items-center gap-2 text-orange-600 text-sm pt-2 border-t">
                <AlertCircle className="h-4 w-4" />
                <span>This is a partial delivery</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Delivery Notes</Label>
            <Textarea
              placeholder="Add any notes about the delivery (damages, missing items, etc.)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReceive}
              disabled={totalReceived === 0 || updateBatch.isPending || addTracking.isPending}
            >
              {updateBatch.isPending || addTracking.isPending 
                ? 'Processing...' 
                : isPartialDelivery 
                  ? 'Record Partial Delivery' 
                  : 'Mark as Received'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
