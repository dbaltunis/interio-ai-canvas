import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface PriceRange {
  min_height: number;
  max_height: number;
  price: number;
}

interface PerMetrePricingProps {
  machinePricePerMetre: string;
  handPricePerMetre: string;
  offersHandFinished: boolean;
  heightPriceRanges?: PriceRange[];
  onInputChange: (field: string, value: string) => void;
}

export const PerMetrePricing = ({
  machinePricePerMetre,
  handPricePerMetre,
  offersHandFinished,
  heightPriceRanges = [],
  onInputChange
}: PerMetrePricingProps) => {
  const updateRange = (index: number, field: keyof PriceRange, value: number) => {
    const updated = [...heightPriceRanges];
    updated[index] = { ...updated[index], [field]: value };
    onInputChange('height_price_ranges', JSON.stringify(updated));
  };

  const removeRange = (index: number) => {
    const updated = heightPriceRanges.filter((_, i) => i !== index);
    onInputChange('height_price_ranges', JSON.stringify(updated));
  };

  const addRange = () => {
    const updated = [
      ...heightPriceRanges,
      { min_height: 1, max_height: 200, price: parseFloat(machinePricePerMetre) || 0 }
    ];
    onInputChange('height_price_ranges', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="machine_price_per_metre">Machine Price per Metre (Default)</Label>
          <Input
            id="machine_price_per_metre"
            type="number"
            step="0.01"
            value={machinePricePerMetre}
            onChange={(e) => onInputChange("machine_price_per_metre", e.target.value)}
            placeholder="20.00"
          />
        </div>
        {offersHandFinished && (
          <div>
            <Label htmlFor="hand_price_per_metre">Hand-Finished Price per Metre</Label>
            <Input
              id="hand_price_per_metre"
              type="number"
              step="0.01"
              value={handPricePerMetre}
              onChange={(e) => onInputChange("hand_price_per_metre", e.target.value)}
              placeholder="35.00"
            />
          </div>
        )}
      </div>

      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Height-Based Price Adjustments (Optional)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRange}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Height Range
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Override the default price for specific height ranges
        </p>

        {heightPriceRanges.map((range, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
            <div>
              <Label className="text-xs">Min Height (cm)</Label>
              <Input
                type="number"
                step="1"
                value={range.min_height}
                onChange={(e) => updateRange(index, 'min_height', parseFloat(e.target.value) || 0)}
                placeholder="1"
              />
            </div>
            <div>
              <Label className="text-xs">Max Height (cm)</Label>
              <Input
                type="number"
                step="1"
                value={range.max_height}
                onChange={(e) => updateRange(index, 'max_height', parseFloat(e.target.value) || 0)}
                placeholder="200"
              />
            </div>
            <div>
              <Label className="text-xs">Per Metre Rate (£)</Label>
              <Input
                type="number"
                step="0.01"
                value={range.price}
                onChange={(e) => updateRange(index, 'price', parseFloat(e.target.value) || 0)}
                placeholder="24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Per metre rate for this height range (replaces standard rate)
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeRange(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};