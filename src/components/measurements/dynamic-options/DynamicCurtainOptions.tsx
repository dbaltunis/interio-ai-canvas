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
    if (heading && (heading as any).fullness_ratio) {
      console.log('🔥🔥🔥 Setting heading fullness:', (heading as any).fullness_ratio);
      onChange('heading_fullness', (heading as any).fullness_ratio);
    }
    
    // Check for eyelet rings
    if (heading && heading.metadata) {
      const metadata = heading.metadata as any;
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
    <div className="space-y-4">
      {/* Validation Alert */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <ValidationAlert 
          errors={validation.errors}
          warnings={validation.warnings}
        />
      )}

      {/* Heading Selection - Hierarchical Display */}
      {availableHeadings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            Heading Type
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </h4>
          
          <div className="ml-4 space-y-2">
            {availableHeadings.map(heading => (
              <div 
                key={heading.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => !readOnly && handleHeadingChange(heading.id)}
              >
                <input
                  type="radio"
                  id={heading.id}
                  name="heading"
                  checked={measurements.selected_heading === heading.id}
                  onChange={() => handleHeadingChange(heading.id)}
                  disabled={readOnly}
                  className="rounded-full border-gray-300"
                />
                
                {heading.image_url && (
                  <img 
                    src={heading.image_url} 
                    alt={heading.name}
                    className="w-12 h-12 object-cover rounded border"
                  />
                )}
                
                <Label htmlFor={heading.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{heading.name}</span>
                      {(heading as any).fullness_ratio && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Fullness: {(heading as any).fullness_ratio}x  {(heading as any).fullness_ratio === 0 && '0'}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(heading.price_per_meter || heading.selling_price || 0)}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eyelet Ring Selection - Only show if eyelet heading selected */}
      {availableRings.length > 0 && onEyeletRingChange && (
        <div className="space-y-3">
          <h5 className="font-medium text-foreground ml-4">Eyelet Ring</h5>
          
          <div className="ml-8 space-y-2">
            {availableRings.map((ring) => (
              <div 
                key={ring.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => !readOnly && onEyeletRingChange(ring.id)}
              >
                <input
                  type="radio"
                  id={ring.id}
                  name="eyelet-ring"
                  checked={selectedEyeletRing === ring.id}
                  onChange={() => onEyeletRingChange(ring.id)}
                  disabled={readOnly}
                  className="rounded-full border-gray-300"
                />
                
                <Label htmlFor={ring.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ring.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {ring.color} • {ring.diameter}mm
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lining Selection */}
      {template.lining_types && template.lining_types.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-foreground">Lining Type</h5>
          
          <div className="ml-4 space-y-2">
            <div 
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => handleLiningChange('none')}
            >
              <input
                type="radio"
                id="lining-none"
                name="lining"
                checked={measurements.selected_lining === 'none' || !measurements.selected_lining}
                onChange={() => handleLiningChange('none')}
                className="rounded-full border-gray-300"
              />
              
              <Label htmlFor="lining-none" className="flex-1 cursor-pointer">
                <span className="font-medium">No Lining</span>
              </Label>
            </div>
            
            {template.lining_types.map((lining: any, index: number) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleLiningChange(lining.type)}
              >
                <input
                  type="radio"
                  id={`lining-${index}`}
                  name="lining"
                  checked={measurements.selected_lining === lining.type}
                  onChange={() => handleLiningChange(lining.type)}
                  className="rounded-full border-gray-300"
                />
                
                <Label htmlFor={`lining-${index}`} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lining.type}</span>
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency((lining.price_per_metre || 0) + (lining.labour_per_curtain || 0))}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Method Selection */}
      {template.pricing_methods && template.pricing_methods.length > 1 && (
        <div className="space-y-3">
          <h5 className="font-medium text-foreground flex items-center gap-2">
            Pricing Method
            <Badge variant="secondary" className="text-xs">Choose fabric width</Badge>
          </h5>
          
          <div className="ml-4 space-y-2">
            {template.pricing_methods.map((method: any) => (
              <div 
                key={method.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handlePricingMethodChange(method.id)}
              >
                <input
                  type="radio"
                  id={method.id}
                  name="pricing-method"
                  checked={measurements.selected_pricing_method === method.id}
                  onChange={() => handlePricingMethodChange(method.id)}
                  className="rounded-full border-gray-300"
                />
                
                <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{method.name}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.fabric_width_type === 'wide' ? 'Wide Fabric' : 'Narrow Fabric'} • {method.pricing_type}
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manufacturing Type Selection - Machine vs Hand Finished */}
      {template.offers_hand_finished && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Make-Up Type
            <Badge variant="secondary" className="text-xs">Affects pricing</Badge>
          </Label>
          <RadioGroup
            value={measurements.manufacturing_type || template.manufacturing_type || 'machine'}
            onValueChange={handleManufacturingTypeChange}
            className="grid grid-cols-2 gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="machine" id="machine" />
              <Label 
                htmlFor="machine" 
                className="cursor-pointer flex flex-col flex-1"
              >
                <span className="font-medium">Machine Finished</span>
                {machinePricePerMetre && machinePricePerMetre > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(machinePricePerMetre)}/m
                  </span>
                )}
                {machinePricePerDrop && machinePricePerDrop > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(machinePricePerDrop)}/drop
                  </span>
                )}
                {machinePricePerPanel && machinePricePerPanel > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(machinePricePerPanel)}/panel
                  </span>
                )}
                {!machinePricePerMetre && !machinePricePerDrop && !machinePricePerPanel && (
                  <span className="text-xs text-destructive">No price set</span>
                )}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hand" id="hand" />
              <Label 
                htmlFor="hand" 
                className="cursor-pointer flex flex-col flex-1"
              >
                <span className="font-medium">Hand Finished</span>
                {handPricePerMetre && handPricePerMetre > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(handPricePerMetre)}/m
                  </span>
                )}
                {handPricePerDrop && handPricePerDrop > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(handPricePerDrop)}/drop
                  </span>
                )}
                {handPricePerPanel && handPricePerPanel > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(handPricePerPanel)}/panel
                  </span>
                )}
                {!handPricePerMetre && !handPricePerDrop && !handPricePerPanel && (
                  <span className="text-xs text-destructive">No price set</span>
                )}
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Dynamic Treatment Options from Database */}
      {treatmentOptions.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-border">
          {treatmentOptions.map(option => {
            console.log('🎯 RENDERING OPTION:', {
              key: option.key,
              label: option.label,
              hasValues: !!option.option_values,
              valueCount: option.option_values?.length,
              firstValue: option.option_values?.[0]
            });
            
            if (!option.visible || !option.option_values || option.option_values.length === 0) {
              return null;
            }

            return (
              <div key={option.id} className="space-y-3">
                <h5 className="font-medium text-foreground flex items-center gap-2">
                  {option.label}
                  {option.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </h5>
                
                <div className="ml-4 space-y-2">
                  {option.option_values.map(value => {
                    const price = getOptionPrice(value);
                    const isSelected = (treatmentOptionSelections[option.key] || measurements[`treatment_option_${option.key}`]) === value.id;
                    
                    return (
                      <div key={value.id}>
                        <div 
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => !readOnly && handleTreatmentOptionChange(option.key, value.id)}
                        >
                          <input
                            type="radio"
                            id={value.id}
                            name={option.key}
                            checked={isSelected}
                            onChange={() => handleTreatmentOptionChange(option.key, value.id)}
                            disabled={readOnly}
                            className="rounded-full border-gray-300"
                          />
                          
                          {value.extra_data?.image_url && (
                            <img 
                              src={value.extra_data.image_url} 
                              alt={value.label}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )}
                          
                          <Label htmlFor={value.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{value.label}</span>
                                {value.extra_data?.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{value.extra_data.description}</p>
                                )}
                              </div>
                              {price > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {formatCurrency(price)}
                                </Badge>
                              )}
                            </div>
                          </Label>
                        </div>

                        {/* CRITICAL: Render sub-options when this value is selected */}
                        {isSelected && value.extra_data?.sub_options && value.extra_data.sub_options.length > 0 && (
                          <div className="ml-8 mt-2 space-y-3 pl-4 border-l-2 border-muted">
                            {value.extra_data.sub_options.map((subOption: any) => (
                              <div key={subOption.id} className="space-y-2">
                                <h6 className="text-sm font-medium text-muted-foreground">
                                  {subOption.label}
                                </h6>
                                <div className="ml-4 space-y-2">
                                  {subOption.choices?.map((choice: any) => (
                                    <div 
                                      key={choice.id}
                                      className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                      onClick={() => {
                                        handleTreatmentOptionChange(`${option.key}_${subOption.key}`, choice.value);
                                        if (onOptionPriceChange) {
                                          const displayLabel = `${option.label} - ${subOption.label}: ${choice.label}`;
                                          onOptionPriceChange(`${option.key}_${subOption.key}`, choice.price || 0, displayLabel);
                                        }
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        id={choice.id}
                                        name={`${option.key}_${subOption.key}`}
                                        checked={treatmentOptionSelections[`${option.key}_${subOption.key}`] === choice.value}
                                        onChange={() => {
                                          handleTreatmentOptionChange(`${option.key}_${subOption.key}`, choice.value);
                                          if (onOptionPriceChange) {
                                            const displayLabel = `${option.label} - ${subOption.label}: ${choice.label}`;
                                            onOptionPriceChange(`${option.key}_${subOption.key}`, choice.price || 0, displayLabel);
                                          }
                                        }}
                                        disabled={readOnly}
                                        className="rounded-full border-gray-300"
                                      />
                                      
                                      <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm">{choice.label}</span>
                                          {choice.price > 0 && (
                                            <Badge variant="outline" className="text-xs">
                                              +{formatCurrency(choice.price)}
                                            </Badge>
                                          )}
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};