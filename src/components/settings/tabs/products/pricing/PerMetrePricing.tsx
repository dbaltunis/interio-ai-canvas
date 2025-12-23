import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface PriceRange {
  min_height: number;
  max_height: number;
  machine_price: number;
  hand_price?: number;
  price?: number; // Legacy field for backward compatibility
}

interface HeadingPrices {
  [headingId: string]: {
    machine_price?: number;
    hand_price?: number;
  };
}

interface PerMetrePricingProps {
  machinePricePerMetre: string;
  handPricePerMetre: string;
  offersHandFinished: boolean;
  heightPriceRanges?: PriceRange[];
  headingPrices?: HeadingPrices;
  selectedHeadingIds?: string[];
  headings?: Array<{ id: string; name: string }>;
  onInputChange: (field: string, value: any) => void;
}

export const PerMetrePricing = ({
  machinePricePerMetre,
  handPricePerMetre,
  offersHandFinished,
  heightPriceRanges: rawHeightPriceRanges,
  headingPrices: rawHeadingPrices,
  selectedHeadingIds = [],
  headings = [],
  onInputChange
}: PerMetrePricingProps) => {
  const { units, getLengthUnitLabel } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency || 'USD');
  const isImperial = units.system === 'imperial';
  const lengthUnitLabel = getLengthUnitLabel('short');
  const pricingUnitLabel = isImperial ? 'Yard' : 'Metre';
  
  // Ensure heightPriceRanges is always an array
  const heightPriceRanges: PriceRange[] = Array.isArray(rawHeightPriceRanges) ? rawHeightPriceRanges : [];
  
  // Heading price overrides
  const headingPrices: HeadingPrices = rawHeadingPrices || {};
  const [showHeadingPrices, setShowHeadingPrices] = useState(
    Object.keys(headingPrices).length > 0
  );
  
  // Get headings that are selected in the template
  const selectedHeadings = headings.filter(h => selectedHeadingIds.includes(h.id));

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
    const lastRange = heightPriceRanges[heightPriceRanges.length - 1];
    const newMinHeight = lastRange ? lastRange.max_height + 1 : 1;
    const newMaxHeight = lastRange ? lastRange.max_height + 100 : 200;
    
    const updated = [
      ...heightPriceRanges,
      { 
        min_height: newMinHeight, 
        max_height: newMaxHeight, 
        machine_price: parseFloat(machinePricePerMetre) || 0,
        hand_price: offersHandFinished ? (parseFloat(handPricePerMetre) || 0) : undefined
      }
    ];
    onInputChange('height_price_ranges', JSON.stringify(updated));
  };

  const handleHeadingPriceChange = (headingId: string, field: 'machine_price' | 'hand_price', value: string) => {
    const newPrices = { ...headingPrices };
    
    if (!newPrices[headingId]) {
      newPrices[headingId] = {};
    }
    
    // If value is empty or just whitespace, remove the field
    if (!value || value.trim() === '') {
      delete newPrices[headingId][field];
      // Remove heading entry if empty
      if (Object.keys(newPrices[headingId]).length === 0) {
        delete newPrices[headingId];
      }
    } else {
      // Store the numeric value (parseFloat handles "0" correctly)
      newPrices[headingId][field] = parseFloat(value) || 0;
    }
    
    onInputChange("heading_prices", newPrices);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="machine_price_per_metre">Machine Price per {pricingUnitLabel} (Default)</Label>
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
            <Label htmlFor="hand_price_per_metre">Hand-Finished Price per {pricingUnitLabel}</Label>
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

      {/* Heading-specific price overrides */}
      {selectedHeadings.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="heading-prices"
                checked={showHeadingPrices}
                onCheckedChange={setShowHeadingPrices}
              />
              <Label htmlFor="heading-prices" className="cursor-pointer text-sm">
                Different prices by heading
              </Label>
            </div>
            {showHeadingPrices && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowHeadingPrices(!showHeadingPrices)}
              >
                {showHeadingPrices ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {showHeadingPrices && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <p className="text-xs text-muted-foreground">
                Override base price for specific headings (blank = use base price)
              </p>
              <div className="grid gap-3">
                {selectedHeadings.map((heading) => (
                  <div key={heading.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">{heading.name}</span>
                    <div className={`grid gap-2 ${offersHandFinished ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <div>
                        <Label className="text-xs">Machine ({currencySymbol}/{pricingUnitLabel.toLowerCase()})</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={machinePricePerMetre || "Base price"}
                          className="h-8"
                          value={headingPrices[heading.id]?.machine_price || ""}
                          onChange={(e) => handleHeadingPriceChange(heading.id, 'machine_price', e.target.value)}
                        />
                      </div>
                      {offersHandFinished && (
                        <div>
                          <Label className="text-xs">Hand-Finished ({currencySymbol}/{pricingUnitLabel.toLowerCase()})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={handPricePerMetre || "Base price"}
                            className="h-8"
                            value={headingPrices[heading.id]?.hand_price || ""}
                            onChange={(e) => handleHeadingPriceChange(heading.id, 'hand_price', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedHeadings.length === 0 && headings.length > 0 && (
        <p className="text-xs text-muted-foreground border-t pt-3">
          Select headings in the Heading tab to enable heading-specific pricing
        </p>
      )}

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
          <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Min Height ({lengthUnitLabel})</Label>
                <Input
                  type="number"
                  step="1"
                  value={range.min_height}
                  onChange={(e) => updateRange(index, 'min_height', parseFloat(e.target.value) || 0)}
                  placeholder="1"
                />
              </div>
              <div>
                <Label className="text-xs">Max Height ({lengthUnitLabel})</Label>
                <Input
                  type="number"
                  step="1"
                  value={range.max_height}
                  onChange={(e) => updateRange(index, 'max_height', parseFloat(e.target.value) || 0)}
                  placeholder="200"
                />
              </div>
            </div>
            
            <div className={`grid gap-3 ${offersHandFinished ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <Label className="text-xs">Machine Per {pricingUnitLabel} Rate ({currencySymbol})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={range.machine_price || range.price || 0}
                  onChange={(e) => updateRange(index, 'machine_price', parseFloat(e.target.value) || 0)}
                  placeholder="24"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Per {pricingUnitLabel.toLowerCase()} rate for this height range (replaces standard rate)
                </p>
              </div>
              
              {offersHandFinished && (
                <div>
                  <Label className="text-xs">Hand-Finished Per {pricingUnitLabel} Rate ({currencySymbol})</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={range.hand_price || 0}
                    onChange={(e) => updateRange(index, 'hand_price', parseFloat(e.target.value) || 0)}
                    placeholder="35"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Hand-finished rate for this height range
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRange(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Range
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};