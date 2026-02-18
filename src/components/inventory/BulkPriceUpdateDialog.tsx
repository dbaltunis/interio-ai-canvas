import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface BulkPriceUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItemIds: string[];
  selectedItems: any[];
  onSuccess: () => void;
}

type UpdateMode = "set_price" | "adjust_percent" | "set_markup";

export const BulkPriceUpdateDialog = ({
  open,
  onOpenChange,
  selectedItemIds,
  selectedItems,
  onSuccess,
}: BulkPriceUpdateDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [mode, setMode] = useState<UpdateMode>("adjust_percent");
  const [percentValue, setPercentValue] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState("");
  const [priceTarget, setPriceTarget] = useState<"cost" | "selling" | "both">("selling");

  const handleUpdate = async () => {
    if (selectedItemIds.length === 0) return;

    setIsUpdating(true);
    try {
      if (mode === "set_price") {
        // Set specific prices
        const updatePayload: Record<string, any> = {};
        if (costPrice && priceTarget !== "selling") {
          updatePayload.cost_price = parseFloat(costPrice);
        }
        if (sellingPrice && priceTarget !== "cost") {
          updatePayload.selling_price = parseFloat(sellingPrice);
        }

        if (Object.keys(updatePayload).length === 0) {
          toast({ title: "Enter at least one price value", variant: "destructive" });
          return;
        }

        const { error } = await supabase
          .from("enhanced_inventory_items")
          .update(updatePayload)
          .in("id", selectedItemIds);

        if (error) throw error;

        toast({
          title: `Prices updated for ${selectedItemIds.length} items`,
        });
      } else if (mode === "adjust_percent") {
        // Adjust by percentage
        const pct = parseFloat(percentValue);
        if (isNaN(pct)) {
          toast({ title: "Enter a valid percentage", variant: "destructive" });
          return;
        }

        const multiplier = 1 + pct / 100;

        // Fetch current prices and update each
        const { data: items, error: fetchError } = await supabase
          .from("enhanced_inventory_items")
          .select("id, cost_price, selling_price")
          .in("id", selectedItemIds);

        if (fetchError) throw fetchError;

        const updates = (items || []).map((item) => {
          const payload: Record<string, any> = {};
          if (priceTarget !== "selling" && item.cost_price) {
            payload.cost_price = Math.round(item.cost_price * multiplier * 100) / 100;
          }
          if (priceTarget !== "cost" && item.selling_price) {
            payload.selling_price = Math.round(item.selling_price * multiplier * 100) / 100;
          }

          if (Object.keys(payload).length === 0) return null;

          return supabase
            .from("enhanced_inventory_items")
            .update(payload)
            .eq("id", item.id);
        });

        const results = await Promise.all(updates.filter(Boolean));
        const errors = results.filter((r) => r?.error);
        if (errors.length > 0) throw errors[0]?.error;

        toast({
          title: `Prices adjusted by ${pct > 0 ? "+" : ""}${pct}% for ${selectedItemIds.length} items`,
        });
      } else if (mode === "set_markup") {
        // Calculate selling price from cost price using markup
        const markup = parseFloat(markupPercent);
        if (isNaN(markup)) {
          toast({ title: "Enter a valid markup percentage", variant: "destructive" });
          return;
        }

        const { data: items, error: fetchError } = await supabase
          .from("enhanced_inventory_items")
          .select("id, cost_price")
          .in("id", selectedItemIds);

        if (fetchError) throw fetchError;

        const updates = (items || []).map((item) => {
          if (!item.cost_price) return null;
          const newSellingPrice = Math.round(item.cost_price * (1 + markup / 100) * 100) / 100;
          return supabase
            .from("enhanced_inventory_items")
            .update({ selling_price: newSellingPrice })
            .eq("id", item.id);
        });

        const results = await Promise.all(updates.filter(Boolean));
        const errors = results.filter((r) => r?.error);
        if (errors.length > 0) throw errors[0]?.error;

        toast({
          title: `Selling prices set with ${markup}% markup for ${selectedItemIds.length} items`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Failed to update prices",
        description: error?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setPercentValue("");
    setCostPrice("");
    setSellingPrice("");
    setMarkupPercent("");
  };

  // Preview calculation
  const getPreview = () => {
    if (selectedItems.length === 0) return null;
    const sample = selectedItems[0];

    if (mode === "adjust_percent" && percentValue) {
      const pct = parseFloat(percentValue);
      if (isNaN(pct)) return null;
      const multiplier = 1 + pct / 100;
      const oldPrice = sample.selling_price || sample.cost_price || 0;
      const newPrice = Math.round(oldPrice * multiplier * 100) / 100;
      return { name: sample.name, oldPrice, newPrice };
    }
    if (mode === "set_markup" && markupPercent && sample.cost_price) {
      const markup = parseFloat(markupPercent);
      if (isNaN(markup)) return null;
      const newPrice = Math.round(sample.cost_price * (1 + markup / 100) * 100) / 100;
      return { name: sample.name, oldPrice: sample.selling_price || 0, newPrice };
    }
    return null;
  };

  const preview = getPreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Prices</DialogTitle>
          <DialogDescription>
            Update prices for {selectedItemIds.length} selected item{selectedItemIds.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Update mode */}
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as UpdateMode)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="adjust_percent" id="adjust_percent" />
              <Label htmlFor="adjust_percent" className="cursor-pointer">
                Adjust by percentage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="set_markup" id="set_markup" />
              <Label htmlFor="set_markup" className="cursor-pointer">
                Set markup from cost price
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="set_price" id="set_price" />
              <Label htmlFor="set_price" className="cursor-pointer">
                Set specific price
              </Label>
            </div>
          </RadioGroup>

          {/* Adjust by percentage */}
          {mode === "adjust_percent" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Percentage change</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="e.g., 10 for +10%, -5 for -5%"
                    value={percentValue}
                    onChange={(e) => setPercentValue(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use positive for increase, negative for decrease
                </p>
              </div>
              <div className="space-y-2">
                <Label>Apply to</Label>
                <RadioGroup value={priceTarget} onValueChange={(v) => setPriceTarget(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selling" id="target_selling" />
                    <Label htmlFor="target_selling" className="cursor-pointer text-sm">Selling price only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cost" id="target_cost" />
                    <Label htmlFor="target_cost" className="cursor-pointer text-sm">Cost price only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="target_both" />
                    <Label htmlFor="target_both" className="cursor-pointer text-sm">Both cost and selling</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Set markup from cost */}
          {mode === "set_markup" && (
            <div className="space-y-2">
              <Label>Markup percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="e.g., 30 for 30% markup"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                />
                <span className="text-sm text-muted-foreground shrink-0">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Selling price = Cost price x (1 + markup%)
              </p>
            </div>
          )}

          {/* Set specific prices */}
          {mode === "set_price" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Apply to</Label>
                <RadioGroup value={priceTarget} onValueChange={(v) => setPriceTarget(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selling" id="set_selling" />
                    <Label htmlFor="set_selling" className="cursor-pointer text-sm">Selling price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cost" id="set_cost" />
                    <Label htmlFor="set_cost" className="cursor-pointer text-sm">Cost price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="set_both" />
                    <Label htmlFor="set_both" className="cursor-pointer text-sm">Both</Label>
                  </div>
                </RadioGroup>
              </div>
              {(priceTarget === "cost" || priceTarget === "both") && (
                <div className="space-y-1">
                  <Label>Cost price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>
              )}
              {(priceTarget === "selling" || priceTarget === "both") && (
                <div className="space-y-1">
                  <Label>Selling price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
                Preview ({preview.name})
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through tabular-nums">
                  {preview.oldPrice.toFixed(2)}
                </span>
                <span className="text-foreground font-medium tabular-nums">
                  {preview.newPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : `Update ${selectedItemIds.length} items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
