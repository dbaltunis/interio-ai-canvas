import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeadingSelectorSkeleton, FabricSelectorSkeleton } from "@/components/shared/SkeletonLoader";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Loader2 } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { getOptionPrice } from "@/utils/optionDataAdapter";
import type { EyeletRing } from "@/hooks/useEyeletRings";
import { validateTreatmentOptions } from "@/utils/treatmentOptionValidation";
import { ValidationAlert } from "@/components/shared/ValidationAlert";

interface DynamicCurtainOptionsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: any) => void;
  template?: any; // The selected curtain template
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string) => void;
  selectedOptions?: Array<{ name: string; price: number }>;
  selectedEyeletRing?: string;
  onEyeletRingChange?: (ringId: string) => void;
}

export const DynamicCurtainOptions = ({
  measurements,
  onChange,
  template,
  readOnly = false,
  onOptionPriceChange,
  selectedOptions = [],
  selectedEyeletRing,
  onEyeletRingChange
}: DynamicCurtainOptionsProps) => {
  const [availableRings, setAvailableRings] = useState<EyeletRing[]>([]);
  const [treatmentOptionSelections, setTreatmentOptionSelections] = useState<Record<string, string>>({});
  
  // Early returns MUST come before hooks to prevent violations
  if (!template) {
    return (
      <div className="text-sm text-muted-foreground">
        Please select a curtain template first
      </div>
    );
  }

  // Hooks MUST be called unconditionally after early returns
  const { units } = useMeasurementUnits();
  const { data: inventory = [], isLoading: headingsLoading } = useEnhancedInventory();
  const { data: treatmentOptions = [], isLoading: treatmentOptionsLoading } = useTreatmentOptions('curtains', 'category');
  
  // Filter for heading items from inventory
  const headingOptions = inventory.filter(item => 
    item.category?.toLowerCase().includes('heading') || 
    item.category?.toLowerCase().includes('hardware') ||
    item.category?.toLowerCase().includes('pleat')
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency || 'USD'
    }).format(amount);
  };

  const handleHeadingChange = (headingId: string) => {
    console.log('🔥🔥🔥 DROPDOWN FIRED: handleHeadingChange', { headingId });
    
    const heading = headingOptions.find(h => h.id === headingId);
    console.log('🔥🔥🔥 Found heading:', heading);
    
    if (heading && onOptionPriceChange) {
      // Headings are stored in enhanced_inventory_items - use correct pricing fields
      const headingPrice = heading.price_per_meter || heading.selling_price || 0;
      onOptionPriceChange('heading', headingPrice, heading.name);
    }
    onChange('selected_heading', headingId);
    
    // ✅ FIX: Update heading fullness ratio when heading is selected
    if (heading && heading.metadata) {
      const metadata = heading.metadata as any;
      
      // Check for multiple fullness ratios first
      if (metadata.use_multiple_ratios && metadata.multiple_fullness_ratios && metadata.multiple_fullness_ratios.length > 0) {
        console.log('🔥🔥🔥 Setting first fullness from multiple ratios:', metadata.multiple_fullness_ratios[0]);
        onChange('heading_fullness', metadata.multiple_fullness_ratios[0]);
      } else if (metadata.fullness_ratio) {
        console.log('🔥🔥🔥 Setting heading fullness:', metadata.fullness_ratio);
        onChange('heading_fullness', metadata.fullness_ratio);
      }
      
      // Check for eyelet rings
      console.log('🔍 DynamicCurtainOptions - Selected heading:', {
        id: heading.id,
        name: heading.name,
        heading_type: metadata.heading_type,
        has_eyelet_rings: !!metadata.eyelet_rings,
        rings: metadata.eyelet_rings
      });
      
      if (metadata.heading_type === 'eyelet' && metadata.eyelet_rings) {
        setAvailableRings(metadata.eyelet_rings);
        // Auto-select first ring if none selected
        if (!selectedEyeletRing && metadata.eyelet_rings.length > 0 && onEyeletRingChange) {
          onEyeletRingChange(metadata.eyelet_rings[0].id);
        }
      } else {
        setAvailableRings([]);
      }
    } else if (heading && (heading as any).fullness_ratio) {
      // Fallback for headings without metadata
      console.log('🔥🔥🔥 Setting heading fullness from direct property:', (heading as any).fullness_ratio);
      onChange('heading_fullness', (heading as any).fullness_ratio);
      setAvailableRings([]);
    } else {
      setAvailableRings([]);
    }
  };

  const handleLiningChange = (liningType: string) => {
    console.log('🔥🔥🔥 DROPDOWN FIRED: handleLiningChange', { liningType });
    
    const lining = template?.lining_types?.find((l: any) => l.type === liningType);
    console.log('🔥🔥🔥 Found lining:', lining);
    
    if (lining && onOptionPriceChange) {
      const totalPrice = (lining.price_per_metre || 0) + (lining.labour_per_curtain || 0);
      onOptionPriceChange('lining', totalPrice, lining.type);
    }
    onChange('selected_lining', liningType);
    
    console.log('🧵 Lining changed:', {
      type: liningType,
      found: !!lining,
      price: lining ? (lining.price_per_metre || 0) + (lining.labour_per_curtain || 0) : 0
    });
  };

  const handlePricingMethodChange = (methodId: string) => {
    console.log('🔥🔥🔥 DROPDOWN FIRED: handlePricingMethodChange', { methodId });
    
    const method = template?.pricing_methods?.find((m: any) => m.id === methodId);
    console.log('🔥🔥🔥 Found pricing method:', method);
    
    if (method) {
      onChange('selected_pricing_method', methodId);
      // Update pricing type in measurements
      onChange('pricing_type', method.pricing_type);
    }
  };

  const handleManufacturingTypeChange = (type: 'machine' | 'hand') => {
    console.log('🔥🔥🔥 DROPDOWN FIRED: handleManufacturingTypeChange', { type });
    onChange('manufacturing_type', type);
    console.log('🏭 Manufacturing type changed to:', type);
  };

  const handleTreatmentOptionChange = (optionKey: string, valueId: string) => {
    setTreatmentOptionSelections(prev => ({ ...prev, [optionKey]: valueId }));
    
    // Find the selected option value and its price
    const option = treatmentOptions.find(opt => opt.key === optionKey);
    if (option && option.option_values) {
      const selectedValue = option.option_values.find(val => val.id === valueId);
      if (selectedValue && onOptionPriceChange) {
        const price = getOptionPrice(selectedValue);
        onOptionPriceChange(optionKey, price, selectedValue.label);
      }
    }
    
    // Store in measurements
    onChange(`treatment_option_${optionKey}`, valueId);
  };

  // Validate treatment options
  const validation = useMemo(() => {
    if (treatmentOptionsLoading) return { isValid: true, errors: [], warnings: [] };
    return validateTreatmentOptions(treatmentOptions, treatmentOptionSelections);
  }, [treatmentOptions, treatmentOptionSelections, treatmentOptionsLoading]);

  if (headingsLoading || treatmentOptionsLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Get the selected pricing method to display correct prices
  const selectedPricingMethod = measurements.selected_pricing_method 
    ? template.pricing_methods?.find((m: any) => m.id === measurements.selected_pricing_method)
    : template.pricing_methods?.[0]; // Default to first method

  // Debug: Log template pricing to see what values we're getting
  console.log('💰 DynamicCurtainOptions pricing debug:', {
    templateName: template.name,
    selectedPricingMethodId: measurements.selected_pricing_method,
    selectedMethod: selectedPricingMethod,
    templateLevelPrices: {
      machine_price_per_metre: template.machine_price_per_metre,
      hand_price_per_metre: template.hand_price_per_metre,
      machine_price_per_drop: template.machine_price_per_drop,
      hand_price_per_drop: template.hand_price_per_drop,
    },
    methodLevelPrices: selectedPricingMethod ? {
      machine_price_per_metre: selectedPricingMethod.machine_price_per_metre,
      hand_price_per_metre: selectedPricingMethod.hand_price_per_metre,
      machine_price_per_drop: selectedPricingMethod.machine_price_per_drop,
      hand_price_per_drop: selectedPricingMethod.hand_price_per_drop,
      machine_price_per_panel: selectedPricingMethod.machine_price_per_panel,
      hand_price_per_panel: selectedPricingMethod.hand_price_per_panel,
    } : null,
    offers_hand_finished: template.offers_hand_finished,
    manufacturing_type: template.manufacturing_type,
    pricing_type: template.pricing_type
  });

  // Determine which prices to use - prefer pricing method prices, fallback to template prices
  const machinePricePerMetre = selectedPricingMethod?.machine_price_per_metre ?? template.machine_price_per_metre;
  const handPricePerMetre = selectedPricingMethod?.hand_price_per_metre ?? template.hand_price_per_metre;
  const machinePricePerDrop = selectedPricingMethod?.machine_price_per_drop ?? template.machine_price_per_drop;
  const handPricePerDrop = selectedPricingMethod?.hand_price_per_drop ?? template.hand_price_per_drop;
  const machinePricePerPanel = selectedPricingMethod?.machine_price_per_panel ?? template.machine_price_per_panel;
  const handPricePerPanel = selectedPricingMethod?.hand_price_per_panel ?? template.hand_price_per_panel;

  // Filter headings based on template's selected_heading_ids
  const availableHeadings = template.selected_heading_ids && template.selected_heading_ids.length > 0
    ? headingOptions.filter(h => template.selected_heading_ids.includes(h.id))
    : headingOptions;

  return (
    <div className="space-y-3 px-3">
      {/* Validation Alert */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <ValidationAlert 
          errors={validation.errors}
          warnings={validation.warnings}
        />
      )}

      {/* Heading Type - Top Level Category */}
      {availableHeadings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Heading Type</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Select Type</span>
            <div className="w-64">
              <Select
                value={measurements.selected_heading || ''}
                onValueChange={handleHeadingChange}
                disabled={readOnly}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent 
                  className="bg-popover border-border z-50 max-h-[300px]"
                  position="popper"
                  sideOffset={5}
                >
                  {availableHeadings.map(heading => (
                    <SelectItem key={heading.id} value={heading.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{heading.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(heading.price_per_meter || heading.selling_price || 0)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Multiple Fullness Ratio Selector - Show when heading has multiple options */}
          {(() => {
            const selectedHeading = headingOptions.find(h => h.id === measurements.selected_heading);
            if (!selectedHeading || !selectedHeading.metadata) return null;
            
            const metadata = selectedHeading.metadata as any;
            if (!metadata.use_multiple_ratios || !metadata.multiple_fullness_ratios || metadata.multiple_fullness_ratios.length <= 1) {
              return null;
            }
            
            return (
              <div className="ml-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fullness Ratio</span>
                  <div className="w-64">
                    <Select 
                      value={measurements.heading_fullness?.toString() || metadata.multiple_fullness_ratios[0].toString()} 
                      onValueChange={(value) => onChange('heading_fullness', parseFloat(value))}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Select fullness..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50" position="popper" sideOffset={5}>
                        {metadata.multiple_fullness_ratios.map((ratio: number) => (
                          <SelectItem key={ratio} value={ratio.toString()}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{ratio}x Fullness</span>
                              <Badge variant="secondary" className="text-xs">
                                {ratio}x
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Extra Fabric Info */}
                {metadata.extra_fabric && metadata.extra_fabric > 0 && (
                  <div className="ml-4 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        +{metadata.extra_fabric} {units.fabric} extra fabric included
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Eyelet Ring - Nested under Heading (indented) */}
          {availableRings.length > 0 && onEyeletRingChange && (
            <div className="ml-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ring Type</span>
                <div className="w-64">
                  <Select 
                    value={selectedEyeletRing} 
                    onValueChange={onEyeletRingChange}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-50" position="popper" sideOffset={5}>
                      {availableRings.map((ring) => (
                        <SelectItem key={ring.id} value={ring.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{ring.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {ring.color} • {ring.diameter}mm
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* Lining Type - Top Level Category */}
      {template.lining_types && template.lining_types.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Lining Type</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Select Lining</span>
            <div className="w-64">
              <Select
                value={measurements.selected_lining || ''}
                onValueChange={handleLiningChange}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent 
                  className="bg-popover border-border"
                  position="popper"
                  sideOffset={5}
                >
                  <SelectItem value="none">No Lining</SelectItem>
                  {template.lining_types.map((lining: any, index: number) => (
                    <SelectItem key={index} value={lining.type}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{lining.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency((lining.price_per_metre || 0) + (lining.labour_per_curtain || 0))}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Method - Top Level Category */}
      {template.pricing_methods && template.pricing_methods.length > 1 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Pricing Method</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fabric Width</span>
            <div className="w-64">
              <Select
                value={measurements.selected_pricing_method || ''}
                onValueChange={handlePricingMethodChange}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent 
                  className="bg-popover border-border"
                  position="popper"
                  sideOffset={5}
                >
                  {template.pricing_methods.map((method: any) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{method.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {method.fabric_width_type === 'wide' ? 'Wide' : 'Narrow'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Manufacturing Type - Top Level Category */}
      {template.offers_hand_finished && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Make-Up Type</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Finish Type</span>
            <div className="w-64">
              <Select
                value={measurements.manufacturing_type || template.manufacturing_type || 'machine'}
                onValueChange={handleManufacturingTypeChange}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent 
                  className="bg-popover border-border"
                  position="popper"
                  sideOffset={5}
                >
                  <SelectItem value="machine">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>Machine Finished</span>
                      {(machinePricePerMetre > 0 || machinePricePerDrop > 0 || machinePricePerPanel > 0) && (
                        <div className="flex gap-1">
                          {machinePricePerMetre > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(machinePricePerMetre)}/m
                            </Badge>
                          )}
                          {machinePricePerDrop > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(machinePricePerDrop)}/drop
                            </Badge>
                          )}
                          {machinePricePerPanel > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(machinePricePerPanel)}/panel
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                  <SelectItem value="hand">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>Hand Finished</span>
                      {(handPricePerMetre > 0 || handPricePerDrop > 0 || handPricePerPanel > 0) && (
                        <div className="flex gap-1">
                          {handPricePerMetre > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(handPricePerMetre)}/m
                            </Badge>
                          )}
                          {handPricePerDrop > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(handPricePerDrop)}/drop
                            </Badge>
                          )}
                          {handPricePerPanel > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {formatCurrency(handPricePerPanel)}/panel
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Treatment Options from Database */}
      {treatmentOptions.length > 0 && treatmentOptions.map(option => {
        if (!option.visible || !option.option_values || option.option_values.length === 0) {
          return null;
        }

        const selectedValueId = treatmentOptionSelections[option.key] || measurements[`treatment_option_${option.key}`];
        const selectedValue = option.option_values.find(v => v.id === selectedValueId);
        const subOptions = selectedValue?.extra_data?.sub_options;

        return (
          <div key={option.id} className="space-y-3">
            <h4 className="font-medium text-foreground">{option.label}</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Select {option.label}</span>
              <div className="w-64">
                <Select
                  value={selectedValueId || ''}
                  onValueChange={(value) => handleTreatmentOptionChange(option.key, value)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-popover border-border z-50"
                    position="popper"
                    sideOffset={5}
                  >
                    {option.option_values.map(value => {
                      const price = getOptionPrice(value);
                      return (
                        <SelectItem key={value.id} value={value.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{value.label}</span>
                            {price > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {formatCurrency(price)}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub-options - Nested under selected option (indented) */}
            {subOptions && subOptions.length > 0 && (
              <div className="ml-4 space-y-3">
                {subOptions.map((subOption: any) => (
                  <div key={subOption.id} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{subOption.label}</span>
                    <div className="w-64">
                      <Select
                        value={treatmentOptionSelections[`${option.key}_${subOption.key}`] || ''}
                        onValueChange={(choiceValue) => {
                          handleTreatmentOptionChange(`${option.key}_${subOption.key}`, choiceValue);
                          
                          if (onOptionPriceChange) {
                            const choice = subOption.choices?.find((c: any) => c.value === choiceValue);
                            if (choice) {
                              const displayLabel = `${option.label} - ${subOption.label}: ${choice.label}`;
                              onOptionPriceChange(`${option.key}_${subOption.key}`, choice.price || 0, displayLabel);
                            }
                          }
                        }}
                        disabled={readOnly}
                      >
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50">
                          {subOption.choices.map((choice: any) => (
                            <SelectItem key={choice.id} value={choice.value}>
                              <div className="flex items-center justify-between gap-4 w-full">
                                <span>{choice.label}</span>
                                {choice.price > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{formatCurrency(choice.price)}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
};