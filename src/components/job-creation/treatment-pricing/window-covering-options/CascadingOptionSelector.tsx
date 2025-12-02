import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "./currencyUtils";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";

interface CascadingOptionSelectorProps {
  optionType: string;
  options: any[];
  selectedOptionId: string | null;
  onSelect: (optionId: string | null) => void;
  currency: string;
}

export const CascadingOptionSelector = ({
  optionType,
  options,
  selectedOptionId,
  onSelect,
  currency
}: CascadingOptionSelectorProps) => {
  const selectedOption = options.find(opt => opt.id === selectedOptionId);
  
  const formatPricingLabel = (option: any) => {
    const price = getOptionPrice(option);
    const method = getOptionPricingMethod(option);
    
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
    
    return `${formatCurrency(price, currency)}${methodLabel}`;
  };

  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
      <h5 className="font-medium text-foreground capitalize">{optionType}</h5>
      <Select
        value={selectedOptionId || ""}
        onValueChange={(value) => onSelect(value || null)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue>
            {selectedOption ? (
              <div className="flex items-center justify-between w-full">
                <span>{selectedOption.name}</span>
                <Badge variant="outline" className="ml-2">
                  {formatPricingLabel(selectedOption)}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">Select {optionType}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <div className="flex items-center gap-3 w-full">
                {option.image_url && (
                  <img 
                    src={option.image_url} 
                    alt={option.name}
                    className="w-6 h-6 object-cover rounded border"
                  />
                )}
                <span className="flex-1">{option.name}</span>
                <Badge variant="outline" className="ml-2">
                  {formatPricingLabel(option)}
                </Badge>
                {option.is_required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};