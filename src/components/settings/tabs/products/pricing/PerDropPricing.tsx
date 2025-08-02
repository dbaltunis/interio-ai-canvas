import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface DropHeightRange {
  min: number;
  max: number;
}

interface PerDropPricingProps {
  machinePricePerDrop: string;
  handPricePerDrop: string;
  offersHandFinished: boolean;
  dropHeightRanges: DropHeightRange[];
  machineDropHeightPrices: number[];
  handDropHeightPrices: number[];
  onInputChange: (field: string, value: any) => void;
}

export const PerDropPricing = ({
  machinePricePerDrop,
  handPricePerDrop,
  offersHandFinished,
  dropHeightRanges,
  machineDropHeightPrices,
  handDropHeightPrices,
  onInputChange
}: PerDropPricingProps) => {
  const isHeightBasedEnabled = dropHeightRanges && dropHeightRanges.length > 0;

  const toggleHeightBased = (checked: boolean) => {
    if (checked) {
      onInputChange('drop_height_ranges', [{ min: 0, max: 150 }]);
      onInputChange('machine_drop_height_prices', [30]);
      onInputChange('hand_drop_height_prices', [45]);
    } else {
      onInputChange('drop_height_ranges', []);
      onInputChange('machine_drop_height_prices', []);
      onInputChange('hand_drop_height_prices', []);
    }
  };

  const addHeightRange = () => {
    const newRanges = [...(dropHeightRanges || []), { min: 0, max: 100 }];
    const newMachinePrices = [...(machineDropHeightPrices || []), 0];
    const newHandPrices = [...(handDropHeightPrices || []), 0];
    onInputChange('drop_height_ranges', newRanges);
    onInputChange('machine_drop_height_prices', newMachinePrices);
    onInputChange('hand_drop_height_prices', newHandPrices);
  };

  const removeHeightRange = (index: number) => {
    const newRanges = (dropHeightRanges || []).filter((_, i) => i !== index);
    const newMachinePrices = (machineDropHeightPrices || []).filter((_, i) => i !== index);
    const newHandPrices = (handDropHeightPrices || []).filter((_, i) => i !== index);
    onInputChange('drop_height_ranges', newRanges);
    onInputChange('machine_drop_height_prices', newMachinePrices);
    onInputChange('hand_drop_height_prices', newHandPrices);
  };

  const updateHeightRange = (index: number, field: 'min' | 'max', value: number) => {
    const newRanges = [...(dropHeightRanges || [])];
    newRanges[index] = { ...newRanges[index], [field]: value };
    onInputChange('drop_height_ranges', newRanges);
  };

  const updateHeightPrice = (index: number, type: 'machine' | 'hand', value: number) => {
    const fieldName = type === 'machine' ? 'machine_drop_height_prices' : 'hand_drop_height_prices';
    const currentPrices = type === 'machine' ? machineDropHeightPrices : handDropHeightPrices;
    const newPrices = [...(currentPrices || [])];
    newPrices[index] = value;
    onInputChange(fieldName, newPrices);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">🟫 Per Drop Pricing</h4>
        <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
          Price scales with fabric complexity. System calculates how many fabric pieces (drops) 
          are needed based on curtain width vs fabric width, then multiplies by your price per drop.
        </p>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
        <h5 className="font-medium text-xs text-amber-900 dark:text-amber-100">Calculation Example:</h5>
        <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
          Curtain width: 300cm, Fabric width: 137cm → Need 3 drops<br/>
          Final price: 3 drops × £{machinePricePerDrop || '30'} = £{(3 * parseFloat(machinePricePerDrop || '30')).toFixed(2)}
        </p>
      </div>

      {/* Toggle for height-based pricing */}
      <div className="flex items-center space-x-2">
        <Switch
          id="use_height_based_drop_pricing"
          checked={isHeightBasedEnabled}
          onCheckedChange={toggleHeightBased}
        />
        <Label htmlFor="use_height_based_drop_pricing">
          Use Height-Based Drop Pricing
        </Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Use different drop prices based on curtain height ranges instead of a single rate</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Show either simple pricing or height-based pricing */}
      {!isHeightBasedEnabled ? (
        /* Simple per-drop pricing */
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="machine_price_per_drop">Machine Price per Drop</Label>
            <Input
              id="machine_price_per_drop"
              type="number"
              step="0.01"
              value={machinePricePerDrop}
              onChange={(e) => onInputChange("machine_price_per_drop", e.target.value)}
              placeholder="30.00"
            />
            <p className="text-xs text-muted-foreground mt-1">Standard price per fabric drop</p>
          </div>
          {offersHandFinished && (
            <div>
              <Label htmlFor="hand_price_per_drop">Hand-Finished Price per Drop</Label>
              <Input
                id="hand_price_per_drop"
                type="number"
                step="0.01"
                value={handPricePerDrop}
                onChange={(e) => onInputChange("hand_price_per_drop", e.target.value)}
                placeholder="45.00"
              />
              <p className="text-xs text-muted-foreground mt-1">Hand-finished premium per drop</p>
            </div>
          )}
        </div>
      ) : (
        /* Height-based drop pricing */
        <Card className="p-4">
          <h4 className="font-medium mb-4">Height-Based Drop Pricing Ranges</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Configure different drop pricing based on curtain height ranges.
          </p>
          
          <div className="space-y-3">
            {dropHeightRanges?.map((range, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 items-center">
                <div>
                  <Label className="text-xs">Min Height (cm)</Label>
                  <Input
                    type="number"
                    value={range.min}
                    onChange={(e) => updateHeightRange(index, 'min', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Height (cm)</Label>
                  <Input
                    type="number"
                    value={range.max}
                    onChange={(e) => updateHeightRange(index, 'max', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Machine (£/drop)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={machineDropHeightPrices?.[index] || ''}
                    onChange={(e) => updateHeightPrice(index, 'machine', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                {offersHandFinished && (
                  <div>
                    <Label className="text-xs">Hand (£/drop)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={handDropHeightPrices?.[index] || ''}
                      onChange={(e) => updateHeightPrice(index, 'hand', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeightRange(index)}
                  className="mt-6"
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeightRange}
            >
              Add Height Range
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};