import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PriceRange {
  min_height: number;
  max_height: number;
  price: number;
}

interface HeightBasedPricingRangesProps {
  heightPriceRanges: PriceRange[];
  onInputChange: (field: string, value: PriceRange[]) => void;
}

export const HeightBasedPricingRanges = ({
  heightPriceRanges,
  onInputChange
}: HeightBasedPricingRangesProps) => {
  const updateRange = (index: number, field: keyof PriceRange, value: number) => {
    const newRanges = [...heightPriceRanges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    onInputChange("height_price_ranges", newRanges);
  };

  const removeRange = (index: number) => {
    const newRanges = heightPriceRanges.filter((_, i) => i !== index);
    onInputChange("height_price_ranges", newRanges);
  };

  const addRange = () => {
    const lastRange = heightPriceRanges[heightPriceRanges.length - 1];
    const newRange = {
      min_height: lastRange.max_height + 1,
      max_height: lastRange.max_height + 50,
      price: lastRange.price + 5
    };
    onInputChange("height_price_ranges", [...heightPriceRanges, newRange]);
  };

  return (
    <Card className="p-4">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-sm">Height Range Pricing Configuration</CardTitle>
        <CardDescription className="text-xs">
          Create different pricing tiers based on curtain height ranges (e.g., 1-200cm = £24, 201-250cm = £30)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {heightPriceRanges.map((range, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor={`min_height_${index}`}>Min Height (cm)</Label>
              <Input
                id={`min_height_${index}`}
                type="number"
                value={range.min_height}
                onChange={(e) => updateRange(index, 'min_height', parseInt(e.target.value) || 0)}
                placeholder="1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`max_height_${index}`}>Max Height (cm)</Label>
              <Input
                id={`max_height_${index}`}
                type="number"
                value={range.max_height}
                onChange={(e) => updateRange(index, 'max_height', parseInt(e.target.value) || 0)}
                placeholder="200"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`price_${index}`}>Per Metre Rate (£)</Label>
              <Input
                id={`price_${index}`}
                type="number"
                step="0.01"
                value={range.price}
                onChange={(e) => updateRange(index, 'price', parseFloat(e.target.value) || 0)}
                placeholder="18.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Per metre rate for this height range (replaces standard rate)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRange(index)}
              disabled={heightPriceRanges.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRange}
        >
          Add Range
        </Button>
      </CardContent>
    </Card>
  );
};