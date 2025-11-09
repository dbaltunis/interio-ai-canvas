import { useState, useEffect } from "react";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuoteDiscount, DiscountConfig } from "@/hooks/useQuoteDiscount";
import { formatCurrency } from "@/utils/formatters";
import { Percent, DollarSign, X } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface InlineDiscountPanelProps {
  isOpen: boolean;
  onClose: () => void;
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

export const InlineDiscountPanel = ({
  isOpen,
  onClose,
  quoteId,
  projectId,
  items,
  subtotal,
  taxRate,
  currency = 'USD',
  currentDiscount,
}: InlineDiscountPanelProps) => {
  const { applyDiscount, removeDiscount, calculateDiscountAmount, getItemPrice } = useQuoteDiscount(projectId);

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountScope, setDiscountScope] = useState<'all' | 'fabrics_only' | 'selected_items'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Load saved discount values when panel opens
  React.useEffect(() => {
    if (isOpen) {
      if (currentDiscount) {
        setDiscountType(currentDiscount.type);
        setDiscountValue(currentDiscount.value);
        setDiscountScope(currentDiscount.scope);
        setSelectedItems(new Set(currentDiscount.selectedItems || []));
      } else {
        setDiscountType('percentage');
        setDiscountValue(0);
        setDiscountScope('all');
        setSelectedItems(new Set());
      }
    }
  }, [isOpen, currentDiscount]);

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
      
      // Give a moment for the queries to invalidate and refetch
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeDiscount.mutateAsync(quoteId);
      
      // Give a moment for the queries to invalidate and refetch
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error removing discount:', error);
    }
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

  if (!isOpen) return null;

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <Card className="p-6 mb-6 border-2 border-primary/20 bg-primary/5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Apply Discount</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Controls */}
            <div className="space-y-4">
              {/* Discount Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Discount Type</Label>
                <RadioGroup value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="inline-percentage" />
                    <Label htmlFor="inline-percentage" className="flex items-center gap-2 cursor-pointer">
                      <Percent className="h-4 w-4" />
                      Percentage
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="inline-fixed" />
                    <Label htmlFor="inline-fixed" className="flex items-center gap-2 cursor-pointer">
                      <DollarSign className="h-4 w-4" />
                      Fixed Amount
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Discount Value</Label>
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
                  <span className="text-muted-foreground min-w-[40px]">
                    {discountType === 'percentage' ? '%' : currency}
                  </span>
                </div>
              </div>

              {/* Discount Scope */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Apply To</Label>
                <RadioGroup value={discountScope} onValueChange={(v: any) => setDiscountScope(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="inline-all" />
                    <Label htmlFor="inline-all" className="cursor-pointer">All Items</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fabrics_only" id="inline-fabrics" />
                    <Label htmlFor="inline-fabrics" className="cursor-pointer">Fabrics Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selected_items" id="inline-selected" />
                    <Label htmlFor="inline-selected" className="cursor-pointer">Select Specific Items</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Item Selection */}
              {discountScope === 'selected_items' && (
                <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto bg-background">
                  <Label className="text-xs font-medium">Select Items</Label>
                  {items.map((item) => {
                    const itemPrice = getItemPrice(item);
                    return (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`inline-item-${item.id}`}
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                        />
                        <Label htmlFor={`inline-item-${item.id}`} className="cursor-pointer flex-1 text-sm">
                          {item.name} - {formatCurrency(itemPrice, currency)}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {currentDiscount && (
                  <Button
                    variant="outline"
                    onClick={handleRemove}
                    disabled={removeDiscount.isPending}
                    className="flex-1"
                  >
                    {removeDiscount.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Removing...
                      </>
                    ) : "Remove Discount"}
                  </Button>
                )}
                <Button
                  onClick={handleApply}
                  disabled={applyDiscount.isPending || discountValue <= 0}
                  className="flex-1"
                >
                  {applyDiscount.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Applying...
                    </>
                  ) : "Apply to Quote"}
                </Button>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="border-l pl-6">
              <div className="sticky top-4">
                <h4 className="font-semibold text-sm mb-4 text-primary">Live Preview</h4>
                <div className="space-y-3 text-sm bg-background rounded-lg p-4 border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">After Discount:</span>
                    <span className="font-semibold">{formatCurrency(subtotalAfterDiscount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({taxRate}%):</span>
                    <span>+{formatCurrency(taxAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(total, currency)}</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted/50 rounded-md border">
                  {applyDiscount.isPending ? (
                    <p className="text-xs text-primary text-center font-medium">
                      <span className="animate-pulse">Applying discount and updating quote...</span>
                    </p>
                  ) : discountValue > 0 ? (
                    <p className="text-xs text-muted-foreground text-center">
                      Click "Apply to Quote" to update the quote below with discounted prices
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center">
                      Enter a discount value above to see the preview
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
