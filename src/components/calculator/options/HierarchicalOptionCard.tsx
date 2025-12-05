import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { QuantityInput } from "./QuantityInput";
import { getCurrencySymbol } from "@/utils/formatCurrency";

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
  currency?: string;
}

const formatPricingDisplay = (price: number, method: string, currency: string): string => {
  let methodLabel = '';
  switch (method) {
    case 'per-meter':
    case 'per-metre':
    case 'per-linear-meter':
      methodLabel = '/m';
      break;
    case 'per-sqm':
    case 'per-square-meter':
      methodLabel = '/sqm';
      break;
    case 'per-drop':
      methodLabel = '/drop';
      break;
    case 'per-panel':
      methodLabel = '/panel';
      break;
    case 'per-width':
      methodLabel = '/width';
      break;
    case 'percentage':
      methodLabel = '%';
      break;
    default:
      methodLabel = '';
  }
  
  const currencySymbol = getCurrencySymbol(currency);
  return `${currencySymbol}${price.toFixed(2)}${methodLabel}`;
};

export const HierarchicalOptionCard = ({ 
  option, 
  isSelected, 
  onToggle,
  quantity = 1,
  onQuantityChange,
  currency = 'NZD'
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
              {formatPricingDisplay(price, pricingMethod, currency)}
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
