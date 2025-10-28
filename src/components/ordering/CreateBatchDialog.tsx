import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateBatchOrder, useAddItemsToBatch } from "@/hooks/useBatchOrders";
import { useMaterialQueue } from "@/hooks/useMaterialQueue";

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemIds?: string[];
  onSuccess?: () => void;
}

export const CreateBatchDialog = ({ open, onOpenChange, selectedItemIds = [], onSuccess }: CreateBatchDialogProps) => {
  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState<Date>();
  const [notes, setNotes] = useState("");

  const { data: suppliers } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: queueItems } = useMaterialQueue({ status: 'pending' });
  const createBatch = useCreateBatchOrder();
  const addItems = useAddItemsToBatch();

  const selectedMaterials = queueItems?.filter(item => selectedItemIds.includes(item.id)) || [];

  // Auto-select supplier if all selected items have the same supplier
  useEffect(() => {
    if (selectedMaterials.length > 0) {
      const supplierIds = [...new Set(selectedMaterials.map(m => m.supplier_id).filter(Boolean))];
      if (supplierIds.length === 1 && supplierIds[0]) {
        setSupplierId(supplierIds[0]);
      }
    }
  }, [selectedMaterials]);

  const totalAmount = selectedMaterials.reduce((sum, item) => sum + Number(item.total_cost || 0), 0);

  const handleCreate = async () => {
    if (!supplierId) {
      return;
    }

    try {
      // Create batch order
      const batch = await createBatch.mutateAsync({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        supplier_id: supplierId,
        status: 'draft',
        order_schedule_date: orderDate?.toISOString().split('T')[0],
        notes,
      });

      // Add selected items to batch
      if (selectedItemIds.length > 0 && batch) {
        const batchItems = selectedMaterials.map(item => ({
          material_queue_id: item.id,
          quote_id: item.quote_id,
          project_id: item.project_id,
          client_name: item.clients?.name,
          material_name: item.material_name,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_cost,
        }));

        await addItems.mutateAsync({
          batchId: batch.id,
          items: batchItems,
        });
      }

      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setSupplierId("");
      setOrderDate(undefined);
      setNotes("");
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Batch Order</DialogTitle>
          <DialogDescription>
            Group materials for ordering from a supplier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Date */}
          <div className="space-y-2">
            <Label>Order Schedule Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !orderDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {orderDate ? format(orderDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={orderDate}
                  onSelect={setOrderDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Items Summary */}
          {selectedMaterials.length > 0 && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <Label>Selected Materials ({selectedMaterials.length})</Label>
              <div className="space-y-1 text-sm">
                {selectedMaterials.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.material_name}</span>
                    <span className="text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
                {selectedMaterials.length > 5 && (
                  <div className="text-muted-foreground">
                    +{selectedMaterials.length - 5} more items
                  </div>
                )}
              </div>
              <div className="pt-2 border-t flex justify-between font-medium">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes for Supplier</Label>
            <Textarea
              placeholder="Add any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!supplierId || createBatch.isPending || addItems.isPending}
            >
              {createBatch.isPending || addItems.isPending ? 'Creating...' : 'Create Batch Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
