import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { Badge } from "@/components/ui/badge";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Loader2 } from "lucide-react";

interface DynamicCurtainOptionsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: any) => void;
  templateId?: string;
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string) => void;
  selectedOptions?: Array<{ name: string; price: number }>;
}

export const DynamicCurtainOptions = ({
  measurements,
  onChange,
  templateId,
  readOnly = false,
  onOptionPriceChange,
  selectedOptions = []
}: DynamicCurtainOptionsProps) => {
  const { units } = useMeasurementUnits();
  const { data: options = [], isLoading } = useTreatmentOptions('curtains', 'category');

  const handleOptionChange = (optionKey: string, valueId: string, optionType: string) => {
    const option = options.find(opt => opt.key === optionKey);
    const value = option?.option_values?.find(v => v.id === valueId);
    
    if (value && onOptionPriceChange) {
      const price = getOptionPrice(value);
      onOptionPriceChange(optionKey, price, value.label);
    }
    
    // Store the option value ID
    onChange(`option_${optionKey}`, valueId);
  };

  const handleCheckboxChange = (optionKey: string, valueId: string, valueLabel: string, checked: boolean) => {
    // Update selected options in parent
    if (onChange) {
      const currentOptions = measurements.selectedOptions || [];
      const optionName = `${optionKey}: ${valueLabel}`;
      const filteredOptions = currentOptions.filter((opt: any) => !opt.name.startsWith(optionKey + ':'));
      
      if (checked) {
        const option = options.find(opt => opt.key === optionKey);
        const value = option?.option_values?.find(v => v.id === valueId);
        if (value) {
          const price = getOptionPrice(value);
          const newOption = { name: optionName, price };
          onChange('selectedOptions', [...filteredOptions, newOption]);
          
          if (onOptionPriceChange) {
            onOptionPriceChange(optionKey, price, valueLabel);
          }
        }
      } else {
        onChange('selectedOptions', filteredOptions);
        if (onOptionPriceChange) {
          onOptionPriceChange(optionKey, 0, valueLabel);
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency || 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options
        .filter(option => option.visible)
        .sort((a, b) => a.order_index - b.order_index)
        .map(option => {
          const currentValue = measurements[`option_${option.key}`];
          const optionValues = option.option_values || [];

          return (
            <div key={option.id} className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                {option.label}
                {option.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </Label>

              {/* Radio buttons for single select */}
              {option.input_type === 'radio' && (
                <RadioGroup
                  value={currentValue || ''}
                  onValueChange={(value) => handleOptionChange(option.key, value, option.input_type)}
                  disabled={readOnly}
                  className="grid grid-cols-1 gap-2"
                >
                  {optionValues.map(value => (
                    <div
                      key={value.id}
                      className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                    >
                      <RadioGroupItem value={value.id} id={value.id} />
                      <Label htmlFor={value.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>{value.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(getOptionPrice(value))} {getOptionPricingMethod(value)}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Dropdown for select */}
              {option.input_type === 'select' && (
                <Select
                  value={currentValue || ''}
                  onValueChange={(value) => handleOptionChange(option.key, value, option.input_type)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {optionValues.map(value => (
                      <SelectItem key={value.id} value={value.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{value.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(getOptionPrice(value))} {getOptionPricingMethod(value)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Checkboxes for multiselect */}
              {option.input_type === 'multiselect' && (
                <div className="space-y-2">
                  {optionValues.map(value => {
                    const isChecked = (selectedOptions || []).some((opt: any) => 
                      opt.name && opt.name.startsWith(option.key + ':') && opt.name.includes(value.label)
                    );
                    
                    return (
                      <div
                        key={value.id}
                        className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={value.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleCheckboxChange(option.key, value.id, value.label, checked === true)}
                          disabled={readOnly}
                        />
                        <Label htmlFor={value.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>{value.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(getOptionPrice(value))} {getOptionPricingMethod(value)}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};
