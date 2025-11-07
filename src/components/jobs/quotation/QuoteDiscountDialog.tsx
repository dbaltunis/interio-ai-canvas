import { useState, useEffect } from "react";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuoteDiscount, DiscountConfig } from "@/hooks/useQuoteDiscount";
import { formatCurrency } from "@/utils/formatters";
import { Percent, DollarSign } from "lucide-react";

interface QuoteDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  projectId: string;
  items: any[];
  subtotal: number;
  taxRate: number;
  currency?: string;
  currentDiscount?: {
    type: 'percentage' | 'fixed';
    value: number;
    scope: 'all' | 'fabrics_only' | 'selected_items';
    amount: number;
    selectedItems?: string[];
  };
}

export const QuoteDiscountDialog = ({
  open,
  onOpenChange,
  quoteId,
  projectId,
  items,
  subtotal,
  taxRate,
  currency = 'USD',
  currentDiscount,
}: QuoteDiscountDialogProps) => {
  const { applyDiscount, removeDiscount, calculateDiscountAmount, getItemPrice } = useQuoteDiscount(projectId);

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    currentDiscount?.type || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    currentDiscount?.value || 0
  );
  const [discountScope, setDiscountScope] = useState<'all' | 'fabrics_only' | 'selected_items'>(
    currentDiscount?.scope || 'all'
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(currentDiscount?.selectedItems || [])
  );

  // Update state when currentDiscount changes (e.g., after page refresh)
  React.useEffect(() => {
    if (currentDiscount) {
      setDiscountType(currentDiscount.type);
      setDiscountValue(currentDiscount.value);
      setDiscountScope(currentDiscount.scope);
      setSelectedItems(new Set(currentDiscount.selectedItems || []));
    }
  }, [currentDiscount, open]);


  const config: DiscountConfig = {
    type: discountType,
    value: discountValue,
    scope: discountScope,
    selectedItems: Array.from(selectedItems),
  };

  const discountAmount = calculateDiscountAmount(items, config, subtotal);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + taxAmount;

  const handleApply = async () => {
    try {
      await applyDiscount.mutateAsync({
        quoteId,
        config,
        items,
        subtotal,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error applying discount:', error);
      // Error toast is already handled in the mutation
    }
  };

  const handleRemove = async () => {
    await removeDiscount.mutateAsync(quoteId);
    onOpenChange(false);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Discount Type */}
          <div className="space-y-3">
            <Label>Discount Type</Label>
            <RadioGroup value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer">
                  <Percent className="h-4 w-4" />
                  Percentage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Discount Value */}
          <div className="space-y-2">
            <Label>Discount Value</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
                max={discountType === 'percentage' ? '100' : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <span className="text-muted-foreground">
                {discountType === 'percentage' ? '%' : currency}
              </span>
            </div>
          </div>

          {/* Discount Scope */}
          <div className="space-y-3">
            <Label>Apply To</Label>
            <RadioGroup value={discountScope} onValueChange={(v: any) => setDiscountScope(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">All Items</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fabrics_only" id="fabrics_only" />
                <Label htmlFor="fabrics_only" className="cursor-pointer">Fabrics Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected_items" id="selected_items" />
                <Label htmlFor="selected_items" className="cursor-pointer">Select Specific Items</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Item Selection */}
          {discountScope === 'selected_items' && (
            <div className="space-y-2 border rounded-lg p-4 max-h-48 overflow-y-auto">
              <Label className="text-sm font-medium">Select Items</Label>
              {items.map((item) => {
                const itemPrice = getItemPrice(item);
                return (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleItemSelection(item.id)}
                    />
                    <Label htmlFor={`item-${item.id}`} className="cursor-pointer flex-1">
                      {item.name} - {formatCurrency(itemPrice, currency)}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Preview */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-sm mb-3">Preview</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Discount:</span>
                <span className="font-medium">-{formatCurrency(discountAmount, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>After Discount:</span>
                <span className="font-medium">{formatCurrency(subtotalAfterDiscount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span className="font-medium">+{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          {currentDiscount && (
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={removeDiscount.isPending}
            >
              Remove Discount
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={applyDiscount.isPending || discountValue <= 0}
          >
            {applyDiscount.isPending ? "Applying..." : "Apply Discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
