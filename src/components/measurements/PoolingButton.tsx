import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Waves, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
    
    if (value === "below_floor" && (!poolingAmount || poolingAmount === "0")) {
      const defaultValue = units.system === "imperial" ? "1" : "2";
      onPoolingAmountChange(defaultValue);
    }
    if (value !== "below_floor") {
      onPoolingAmountChange("");
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs w-full justify-between"
        disabled={readOnly}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-1.5">
          <Waves className="h-3.5 w-3.5" />
          {getPoolingLabel()}
        </span>
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
      
      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-3 bg-muted/50 rounded-md border border-border space-y-3">
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
                  Amount ({units.system === "imperial" ? "in" : "cm"})
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
                    ✓ Adds ~{(parseFloat(poolingAmount) / 100 * fabricCalculation.widthsRequired).toFixed(2)}{units.fabric}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
