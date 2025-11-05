import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { useConditionalOptions } from "@/hooks/useConditionalOptions";
import { Loader2, Info, Sparkles, ChevronDown } from "lucide-react";
import { useEffect } from "react";

interface DynamicRollerBlindFieldsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: string) => void;
  templateId?: string;
  treatmentCategory?: string;
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string, pricingMethod?: string, pricingGridData?: any) => void;
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

  // Use rules engine to determine visibility, required status, and defaults
  const {
    isOptionVisible,
    isOptionRequired,
    getDefaultValue,
    shownOptions,
    rules,
  } = useConditionalOptions(templateId, measurements);

  // Helper to check if an option is shown by a rule (not just visible by default)
  const isShownByRule = (optionKey: string) => {
    return shownOptions.includes(optionKey);
  };

  // Helper to get the rule description for an option
  const getRuleDescription = (optionKey: string) => {
    const rule = rules.find(r => r.effect.target_option_key === optionKey);
    return rule?.description || '';
  };

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
        price: val.extra_data?.price || 0,
        pricingMethod: val.extra_data?.pricing_method || 'fixed'
      }));
  };

  // Helper to handle option change and notify parent of price
  const handleOptionChange = (key: string, value: string | boolean, optionValues: any[], selectedValue?: any) => {
    onChange(key, String(value));
    
    if (onOptionPriceChange && typeof value === 'string') {
      const selectedOption = optionValues.find(opt => opt.value === value);
      if (selectedOption) {
        // Include pricing method and grid data from extra_data
        const pricingMethod = selectedValue?.extra_data?.pricing_method || 'fixed';
        const pricingGridData = selectedValue?.extra_data?.pricing_grid_data;
        onOptionPriceChange(key, selectedOption.price, selectedOption.label, pricingMethod, pricingGridData);
      }
    }
  };

  // Initialize selected options from existing measurements on load
  useEffect(() => {
    if (treatmentOptions.length === 0) return;
    
    console.log('🔄 DynamicRollerBlindFields: Initializing options for treatment:', treatmentCategory || templateId);
    
    treatmentOptions.forEach(option => {
      const optionValues = getOptionValues(option);
      if (optionValues.length === 0) return;
      
      const currentValue = measurements[option.key];
      const defaultValue = optionValues[0];
      
      // Auto-select first option if: no value is set OR only one option available
      const shouldAutoSelect = !currentValue || optionValues.length === 1;
      
      if (shouldAutoSelect && defaultValue) {
        console.log(`  Auto-selecting ${option.key} = ${defaultValue.value} (only one option: ${optionValues.length === 1})`);
        onChange(option.key, defaultValue.value);
        
        // Also notify parent of the price for cost summary
        if (onOptionPriceChange) {
          const firstOptionValue = option.option_values?.[0];
          const pricingMethod = firstOptionValue?.extra_data?.pricing_method || 'fixed';
          const pricingGridData = firstOptionValue?.extra_data?.pricing_grid_data;
          onOptionPriceChange(option.key, defaultValue.price, defaultValue.label, pricingMethod, pricingGridData);
        }
      } else if (currentValue && onOptionPriceChange) {
        // If value exists, ensure it's in the cost summary
        const alreadySelected = selectedOptions.some(opt => opt.name.startsWith(option.key + ':'));
        if (!alreadySelected) {
          const selectedOption = optionValues.find(opt => opt.value === currentValue);
          const selectedValue = option.option_values?.find((v: any) => v.code === currentValue || v.id === currentValue);
          if (selectedOption && selectedValue) {
            const pricingMethod = selectedValue?.extra_data?.pricing_method || 'fixed';
            const pricingGridData = selectedValue?.extra_data?.pricing_grid_data;
            console.log(`  Re-adding existing ${option.key} = ${currentValue} to cost summary`);
            onOptionPriceChange(option.key, selectedOption.price, selectedOption.label, pricingMethod, pricingGridData);
          }
        }
      }
    });
  }, [treatmentOptions.length, treatmentCategory, templateId]); // Re-run when treatment changes

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

  // Create a map of which options trigger which conditional options
  const conditionalMap = new Map<string, any[]>();
  rules.forEach(rule => {
    if (rule.effect.action === 'show_option') {
      const triggerKey = rule.condition.option_key;
      const targetKey = rule.effect.target_option_key;
      
      if (!conditionalMap.has(triggerKey)) {
        conditionalMap.set(triggerKey, []);
      }
      
      const targetOption = treatmentOptions.find(opt => opt.key === targetKey);
      if (targetOption && isOptionVisible(targetKey)) {
        // Check if this option is already in the list (deduplicate)
        const existingOptions = conditionalMap.get(triggerKey)!;
        if (!existingOptions.some(opt => opt.key === targetKey)) {
          existingOptions.push(targetOption);
        }
      }
    }
  });

  // Separate base options from conditional ones
  const isConditionalOption = (optionKey: string) => {
    return rules.some(r => r.effect.target_option_key === optionKey && r.effect.action === 'show_option');
  };

  // Filter visible options - exclude conditional options from main list
  const visibleOptions = treatmentOptions
    .filter(opt => {
      // Skip conditional options - they'll be rendered with their triggers
      if (isConditionalOption(opt.key)) {
        return false;
      }
      
      // For base options, check visibility
      const hasRule = rules.some(r => r.effect.target_option_key === opt.key);
      if (hasRule) {
        return isOptionVisible(opt.key);
      }
      return opt.visible;
    })
    .sort((a, b) => a.order_index - b.order_index)
    .filter((opt, index, self) => 
      index === self.findIndex(o => o.key === opt.key)
    );

  // Helper to render a single option field
  const renderOption = (option: any, isConditional: boolean = false) => {
    // Check conditional visibility
    if (option.validation?.show_if && !isConditionMet(option.validation.show_if)) {
      return null;
    }

    const optionValues = getOptionValues(option);
    const currentValue = measurements[option.key];
    const ruleDefaultValue = getDefaultValue(option.key);
    const defaultValue = ruleDefaultValue || optionValues[0]?.value;
    const isRequired = option.required || isOptionRequired(option.key);

    const wrapperClass = isConditional 
      ? "ml-4 pl-4 border-l-2 border-purple-300 bg-gradient-to-r from-purple-50 to-transparent p-3 rounded-r-lg animate-in slide-in-from-left duration-300" 
      : "";

    // Render based on input_type
    const renderField = () => {
      switch (option.input_type) {
        case 'select':
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={option.key}>
                  {isConditional && <Sparkles className="h-3 w-3 text-purple-500 inline mr-1" />}
                  {option.label}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {isConditional && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-purple-100 text-purple-800">
                    <ChevronDown className="h-3 w-3" />
                    Appears conditionally
                  </Badge>
                )}
              </div>
                <Select
                  value={currentValue || defaultValue}
                  onValueChange={(value) => {
                    const selectedValue = option.option_values?.find((v: any) => v.code === value || v.id === value);
                    handleOptionChange(option.key, value, optionValues, selectedValue);
                  }}
                  disabled={readOnly}
                >
                <SelectTrigger id={option.key} className={isConditional ? "border-purple-200 focus:ring-purple-500" : ""}>
                  <SelectValue placeholder={`Select ${option.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {optionValues.map(opt => (
                    <SelectItem key={opt.id} value={opt.value}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="flex-1">{opt.label}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {opt.pricingMethod && opt.pricingMethod !== 'fixed' && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                              {opt.pricingMethod === 'per-meter' ? 'per m' : 
                               opt.pricingMethod === 'per-sqm' ? 'per m²' : 
                               opt.pricingMethod === 'pricing-grid' ? 'grid' : opt.pricingMethod}
                            </Badge>
                          )}
                          {opt.price > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +${opt.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* CRITICAL: Render sub-options when a value is selected */}
              {(() => {
                const selectedValueId = currentValue || defaultValue;
                if (!selectedValueId) return null;
                
                // Try to match by BOTH code and id since we store code but DB has both
                const selectedOptionValue = option.option_values?.find((v: any) => 
                  v.code === selectedValueId || v.id === selectedValueId
                );
                const subOptions = selectedOptionValue?.extra_data?.sub_options;
                
                console.log('🔍🔍🔍 SUB-OPTIONS CHECK (Roller):', {
                  optionKey: option.key,
                  optionLabel: option.label,
                  selectedValueId,
                  allOptionValues: option.option_values?.map((v: any) => ({ code: v.code, id: v.id, label: v.label })),
                  selectedOptionValue,
                  hasSubOptions: !!subOptions,
                  subOptions
                });
                
                if (!subOptions || subOptions.length === 0) {
                  console.log('❌ No sub-options for', option.key);
                  return null;
                }
                
                console.log('✅✅✅ RENDERING SUB-OPTIONS:', subOptions);
                
                return (
                  <div className="ml-4 mt-2 space-y-2 pl-3 border-l-2 border-muted">
                    {subOptions.map((subOption: any) => {
                      // Auto-select sub-option if only one choice or no current value
                      const subOptionKey = `${option.key}_${subOption.key}`;
                      const currentSubValue = measurements[subOptionKey];
                      const shouldAutoSelectSub = !currentSubValue || (subOption.choices && subOption.choices.length === 1);
                      
                      if (shouldAutoSelectSub && subOption.choices && subOption.choices.length > 0) {
                        const firstChoice = subOption.choices[0];
                        
                        // Only auto-select if not already set
                        if (!currentSubValue) {
                          console.log(`  🎯 Auto-selecting sub-option ${subOptionKey} = ${firstChoice.value} (only one: ${subOption.choices.length === 1})`);
                          
                          // Use setTimeout to avoid state updates during render
                          setTimeout(() => {
                            onChange(subOptionKey, firstChoice.value);
                            
                            if (onOptionPriceChange && firstChoice) {
                              const displayLabel = `${option.label} - ${subOption.label}: ${firstChoice.label}`;
                              // Sub-options use their own pricing (fixed) and do NOT inherit parent's pricing method/grid
                              onOptionPriceChange(subOptionKey, firstChoice.price || 0, displayLabel, 'fixed', undefined);
                            }
                          }, 0);
                        }
                      }
                      
                      return (
                      <div key={subOption.id} className="space-y-1.5">
                        <Label className="text-sm font-medium text-foreground">
                          {subOption.label}
                        </Label>
                        <Select
                          value={measurements[`${option.key}_${subOption.key}`] || ''}
                          onValueChange={(choiceValue) => {
                            console.log('🎨🎨🎨 SUB-OPTION SELECTED:', {
                              optionKey: option.key,
                              subOptionKey: subOption.key,
                              choiceValue,
                              hasOnOptionPriceChange: !!onOptionPriceChange
                            });
                            
                            onChange(`${option.key}_${subOption.key}`, choiceValue);
                            
                            // Also track pricing if available
                            if (onOptionPriceChange) {
                              const choice = subOption.choices?.find((c: any) => c.value === choiceValue);
                              console.log('🎨 Found choice:', choice);
                              
                              if (choice) {
                                // Use a clear label showing parent option + sub-option
                                const displayLabel = `${option.label} - ${subOption.label}: ${choice.label}`;
                                // Sub-options use their own pricing (fixed) and do NOT inherit parent's pricing method/grid
                                
                                console.log('🎨 Calling onOptionPriceChange:', {
                                  key: `${option.key}_${subOption.key}`,
                                  price: choice.price || 0,
                                  displayLabel,
                                  pricingMethod: 'fixed',
                                  hasPricingGridData: false
                                });
                                
                                onOptionPriceChange(`${option.key}_${subOption.key}`, choice.price || 0, displayLabel, 'fixed', undefined);
                              } else {
                                console.log('❌ No choice found for value:', choiceValue);
                              }
                            } else {
                              console.log('❌ onOptionPriceChange is not defined');
                            }
                          }}
                          disabled={readOnly}
                        >
                          <SelectTrigger className="bg-background border-input">
                            <SelectValue placeholder={`Select ${subOption.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50">
                            {subOption.choices?.map((choice: any) => {
                              // Sub-options always use fixed pricing
                              const pricingMethod = 'fixed';
                              
                              return (
                                <SelectItem key={choice.id} value={choice.value}>
                                  <div className="flex items-center justify-between gap-2 w-full">
                                    <span className="flex-1">{choice.label}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {choice.price > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          +${choice.price.toFixed(2)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                    })}
                  </div>
                );
              })()}
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>
                  {isConditional && <Sparkles className="h-3 w-3 text-purple-500 inline mr-1" />}
                  {option.label}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {isConditional && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-purple-100 text-purple-800">
                    <ChevronDown className="h-3 w-3" />
                    Appears conditionally
                  </Badge>
                )}
              </div>
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
        case 'number':
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={option.key}>
                  {isConditional && <Sparkles className="h-3 w-3 text-purple-500 inline mr-1" />}
                  {option.label}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {isConditional && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-purple-100 text-purple-800">
                    <ChevronDown className="h-3 w-3" />
                    Appears conditionally
                  </Badge>
                )}
              </div>
              <Input
                id={option.key}
                type={option.input_type}
                value={currentValue || ''}
                onChange={(e) => handleOptionChange(option.key, e.target.value, [])}
                disabled={readOnly}
                placeholder={`Enter ${option.label.toLowerCase()}`}
                className={isConditional ? "border-purple-200 focus:ring-purple-500" : ""}
              />
            </div>
          );

        case 'boolean':
          return (
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={option.key}>
                  {isConditional && <Sparkles className="h-3 w-3 text-purple-500 inline mr-1" />}
                  {option.label}
                  {isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                {isConditional && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-purple-100 text-purple-800">
                    <ChevronDown className="h-3 w-3" />
                    Appears conditionally
                  </Badge>
                )}
              </div>
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
    };

    return (
      <div key={option.id} className={wrapperClass}>
        {renderField()}
      </div>
    );
  };

  // Recursive function to render option and its conditional children
  const renderOptionWithChildren = (option: any, isConditional: boolean = false): React.ReactNode => {
    return (
      <div key={option.id}>
        {/* Render the option itself */}
        {renderOption(option, isConditional)}
        
        {/* Render any conditional options that appear below this one (recursively) */}
        {conditionalMap.has(option.key) && conditionalMap.get(option.key)!.length > 0 && (
          <div className="mt-2 space-y-2">
            {conditionalMap.get(option.key)!.map(condOption => (
              renderOptionWithChildren(condOption, true)
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {visibleOptions.map(option => renderOptionWithChildren(option, false))}
    </div>
  );
};
