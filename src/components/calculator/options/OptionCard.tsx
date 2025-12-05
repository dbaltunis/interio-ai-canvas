import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { QuantityInput } from "./QuantityInput";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface OptionCardProps {
  option: WindowCoveringOption;
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

export const OptionCard = ({ 
  option, 
  isSelected, 
  onToggle, 
  quantity = 1,
  onQuantityChange,
  currency = 'NZD'
}: OptionCardProps) => {
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
          disabled={option.is_required}
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
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {formatPricingDisplay(price, pricingMethod, currency)}
              </Badge>
              {option.is_required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              {option.is_default && (
                <Badge variant="default" className="text-xs">Default</Badge>
              )}
            </div>
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
