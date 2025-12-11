import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Waves } from "lucide-react";
import { useState } from "react";

interface PoolingButtonProps {
  poolingOption: string;
  poolingAmount: string;
  onPoolingOptionChange: (value: string) => void;
  onPoolingAmountChange: (value: string) => void;
  units: { system: string; fabric: string };
  readOnly?: boolean;
  fabricCalculation?: { widthsRequired: number; linearMeters: number } | null;
  selectedFabric?: any;
}

export const PoolingButton = ({
  poolingOption,
  poolingAmount,
  onPoolingOptionChange,
  onPoolingAmountChange,
  units,
  readOnly,
  fabricCalculation,
  selectedFabric
}: PoolingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPoolingLabel = () => {
    switch (poolingOption) {
      case "above_floor": return "Above floor";
      case "touching_floor": return "Touching";
      case "below_floor": return poolingAmount ? `Pool ${poolingAmount}${units.system === "imperial" ? '"' : 'cm'}` : "Pooling";
      default: return "Pooling";
    }
  };

  const hasValue = (val: string | number | undefined | null) => val !== undefined && val !== null && val !== "";

  const handleOptionChange = (value: string) => {
    onPoolingOptionChange(value);
    
    // Set default pooling amount when "below_floor" is selected
    if (value === "below_floor" && (!poolingAmount || poolingAmount === "0")) {
      const defaultValue = units.system === "imperial" ? "1" : "2";
      onPoolingAmountChange(defaultValue);
    }
    // Clear pooling amount when not below floor
    if (value !== "below_floor") {
      onPoolingAmountChange("");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={readOnly}
        >
          <Waves className="h-3.5 w-3.5" />
          {getPoolingLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Waves className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pooling Options</span>
          </div>
          
          <RadioGroup 
            value={poolingOption} 
            onValueChange={handleOptionChange} 
            disabled={readOnly} 
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="above_floor" id="pool_above_floor" />
              <Label htmlFor="pool_above_floor" className="text-xs cursor-pointer">Above floor (hanging)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="touching_floor" id="pool_touching_floor" />
              <Label htmlFor="pool_touching_floor" className="text-xs cursor-pointer">Touching floor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="below_floor" id="pool_below_floor" />
              <Label htmlFor="pool_below_floor" className="text-xs cursor-pointer">Below floor (pooling)</Label>
            </div>
          </RadioGroup>

          {poolingOption === "below_floor" && (
            <div className="pt-2 border-t border-border space-y-2">
              <div>
                <Label htmlFor="pooling_amount_input" className="text-xs font-medium">
                  Pooling Amount ({units.system === "imperial" ? "inches" : "cm"})
                </Label>
                <Input 
                  id="pooling_amount_input" 
                  type="number" 
                  step="0.25" 
                  value={poolingAmount} 
                  onChange={e => onPoolingAmountChange(e.target.value)} 
                  placeholder="2.00" 
                  readOnly={readOnly} 
                  className="h-8 text-sm mt-1" 
                />
              </div>
              
              {hasValue(poolingAmount) && selectedFabric && fabricCalculation && (
                <div className="p-2 bg-amber-100/50 border border-amber-300 rounded text-[10px]">
                  <div className="font-medium text-amber-800">
                    ✓ Pooling adds ~{(parseFloat(poolingAmount) / 100 * fabricCalculation.widthsRequired).toFixed(2)}{units.fabric}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
