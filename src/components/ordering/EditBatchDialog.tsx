import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUpdateBatchOrder, useAddItemsToBatch, useBatchOrderItems } from "@/hooks/useBatchOrders";
import { useMaterialQueue } from "@/hooks/useMaterialQueue";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface EditBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchOrder: any;
  onSuccess?: () => void;
}

export const EditBatchDialog = ({ open, onOpenChange, batchOrder, onSuccess }: EditBatchDialogProps) => {
  const [supplierId, setSupplierId] = useState(batchOrder?.supplier_id || "");
  const [orderDate, setOrderDate] = useState<Date | undefined>(
    batchOrder?.order_schedule_date ? new Date(batchOrder.order_schedule_date) : undefined
  );
  const [notes, setNotes] = useState(batchOrder?.notes || "");
  const [showAddMaterials, setShowAddMaterials] = useState(false);
  const [selectedNewItems, setSelectedNewItems] = useState<string[]>([]);

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
  const { data: currentItems } = useBatchOrderItems(batchOrder?.id);
  const updateBatch = useUpdateBatchOrder();
  const addItems = useAddItemsToBatch();

  // Reset form when batch changes
  useEffect(() => {
    if (batchOrder) {
      setSupplierId(batchOrder.supplier_id || "");
      setOrderDate(batchOrder.order_schedule_date ? new Date(batchOrder.order_schedule_date) : undefined);
      setNotes(batchOrder.notes || "");
    }
  }, [batchOrder]);

  const handleUpdate = async () => {
    try {
      await updateBatch.mutateAsync({
        id: batchOrder.id,
        updates: {
          supplier_id: supplierId || null,
          order_schedule_date: orderDate?.toISOString().split('T')[0],
          notes,
        },
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update batch:', error);
    }
  };

  const handleAddMaterials = async () => {
    if (selectedNewItems.length === 0) {
      toast.error('Please select materials to add');
      return;
    }

    const selectedMaterials = queueItems?.filter(item => selectedNewItems.includes(item.id)) || [];
    
    try {
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
        batchId: batchOrder.id,
        items: batchItems,
      });

      setSelectedNewItems([]);
      setShowAddMaterials(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add materials:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const item = currentItems?.find(i => i.id === itemId);
      
      // Delete from batch_order_items
      const { error: deleteError } = await supabase
        .from('batch_order_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      // Update queue item status back to pending
      if (item?.material_queue_id) {
        await supabase
          .from('material_order_queue')
          .update({ status: 'pending' })
          .eq('id', item.material_queue_id);
      }

      toast.success('Material removed from batch');
      onSuccess?.();
    } catch (error: any) {
      toast.error('Failed to remove material: ' + error.message);
    }
  };

  const toggleNewItemSelection = (itemId: string) => {
    setSelectedNewItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const availableItems = queueItems?.filter(item => {
    // If batch has a supplier, only show items from that supplier or items without supplier
    if (supplierId) {
      return !item.supplier_id || item.supplier_id === supplierId;
    }
    return true;
  }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Batch Order - {batchOrder?.batch_number}</DialogTitle>
          <DialogDescription>
            Modify batch details or add/remove materials
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier (optional for stock items)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Supplier (Stock/Internal)</SelectItem>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Leave empty or select "No Supplier" for stock items that don't need ordering
              </p>
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

            {/* Current Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Materials in Batch ({currentItems?.length || 0})</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddMaterials(!showAddMaterials)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Materials
                </Button>
              </div>

              <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                {currentItems?.map((item: any) => {
                  const project = item.material_order_queue?.projects;
                  const client = item.material_order_queue?.clients;
                  
                  return (
                    <div key={item.id} className="p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{item.material_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit} @ ${item.unit_price?.toFixed(2)} = ${item.total_price?.toFixed(2)}
                          </div>
                          {(project || client) && (
                            <div className="text-xs text-muted-foreground">
                              {project && <span>Job: {project.job_number}</span>}
                              {project && client && <span> • </span>}
                              {client && <span>Client: {client.name}</span>}
                            </div>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {!currentItems || currentItems.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No materials in this batch yet
                  </div>
                ) : null}
              </div>
            </div>

            {/* Add Materials Section */}
            {showAddMaterials && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label>Available Materials ({availableItems.length})</Label>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setShowAddMaterials(false);
                      setSelectedNewItems([]);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="border rounded-lg bg-background h-[250px]">
                  <div className="divide-y">
                    {availableItems.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No materials available to add
                      </div>
                    ) : (
                      availableItems.map((item) => {
                        const project = item.projects;
                        const client = item.clients;
                        
                        return (
                          <div
                            key={item.id}
                            className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleNewItemSelection(item.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedNewItems.includes(item.id)}
                                onCheckedChange={() => toggleNewItemSelection(item.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 space-y-1">
                                <div className="font-medium">{item.material_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} {item.unit} @ ${item.unit_cost?.toFixed(2)}
                                </div>
                                {(project || client) && (
                                  <div className="text-xs text-muted-foreground">
                                    {project && <span>Job: {project.job_number}</span>}
                                    {project && client && <span> • </span>}
                                    {client && <span>Client: {client.name}</span>}
                                  </div>
                                )}
                                {item.supplier_id && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {item.vendors?.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {selectedNewItems.length > 0 && (
                  <Button
                    onClick={handleAddMaterials}
                    disabled={addItems.isPending}
                    className="w-full"
                  >
                    {addItems.isPending ? 'Adding...' : `Add ${selectedNewItems.length} Material${selectedNewItems.length > 1 ? 's' : ''}`}
                  </Button>
                )}
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
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={updateBatch.isPending}
          >
            {updateBatch.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
