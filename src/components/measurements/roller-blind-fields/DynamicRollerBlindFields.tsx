import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface DynamicRollerBlindFieldsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: string) => void;
  templateId?: string;
  treatmentCategory?: string;
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string) => void;
  selectedOptions?: Array<{ name: string; price: number }>;
}

export const DynamicRollerBlindFields = ({ 
  measurements, 
  onChange, 
  templateId,
  treatmentCategory,
  readOnly = false,
  onOptionPriceChange,
  selectedOptions = []
}: DynamicRollerBlindFieldsProps) => {
  // Query by treatment category (category-based options) instead of template ID
  const { data: treatmentOptions = [], isLoading } = useTreatmentOptions(
    treatmentCategory || templateId, 
    treatmentCategory ? 'category' : 'template'
  );

  // Check if conditional visibility condition is met
  const isConditionMet = (showIf: any) => {
    if (!showIf || typeof showIf !== 'object') return true;
    
    // Example: { "control_type": "chain" } or { "control_type": ["chain", "cord"] }
    return Object.entries(showIf).every(([field, expectedValue]) => {
      const currentValue = measurements[field];
      if (Array.isArray(expectedValue)) {
        return expectedValue.includes(currentValue);
      }
      return currentValue === expectedValue;
    });
  };

  // Helper to get option values with price info
  const getOptionValues = (option: any) => {
    if (!option.option_values) return [];
    
    return option.option_values
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((val: any) => ({
        value: val.code,
        label: val.label,
        id: val.id,
        price: val.extra_data?.price || 0
      }));
  };

  // Helper to handle option change and notify parent of price
  const handleOptionChange = (key: string, value: string | boolean, optionValues: any[]) => {
    onChange(key, String(value));
    
    if (onOptionPriceChange && typeof value === 'string') {
      const selectedOption = optionValues.find(opt => opt.value === value);
      if (selectedOption) {
        onOptionPriceChange(key, selectedOption.price, selectedOption.label);
      }
    }
  };

  // Initialize selected options from existing measurements on load
  useEffect(() => {
    if (treatmentOptions.length === 0) return;
    
    treatmentOptions.forEach(option => {
      const optionValues = getOptionValues(option);
      if (optionValues.length === 0) return;
      
      const currentValue = measurements[option.key];
      const defaultValue = optionValues[0];
      
      // If no value is set, auto-select the first option
      if (!currentValue && defaultValue) {
        onChange(option.key, defaultValue.value);
        
        // Also notify parent of the price for cost summary
        if (onOptionPriceChange) {
          onOptionPriceChange(option.key, defaultValue.price, defaultValue.label);
        }
      } else if (currentValue && onOptionPriceChange) {
        // If value exists, ensure it's in the cost summary
        const alreadySelected = selectedOptions.some(opt => opt.name.startsWith(option.key + ':'));
        if (!alreadySelected) {
          const selectedOption = optionValues.find(opt => opt.value === currentValue);
          if (selectedOption) {
            onOptionPriceChange(option.key, selectedOption.price, selectedOption.label);
          }
        }
      }
    });
  }, [treatmentOptions.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (treatmentOptions.length === 0) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-800 font-medium">
          No window treatment options configured
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Please add treatment options in Settings → Window Covering Templates → Treatment Settings tab
        </p>
      </div>
    );
  }

  // Filter and sort visible options
  // Filter, sort, and deduplicate options (safety net in case of data issues)
  const visibleOptions = treatmentOptions
    .filter(opt => opt.visible)
    .sort((a, b) => a.order_index - b.order_index)
    .filter((opt, index, self) => 
      index === self.findIndex(o => o.key === opt.key)
    );

  return (
    <div className="space-y-4">
      {visibleOptions.map(option => {
        // Check conditional visibility
        if (option.validation?.show_if && !isConditionMet(option.validation.show_if)) {
          return null;
        }

        const optionValues = getOptionValues(option);
        const currentValue = measurements[option.key];
        const defaultValue = optionValues[0]?.value;

        // Render based on input_type
        switch (option.input_type) {
          case 'select':
            return (
              <div key={option.id} className="space-y-2">
                <Label htmlFor={option.key}>
                  {option.label}
                  {option.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select
                  value={currentValue || defaultValue}
                  onValueChange={(value) => handleOptionChange(option.key, value, optionValues)}
                  disabled={readOnly}
                >
                  <SelectTrigger id={option.key}>
                    <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {optionValues.map(opt => (
                      <SelectItem key={opt.id} value={opt.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{opt.label}</span>
                          {opt.price > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              +${opt.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );

          case 'radio':
            return (
              <div key={option.id} className="space-y-2">
                <Label>
                  {option.label}
                  {option.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <RadioGroup
                  value={currentValue || defaultValue}
                  onValueChange={(value) => handleOptionChange(option.key, value, optionValues)}
                  disabled={readOnly}
                >
                  {optionValues.map(opt => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`${option.key}-${opt.value}`} />
                      <Label htmlFor={`${option.key}-${opt.value}`} className="font-normal cursor-pointer flex items-center">
                        {opt.label}
                        {opt.price > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            +${opt.price.toFixed(2)}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );

          case 'text':
            return (
              <div key={option.id} className="space-y-2">
                <Label htmlFor={option.key}>
                  {option.label}
                  {option.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={option.key}
                  type="text"
                  value={currentValue || ''}
                  onChange={(e) => handleOptionChange(option.key, e.target.value, [])}
                  disabled={readOnly}
                  placeholder={`Enter ${option.label.toLowerCase()}`}
                />
              </div>
            );

          case 'number':
            return (
              <div key={option.id} className="space-y-2">
                <Label htmlFor={option.key}>
                  {option.label}
                  {option.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={option.key}
                  type="number"
                  value={currentValue || ''}
                  onChange={(e) => handleOptionChange(option.key, e.target.value, [])}
                  disabled={readOnly}
                  placeholder={`Enter ${option.label.toLowerCase()}`}
                />
              </div>
            );

          case 'boolean':
            return (
              <div key={option.id} className="flex items-center justify-between space-x-2">
                <Label htmlFor={option.key}>
                  {option.label}
                  {option.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Switch
                  id={option.key}
                  checked={currentValue === 'true' || currentValue === true}
                  onCheckedChange={(checked) => handleOptionChange(option.key, checked, [])}
                  disabled={readOnly}
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};