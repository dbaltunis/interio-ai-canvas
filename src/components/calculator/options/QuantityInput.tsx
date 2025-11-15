import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  price: number;
  label?: string;
  min?: number;
  max?: number;
}

export const QuantityInput = ({ 
  value, 
  onChange, 
  price, 
  label = "Quantity",
  min = 1,
  max = 999 
}: QuantityInputProps) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const totalPrice = price * value;

  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleDecrement}
            disabled={value <= min}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            className="w-16 text-center h-8"
          />
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleIncrement}
            disabled={value >= max}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex-1 text-sm text-muted-foreground">
          £{price.toFixed(2)} × {value} = <span className="font-semibold text-foreground">£{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
