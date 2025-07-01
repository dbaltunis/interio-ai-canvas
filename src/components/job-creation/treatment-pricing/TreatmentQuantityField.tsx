
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TreatmentQuantityFieldProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const TreatmentQuantityField = ({ 
  quantity, 
  onQuantityChange 
}: TreatmentQuantityFieldProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 items-center">
      <Label htmlFor="quantity">Quantity</Label>
      <Input
        id="quantity"
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
      />
    </div>
  );
};
