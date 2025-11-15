import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { QuantityInput } from "./QuantityInput";

interface HierarchicalOptionCardProps {
  option: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    pricing_method: string;
    image_url?: string;
  };
  isSelected: boolean;
  onToggle: () => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

export const HierarchicalOptionCard = ({ 
  option, 
  isSelected, 
  onToggle,
  quantity = 1,
  onQuantityChange 
}: HierarchicalOptionCardProps) => {
  const price = getOptionPrice(option);
  const pricingMethod = getOptionPricingMethod(option);
  const showQuantityInput = isSelected && (pricingMethod === 'per-unit' || pricingMethod === 'per-item');
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
        <input
          type="checkbox"
          id={option.id}
          checked={isSelected}
          onChange={onToggle}
          className="rounded border-gray-300"
        />
        
        {option.image_url && (
          <img 
            src={option.image_url} 
            alt={option.name}
            className="w-12 h-12 object-cover rounded border"
          />
        )}
        
        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{option.name}</span>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              £{price} {pricingMethod}
            </Badge>
          </div>
        </Label>
      </div>
      
      {showQuantityInput && onQuantityChange && (
        <QuantityInput
          value={quantity}
          onChange={onQuantityChange}
          price={price}
          label={`${option.name} Quantity`}
        />
      )}
    </div>
  );
};
