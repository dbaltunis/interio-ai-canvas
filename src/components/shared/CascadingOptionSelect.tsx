import { useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { cn } from "@/lib/utils";

interface OptionItem {
  id: string;
  name: string;
  description?: string;
  base_price?: number;
  base_cost?: number;
  pricing_method?: string;
  cost_type?: string;
  image_url?: string;
  is_required?: boolean;
  is_default?: boolean;
  extra_data?: {
    price?: number;
    pricing_method?: string;
  };
}

interface CascadingOptionSelectProps {
  label: string;
  options: OptionItem[];
  selectedId: string | null;
  onSelect: (optionId: string | null, previousId: string | null) => void;
  currency: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

const formatPricingLabel = (option: OptionItem, currency: string): string => {
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
    case 'per-unit':
    case 'per-item':
    case 'fixed':
    default:
      methodLabel = '';
  }
  
  const currencySymbol = currency === 'NZD' ? 'NZ$' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  return `${currencySymbol}${price.toFixed(2)}${methodLabel}`;
};

export const CascadingOptionSelect = ({
  label,
  options,
  selectedId,
  onSelect,
  currency,
  placeholder,
  disabled = false,
  required = false
}: CascadingOptionSelectProps) => {
  const selectedOption = options.find(opt => opt.id === selectedId);
  const hasAutoSelected = useRef<string | null>(null);
  const optionsKey = options.map(o => o.id).join(',');
  
  // Memoize onSelect to prevent stale closures
  const stableOnSelect = useCallback((newId: string | null, prevId: string | null) => {
    onSelect(newId, prevId);
  }, [onSelect]);
  
  // Reset auto-selection tracking when options change
  useEffect(() => {
    hasAutoSelected.current = null;
  }, [optionsKey]);
  
  // Auto-select if only one option and nothing selected
  useEffect(() => {
    if (options.length === 1 && !selectedId && hasAutoSelected.current !== options[0].id) {
      console.log(`✅ Auto-selecting single option for ${label}:`, options[0].name);
      hasAutoSelected.current = options[0].id;
      // Use setTimeout to avoid state updates during render
      setTimeout(() => {
        stableOnSelect(options[0].id, null);
      }, 0);
    }
  }, [options, selectedId, label, stableOnSelect, optionsKey]);
  
  const handleValueChange = (value: string) => {
    const previousId = selectedId;
    if (value === "__none__") {
      stableOnSelect(null, previousId);
    } else {
      stableOnSelect(value, previousId);
    }
  };

  // Show red indicator if required, has multiple options, and none selected
  const showRequiredIndicator = !selectedId && options.length > 1;

  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
      <h5 className={cn(
        "font-medium capitalize",
        showRequiredIndicator ? "text-destructive" : "text-foreground"
      )}>{label}</h5>
      <Select
        value={selectedId || "__none__"}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(
          "bg-background",
          showRequiredIndicator && "border-destructive ring-1 ring-destructive/30"
        )}>
          <SelectValue>
            {selectedOption ? (
              <div className="flex items-center justify-between w-full">
                <span>{selectedOption.name}</span>
                <Badge variant="outline" className="ml-2">
                  {formatPricingLabel(selectedOption, currency)}
                </Badge>
              </div>
            ) : (
              <span className={cn(
                showRequiredIndicator ? "text-destructive" : "text-muted-foreground"
              )}>{placeholder || `Select ${label}`}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          <SelectItem value="__none__">
            <span className="text-muted-foreground">None</span>
          </SelectItem>
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
                  {formatPricingLabel(option, currency)}
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
