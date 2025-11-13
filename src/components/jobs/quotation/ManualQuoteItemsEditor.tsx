import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuoteItems } from "@/hooks/useQuoteItems";
import { formatCurrency } from "@/utils/currency";

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ManualQuoteItemsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  currency?: string;
  initialSubtotal?: number;
  initialTaxRate?: number;
  initialTaxAmount?: number;
  initialTotal?: number;
  initialNotes?: string;
  onSave: (data: {
    items: QuoteItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes: string;
  }) => Promise<void>;
}

const SortableItem = ({ item, onUpdate, onDelete }: { 
  item: QuoteItem; 
  onUpdate: (id: string, updates: Partial<QuoteItem>) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-4 border rounded-lg bg-background/50"
    >
      <button
        className="cursor-grab active:cursor-grabbing mt-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex-1 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Product/Service</Label>
            <Input
              value={item.name}
              onChange={(e) => onUpdate(item.id, { name: e.target.value })}
              placeholder="Item name"
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Description (Optional)</Label>
            <Input
              value={item.description || ""}
              onChange={(e) => onUpdate(item.id, { description: e.target.value })}
              placeholder="Item description"
              className="h-9"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Quantity</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.quantity}
              onChange={(e) => {
                const quantity = parseFloat(e.target.value) || 0;
                const total = quantity * item.unit_price;
                onUpdate(item.id, { quantity, total_price: total });
              }}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Unit Price</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) => {
                const unitPrice = parseFloat(e.target.value) || 0;
                const total = item.quantity * unitPrice;
                onUpdate(item.id, { unit_price: unitPrice, total_price: total });
              }}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Total</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.total_price}
              onChange={(e) => onUpdate(item.id, { total_price: parseFloat(e.target.value) || 0 })}
              className="h-9 font-medium"
            />
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const ManualQuoteItemsEditor: React.FC<ManualQuoteItemsEditorProps> = ({
  open,
  onOpenChange,
  quoteId,
  currency = 'GBP',
  initialSubtotal = 0,
  initialTaxRate = 0,
  initialTaxAmount = 0,
  initialTotal = 0,
  initialNotes = '',
  onSave,
}) => {
  const { toast } = useToast();
  const { items: existingItems, saveItems } = useQuoteItems(quoteId);
  
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [manualSubtotal, setManualSubtotal] = useState<number | null>(null);
  const [taxRate, setTaxRate] = useState(initialTaxRate);
  const [manualTaxAmount, setManualTaxAmount] = useState<number | null>(null);
  const [manualTotal, setManualTotal] = useState<number | null>(null);
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [useAutoCalculation, setUseAutoCalculation] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (existingItems && existingItems.length > 0) {
      setItems(existingItems.map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || 0,
      })));
    } else if (initialSubtotal > 0) {
      // Create a single item from the initial values
      setItems([{
        id: crypto.randomUUID(),
        name: 'Quote Item',
        description: '',
        quantity: 1,
        unit_price: initialSubtotal,
        total_price: initialSubtotal,
      }]);
    }
  }, [existingItems, initialSubtotal, open]);

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const subtotal = manualSubtotal !== null ? manualSubtotal : calculatedSubtotal;
  const calculatedTaxAmount = subtotal * taxRate;
  const taxAmount = manualTaxAmount !== null ? manualTaxAmount : calculatedTaxAmount;
  const calculatedTotal = subtotal + taxAmount;
  const total = manualTotal !== null ? manualTotal : calculatedTotal;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    // Validate items
    const invalidItems = items.filter(item => !item.name.trim());
    if (invalidItems.length > 0) {
      toast({
        title: "Validation Error",
        description: "All items must have a name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save items to quote_items table
      await saveItems.mutateAsync({
        quoteId,
        items: items.map(item => ({
          quote_id: quoteId,
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      });

      // Save totals and notes to parent
      await onSave({
        items,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes,
      });

      toast({
        title: "Quote Saved",
        description: "Quote items and details have been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Quote Items & Details</DialogTitle>
          <DialogDescription>
            Manually edit line items, quantities, prices, and all invoice details. Changes are auto-calculated unless you override them.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Line Items</Label>
                <Button onClick={handleAddItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No items yet. Click "Add Item" to get started.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {items.map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onUpdate={handleUpdateItem}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <Separator />

            {/* Totals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Totals & Tax</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-calc"
                    checked={useAutoCalculation}
                    onCheckedChange={(checked) => {
                      setUseAutoCalculation(checked);
                      if (checked) {
                        setManualSubtotal(null);
                        setManualTaxAmount(null);
                        setManualTotal(null);
                      }
                    }}
                  />
                  <Label htmlFor="auto-calc" className="text-sm text-muted-foreground cursor-pointer">
                    Auto-calculate
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Subtotal</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={useAutoCalculation ? calculatedSubtotal.toFixed(2) : (manualSubtotal !== null ? manualSubtotal : subtotal)}
                    onChange={(e) => !useAutoCalculation && setManualSubtotal(parseFloat(e.target.value) || 0)}
                    disabled={useAutoCalculation}
                    className="h-9 font-medium"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(subtotal, currency)}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Tax Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate * 100}
                    onChange={(e) => setTaxRate((parseFloat(e.target.value) || 0) / 100)}
                    className="h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs">Tax Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={useAutoCalculation ? calculatedTaxAmount.toFixed(2) : (manualTaxAmount !== null ? manualTaxAmount : taxAmount)}
                    onChange={(e) => !useAutoCalculation && setManualTaxAmount(parseFloat(e.target.value) || 0)}
                    disabled={useAutoCalculation}
                    className="h-9"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(taxAmount, currency)}
                  </p>
                </div>

                <div>
                  <Label className="text-xs">Total</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={useAutoCalculation ? calculatedTotal.toFixed(2) : (manualTotal !== null ? manualTotal : total)}
                    onChange={(e) => !useAutoCalculation && setManualTotal(parseFloat(e.target.value) || 0)}
                    disabled={useAutoCalculation}
                    className="h-9 font-bold text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(total, currency)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes Section */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special notes or terms for this quote..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || items.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Quote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
