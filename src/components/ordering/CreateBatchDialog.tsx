
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Truck, Globe, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useVendors, useCreateVendor } from "@/hooks/useVendors";
import { useAllSupplierIntegrations } from "@/hooks/useActiveSupplierIntegrations";
import { useCreateBatchOrder, useAddItemsToBatch } from "@/hooks/useBatchOrders";
import { useMaterialQueue } from "@/hooks/useMaterialQueue";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemIds?: string[];
  onSuccess?: () => void;
}

// Industry-standard order methods following TWC, RFMS, NetSuite workflows
const ORDER_METHODS = [
  { value: 'api', label: 'API (Automated)' },
  { value: 'email', label: 'Email Order' },
  { value: 'portal', label: 'Supplier Portal' },
  { value: 'phone', label: 'Phone Order' },
  { value: 'fax', label: 'Fax Order' },
] as const;

export const CreateBatchDialog = ({ open, onOpenChange, selectedItemIds = [], onSuccess }: CreateBatchDialogProps) => {
  const [supplierId, setSupplierId] = useState("");
  const [orderDate, setOrderDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [orderMethod, setOrderMethod] = useState("email");
  const [purchaseOrderRef, setPurchaseOrderRef] = useState("");
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");

  const { data: vendors = [] } = useVendors();
  const { data: integrations = [] } = useAllSupplierIntegrations();
  const { data: queueItems } = useMaterialQueue({ status: 'pending' });
  const createBatch = useCreateBatchOrder();
  const addItems = useAddItemsToBatch();
  const createVendor = useCreateVendor();
  const { units } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency);

  // Merge vendors and active integrations into a unified supplier list
  const allSuppliers = useMemo(() => {
    const list: { id: string; name: string; type: 'vendor' | 'integration'; method: string; email?: string }[] = [];

    // Add manual vendors
    vendors.forEach(v => {
      list.push({
        id: v.id,
        name: v.name,
        type: 'vendor',
        method: 'email',
        email: v.email || undefined,
      });
    });

    // Add active supplier integrations (TWC, RFMS, CW Systems, Norman, etc.)
    integrations.forEach(integration => {
      // Don't duplicate if a vendor with the same name exists
      const exists = list.some(s => s.name.toLowerCase() === integration.name.toLowerCase());
      if (!exists) {
        list.push({
          id: `integration-${integration.type}`,
          name: integration.name,
          type: 'integration',
          method: integration.isProduction ? 'api' : 'email',
        });
      }
    });

    return list;
  }, [vendors, integrations]);

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

  // Auto-set order method when supplier changes
  useEffect(() => {
    const selected = allSuppliers.find(s => s.id === supplierId);
    if (selected) {
      setOrderMethod(selected.method);
    }
  }, [supplierId, allSuppliers]);

  const totalAmount = selectedMaterials.reduce((sum, item) => sum + Number(item.total_cost || 0), 0);

  const handleAddVendor = async () => {
    if (!newVendorName.trim()) return;
    try {
      const vendor = await createVendor.mutateAsync({
        name: newVendorName.trim(),
        active: true,
      });
      setSupplierId(vendor.id);
      setNewVendorName('');
      setShowAddVendor(false);
    } catch (error) {
      console.error('Failed to create vendor:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      // For integration-type suppliers, we store null supplier_id
      // and record the integration type in metadata
      const isIntegration = supplierId.startsWith('integration-');
      const actualSupplierId = isIntegration || supplierId === 'none' || !supplierId ? null : supplierId;

      const batch = await createBatch.mutateAsync({
        user_id: effectiveOwnerId,
        supplier_id: actualSupplierId,
        status: 'draft',
        order_schedule_date: orderDate?.toISOString().split('T')[0],
        notes,
        metadata: {
          order_method: orderMethod,
          purchase_order_ref: purchaseOrderRef || undefined,
          integration_type: isIntegration ? supplierId.replace('integration-', '') : undefined,
          supplier_name: allSuppliers.find(s => s.id === supplierId)?.name,
        },
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
      setOrderMethod("email");
      setPurchaseOrderRef("");
    } catch (error) {
      console.error('Failed to create batch:', error);
    }
  };

  const selectedSupplier = allSuppliers.find(s => s.id === supplierId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Batch Order</DialogTitle>
          <DialogDescription>
            Group materials for ordering from a supplier. Supports TWC, RFMS, and manual ordering workflows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Supplier</Label>
              {!showAddVendor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowAddVendor(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New
                </Button>
              )}
            </div>

            {showAddVendor ? (
              <div className="flex gap-2">
                <Input
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="Supplier name"
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVendor()}
                />
                <Button size="sm" onClick={handleAddVendor} disabled={!newVendorName.trim() || createVendor.isPending}>
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowAddVendor(false); setNewVendorName(''); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Supplier (Stock/Internal)</SelectItem>

                  {/* Integrated suppliers */}
                  {integrations.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        Integrated Suppliers
                      </SelectLabel>
                      {allSuppliers.filter(s => s.type === 'integration').map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <span className="flex items-center gap-2">
                            {supplier.name}
                            <Badge variant="outline" className="text-[10px] px-1 py-0">API</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {/* Manual vendors */}
                  {vendors.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-1.5">
                        <Truck className="h-3 w-3" />
                        Your Suppliers
                      </SelectLabel>
                      {allSuppliers.filter(s => s.type === 'vendor').map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            )}

            {allSuppliers.length === 0 && !showAddVendor && (
              <p className="text-xs text-muted-foreground">
                No suppliers found. Add a supplier above, or configure integrations in Settings &rarr; Integrations.
              </p>
            )}
          </div>

          {/* Order Method & PO Reference - industry standard fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order Method</Label>
              <Select value={orderMethod} onValueChange={setOrderMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>PO Reference</Label>
              <Input
                value={purchaseOrderRef}
                onChange={(e) => setPurchaseOrderRef(e.target.value)}
                placeholder="e.g., PO-2026-0001"
              />
            </div>
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
                <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Supplier Info */}
          {selectedSupplier?.type === 'integration' && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300">
                {selectedSupplier.name} - Integrated Ordering
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                Order will be submitted via {selectedSupplier.name} API. Configure credentials in Settings &rarr; Integrations.
              </p>
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
              disabled={createBatch.isPending || addItems.isPending}
            >
              {createBatch.isPending || addItems.isPending ? 'Creating...' : 'Create Batch Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
