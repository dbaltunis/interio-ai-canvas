import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { useConditionalOptions } from "@/hooks/useConditionalOptions";
import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { convertLength } from "@/hooks/useBusinessSettings";
import { Loader2, Info, Sparkles, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DynamicRollerBlindFieldsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: string) => void;
  templateId?: string;
  treatmentCategory?: string;
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string, pricingMethod?: string, pricingGridData?: any, orderIndex?: number) => void;
  selectedOptions?: Array<{ name: string; price: number; pricingMethod?: string }>;
  onSelectedOptionsChange?: (options: Array<{ name: string; price: number; pricingMethod?: string }>) => void;
}

export const DynamicRollerBlindFields = ({ 
  measurements, 
  onChange, 
  templateId,
  treatmentCategory,
  readOnly = false,
  onOptionPriceChange,
  selectedOptions = [],
  onSelectedOptionsChange
}: DynamicRollerBlindFieldsProps) => {
  // Get measurement units for proper conversion
  const { units } = useMeasurementUnits();
  
  // Track which sub-category is selected for cascading dropdowns
  const [subCategorySelections, setSubCategorySelections] = useState<Record<string, string>>({});
  // Track if sub-category selections have been restored from saved data
  const [subCategoryRestored, setSubCategoryRestored] = useState(false);

  // Query by templateId (preferred) to get all linked options including TWC options
  // Fallback to category if no templateId is available
  const { data: allOptions = [], isLoading } = useTreatmentOptions(
    templateId || treatmentCategory, 
    templateId ? 'template' : 'category'
  );
  
  // Filter by template_option_settings if templateId is available
  const [treatmentOptions, setTreatmentOptions] = useState<any[]>([]);
  
  useEffect(() => {
    const filterByTemplateSettings = async () => {
      if (!templateId || allOptions.length === 0) {
        setTreatmentOptions(allOptions);
        return;
      }
      
      // Fetch template_option_settings to see which options are enabled
      const { data: settings } = await supabase
        .from('template_option_settings')
        .select('treatment_option_id, is_enabled')
        .eq('template_id', templateId);
      
      const settingsMap = new Map(
        settings?.map(s => [s.treatment_option_id, s.is_enabled]) || []
      );
      
      const hasAnySettings = settings && settings.length > 0;
      
      // WHITELIST APPROACH: If template HAS settings, only show explicitly enabled options
      // This prevents unlinked duplicate options from appearing
      const enabledOptions = allOptions.filter(opt => {
        if (!hasAnySettings) {
          // No settings at all = show all options (backward compatible for templates without settings)
          return true;
        }
        
        if (!settingsMap.has(opt.id)) {
          // Template HAS settings but this option is NOT linked = hide it
          console.log(`❌ Hiding option "${opt.label}" - not linked to template settings`);
          return false;
        }
        
        const isEnabled = settingsMap.get(opt.id);
        if (!isEnabled) {
          console.log(`❌ Hiding option "${opt.label}" - disabled in template settings`);
        }
        return isEnabled;
      });
      
      console.log(`✅ WHITELIST: Showing ${enabledOptions.length} enabled options out of ${allOptions.length} total (template has ${settings?.length || 0} settings)`);
      setTreatmentOptions(enabledOptions);
    };
    
    filterByTemplateSettings();
  }, [templateId, allOptions]);

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
    if (!option.option_values || option.option_values.length === 0) {
      console.warn(`⚠️ Option "${option.label}" (${option.key}) has NO values configured`);
      return [];
    }
    
    return option.option_values
      .filter((val: any) => val.extra_data?.visible !== false) // Hide explicitly invisible values
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((val: any) => {
        // Extract price from either 'price' or 'price_modifier' field
        const price = val.extra_data?.price ?? val.extra_data?.price_modifier ?? 0;
        
        return {
          value: val.code,
          label: val.label,
          id: val.id,
          price: price,
          pricingMethod: val.extra_data?.pricing_method || 'fixed'
        };
      });
  };

  // Helper to calculate price (handles pricing-grid method)
  const calculateOptionPrice = (basePrice: number, pricingMethod: string, pricingGridData: any): number => {
    if (pricingMethod === 'pricing-grid' && pricingGridData) {
      // ✅ CRITICAL FIX: measurements are in USER'S DISPLAY UNIT, convert to CM for grid lookup
      const rawWidth = parseFloat(measurements.rail_width) || 0;
      const rawHeight = parseFloat(measurements.drop) || 0;
      const widthCm = convertLength(rawWidth, units.length, 'cm');
      const heightCm = convertLength(rawHeight, units.length, 'cm');
      
      // Check if it's a simple width-only array format
      if (Array.isArray(pricingGridData) && pricingGridData.length > 0 && 'width' in pricingGridData[0]) {
        // Simple width-based pricing
        const widthValues = pricingGridData.map((entry: any) => parseInt(entry.width));
        const closestWidth = widthValues.reduce((prev: number, curr: number) => {
          return Math.abs(curr - widthCm) < Math.abs(prev - widthCm) ? curr : prev;
        });
        const matchingEntry = pricingGridData.find((entry: any) => parseInt(entry.width) === closestWidth);
        return matchingEntry ? parseFloat(matchingEntry.price) : 0;
      } else {
        // Full 2D pricing grid with width and drop
        return getPriceFromGrid(pricingGridData, widthCm, heightCm);
      }
    }
    return basePrice;
  };

  // Helper to handle option change and notify parent of price
  const handleOptionChange = (key: string, value: string | boolean, optionValues: any[], selectedValue?: any, orderIndex?: number) => {
    onChange(key, String(value));
    
    if (onOptionPriceChange && typeof value === 'string') {
      const selectedOption = optionValues.find(opt => opt.value === value);
      if (selectedOption) {
        // Include pricing method and grid data from extra_data
        const pricingMethod = selectedValue?.extra_data?.pricing_method || 'fixed';
        const pricingGridData = selectedValue?.extra_data?.pricing_grid_data;
        
        // Calculate actual price (handles pricing-grid method)
        const actualPrice = calculateOptionPrice(selectedOption.price, pricingMethod, pricingGridData);
        
        if (pricingMethod === 'pricing-grid' && pricingGridData) {
          const rawWidth = parseFloat(measurements.rail_width) || 0;
          const rawHeight = parseFloat(measurements.drop) || 0;
          console.log(`💰 Calculated pricing-grid price for "${key}":`, {
            method: Array.isArray(pricingGridData) && 'width' in pricingGridData[0] ? 'width-based' : '2D grid',
            dimensions: `${convertLength(rawWidth, units.length, 'cm')}cm × ${convertLength(rawHeight, units.length, 'cm')}cm`,
            calculatedPrice: actualPrice
          });
        }
        
        onOptionPriceChange(key, actualPrice, selectedOption.label, pricingMethod, pricingGridData, orderIndex);
      }
    }
  };

  // Initialize selected options from existing measurements on load
  useEffect(() => {
    if (treatmentOptions.length === 0) return;
    
    console.log('🔄 DynamicRollerBlindFields: Initializing options:', {
      treatmentCategory: treatmentCategory || templateId,
      totalOptions: treatmentOptions.length,
      optionsBreakdown: treatmentOptions.map(opt => ({
        key: opt.key,
        label: opt.label,
        hasValues: (opt.option_values?.length || 0) > 0,
        valueCount: opt.option_values?.length || 0
      }))
    });
    
    treatmentOptions.forEach(option => {
      const optionValues = getOptionValues(option);
      if (optionValues.length === 0) {
        console.warn(`⚠️ Skipping option "${option.label}" - no values to select`);
        return;
      }
      
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
          const actualPrice = calculateOptionPrice(defaultValue.price, pricingMethod, pricingGridData);
          onOptionPriceChange(option.key, actualPrice, defaultValue.label, pricingMethod, pricingGridData, (option as any).template_order_index);
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
            const actualPrice = calculateOptionPrice(selectedOption.price, pricingMethod, pricingGridData);
            console.log(`  Re-adding existing ${option.key} = ${currentValue} to cost summary`);
            onOptionPriceChange(option.key, actualPrice, selectedOption.label, pricingMethod, pricingGridData, (option as any).template_order_index);
          }
        }
      }
    });
  }, [treatmentOptions.length, treatmentCategory, templateId]); // Re-run when treatment changes

  // Restore sub-category selections from saved measurements when editing
  useEffect(() => {
    if (treatmentOptions.length === 0 || subCategoryRestored) return;
    
    const restoredSubCategories: Record<string, string> = {};
    let hasRestorations = false;
    
    treatmentOptions.forEach(option => {
      if (!option.visible || !option.option_values) return;
      
      // Check if there's a saved main selection for this option
      const optionValues = getOptionValues(option);
      const currentValue = measurements[option.key];
      if (!currentValue) return;
      
      const selectedValue = option.option_values.find((v: any) => v.code === currentValue || v.id === currentValue);
      const subOptions = selectedValue?.extra_data?.sub_options;
      
      if (!subOptions || subOptions.length === 0) return;
      
      // Check each sub-option to see if there's saved data for it
      for (const subOption of subOptions) {
        const subKey = `${option.key}_${subOption.key}`;
        const savedSubValue = measurements[subKey];
        
        if (savedSubValue) {
          restoredSubCategories[option.key] = subOption.key;
          hasRestorations = true;
          console.log(`🔄 Restored sub-category selection for ${option.label}: ${subOption.label}`);
          break; // Found the active sub-category for this option
        }
      }
    });
    
    if (hasRestorations) {
      setSubCategorySelections(prev => ({ ...prev, ...restoredSubCategories }));
    }
    setSubCategoryRestored(true);
  }, [treatmentOptions.length, measurements, subCategoryRestored]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (treatmentOptions.length === 0) {
    console.error('❌ NO OPTIONS AVAILABLE - This is the problem!', {
      templateId,
      treatmentCategory,
      allOptionsCount: allOptions.length,
      treatmentOptionsCount: treatmentOptions.length,
      isLoading,
      message: allOptions.length === 0 
        ? 'No options fetched from database - check treatment_options table for this category'
        : 'All options filtered out by template_option_settings - check if all options are disabled'
    });
    
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
        <p className="text-sm text-amber-800 font-medium">
          No window treatment options configured
        </p>
        <p className="text-xs text-amber-700 mt-1">
          {allOptions.length === 0 
            ? `No options found in database for treatment category: "${treatmentCategory}". Please add treatment options in Settings → System Settings → Treatment Settings.`
            : `All options are disabled for this template. Please enable options in template settings.`
          }
        </p>
        <details className="mt-2">
          <summary className="text-xs text-amber-700 cursor-pointer">Debug Info</summary>
          <pre className="text-xs text-amber-600 mt-1 overflow-auto">
            {JSON.stringify({
              templateId,
              treatmentCategory,
              allOptionsCount: allOptions.length,
              treatmentOptionsCount: treatmentOptions.length
            }, null, 2)}
          </pre>
        </details>
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
      // Skip options with no values configured
      if (!opt.option_values || opt.option_values.length === 0) {
        console.warn(`⚠️ Hiding option "${opt.label}" (${opt.key}) - no values configured`);
        return false;
      }
      
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
  
  // Count options with missing values for diagnostic
  const optionsWithoutValues = treatmentOptions.filter(opt => 
    !opt.option_values || opt.option_values.length === 0
  );
  
  if (optionsWithoutValues.length > 0) {
    console.log('📊 Options without values (won\'t display):', {
      count: optionsWithoutValues.length,
      options: optionsWithoutValues.map(o => ({ key: o.key, label: o.label }))
    });
  }

  // Helper to render a single option field
  const renderOption = (option: any, isConditional: boolean = false) => {
    // Check conditional visibility
    if (option.validation?.show_if && !isConditionMet(option.validation.show_if)) {
      return null;
    }

    const optionValues = getOptionValues(option);
    
    // Don't render if no values available
    if (optionValues.length === 0) {
      return null;
    }
    
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
                    handleOptionChange(option.key, value, optionValues, selectedValue, (option as any).template_order_index);
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
                  <div className="ml-4 mt-2 space-y-3 pl-3 border-l-2 border-muted">
                    {/* Step 1: Category selector - choose between sub-option types */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground">Select Type</Label>
                      <Select
                        value={subCategorySelections[option.key] || ''}
                        onValueChange={(categoryKey) => {
                          setSubCategorySelections(prev => ({ ...prev, [option.key]: categoryKey }));
                          // Clear previous item selection when category changes
                          const prevCategory = subCategorySelections[option.key];
                          if (prevCategory && prevCategory !== categoryKey) {
                            onChange(`${option.key}_${prevCategory}`, '');
                          }
                        }}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50">
                          {subOptions.map((subOption: any) => (
                            <SelectItem key={subOption.id} value={subOption.key}>
                              {subOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Step 2: Item selector - shows ONLY when category is selected */}
                    {subCategorySelections[option.key] && (() => {
                      const selectedSubOption = subOptions.find((so: any) => so.key === subCategorySelections[option.key]);
                      if (!selectedSubOption || !selectedSubOption.choices) return null;
                      
                      return (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium text-foreground">{selectedSubOption.label}</Label>
                          <Select
                            value={measurements[`${option.key}_${selectedSubOption.key}`] || ''}
                            onValueChange={(choiceValue) => {
                              onChange(`${option.key}_${selectedSubOption.key}`, choiceValue);
                              
                              const choice = selectedSubOption.choices?.find((c: any) => c.value === choiceValue);
                              if (choice) {
                                const displayLabel = `${option.label} - ${selectedSubOption.label}: ${choice.label}`;
                                const price = choice.price || 0;
                                
                                // Update option price
                                if (onOptionPriceChange) {
                                  onOptionPriceChange(`${option.key}_${selectedSubOption.key}`, price, displayLabel, 'fixed', undefined, (option as any).template_order_index);
                                }
                                
                                // CRITICAL: Also update selectedOptions for Cost Summary display
                                if (onSelectedOptionsChange) {
                                  const updatedOptions = selectedOptions.filter(opt => 
                                    !opt.name.startsWith(`${option.label} - ${selectedSubOption.label}`)
                                  );
                                  updatedOptions.push({
                                    name: displayLabel,
                                    price: price,
                                    pricingMethod: 'fixed'
                                  });
                                  onSelectedOptionsChange(updatedOptions);
                                }
                              }
                            }}
                            disabled={readOnly}
                          >
                            <SelectTrigger className="bg-background border-input">
                              <SelectValue placeholder={`Select ${selectedSubOption.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border z-50">
                              {selectedSubOption.choices?.map((choice: any) => (
                                <SelectItem key={choice.id} value={choice.value}>
                                  <div className="flex items-center justify-between gap-2 w-full">
                                    <span className="flex-1">{choice.label}</span>
                                    {choice.price > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        +${choice.price.toFixed(2)}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })()}
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
                onValueChange={(value) => handleOptionChange(option.key, value, optionValues, undefined, (option as any).template_order_index)}
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
                onChange={(e) => handleOptionChange(option.key, e.target.value, [], undefined, (option as any).template_order_index)}
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
                onCheckedChange={(checked) => handleOptionChange(option.key, checked, [], undefined, (option as any).template_order_index)}
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
