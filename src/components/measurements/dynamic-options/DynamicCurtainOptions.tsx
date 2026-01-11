import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeadingSelectorSkeleton, FabricSelectorSkeleton } from "@/components/shared/SkeletonLoader";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Loader2, AlertCircle } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useTreatmentOptions } from "@/hooks/useTreatmentOptions";
import { useConditionalOptions } from "@/hooks/useConditionalOptions";
import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { getManufacturingPrice, getMethodAvailability } from "@/utils/pricing/headingPriceLookup";
import { calculateAccessoriesFromOptionData, type HardwareAccessoryResult } from "@/hooks/pricing/useHardwareAccessoryPricing";
import type { EyeletRing } from "@/hooks/useEyeletRings";
import { validateTreatmentOptions } from "@/utils/treatmentOptionValidation";
import { ValidationAlert } from "@/components/shared/ValidationAlert";
import { useEnabledTemplateOptions } from "@/hooks/useEnabledTemplateOptions";

interface DynamicCurtainOptionsProps {
  measurements: Record<string, any>;
  onChange: (field: string, value: any) => void;
  template?: any; // The selected curtain template
  readOnly?: boolean;
  onOptionPriceChange?: (optionKey: string, price: number, label: string, pricingMethod?: string, pricingGridData?: any) => void;
  selectedOptions?: Array<{ name: string; price: number; pricingMethod?: string; pricingGridData?: any; optionKey?: string }>;
  onSelectedOptionsChange?: (options: Array<{ name: string; price: number; pricingMethod?: string; pricingGridData?: any; optionKey?: string }>) => void;
  selectedEyeletRing?: string;
  onEyeletRingChange?: (ringId: string) => void;
  selectedHeading?: string;
  onHeadingChange?: (headingId: string) => void;
  selectedLining?: string;
  onLiningChange?: (liningType: string) => void;
}

export const DynamicCurtainOptions = ({
  measurements,
  onChange,
  template,
  readOnly = false,
  onOptionPriceChange,
  selectedOptions = [],
  onSelectedOptionsChange,
  selectedEyeletRing,
  onEyeletRingChange,
  selectedHeading,
  onHeadingChange,
  selectedLining,
  onLiningChange
}: DynamicCurtainOptionsProps) => {
  const [availableRings, setAvailableRings] = useState<EyeletRing[]>([]);
  const [treatmentOptionSelections, setTreatmentOptionSelections] = useState<Record<string, string>>({});
  // Track which sub-category is selected for cascading dropdowns
  const [subCategorySelections, setSubCategorySelections] = useState<Record<string, string>>({});
  // Track if sub-category selections have been restored from saved data
  const [subCategoryRestored, setSubCategoryRestored] = useState(false);
  
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
  // ✅ CRITICAL FIX: Force refresh inventory when worksheet loads to get fresh heading data
  const { data: inventory = [], isLoading: headingsLoading, refetch: refetchInventory } = useEnhancedInventory({ forceRefresh: true });
  // Use template's treatment_category to fetch the correct options (e.g., 'roman_blinds', 'curtains')
  const treatmentCategory = template?.treatment_category || 'curtains';
  
  // ✅ CRITICAL FIX: Fetch options by TEMPLATE ID to use template_option_settings filtering
  // This ensures only options enabled for THIS template are shown, including hardware options
  const { data: treatmentOptions = [], isLoading: treatmentOptionsLoading } = useTreatmentOptions(template?.id, 'template');
  
  // ✅ [v2.3.5] DEBUG: Log inventory state with heading filter verification
  console.log('🎯 [v2.3.5] DynamicCurtainOptions - Heading Debug:', {
    inventoryTotal: inventory.length,
    isLoading: headingsLoading,
    allCategories: [...new Set(inventory.map(i => i.category))],
    headingItemsExact: inventory.filter(i => i.category === 'heading').map(h => ({ 
      id: h.id, 
      name: h.name, 
      category: h.category,
      fullness: h.fullness_ratio 
    })),
    templateSelectedHeadingIds: template?.selected_heading_ids,
    templateId: template?.id,
    templateName: template?.name
  });
  
  // Debug: Log TWC options in component
  console.log('🎯 DynamicCurtainOptions - TWC Debug:', {
    templateId: template?.id,
    templateName: template?.name,
    treatmentCategory,
    isLoading: treatmentOptionsLoading,
    optionsCount: treatmentOptions.length,
    options: treatmentOptions.map(o => ({
      key: o.key,
      label: o.label,
      valuesCount: o.option_values?.length || 0
    }))
  });
  
  // Get template option settings to filter hidden options
  const { isOptionEnabled, hasSettings, isLoading: settingsLoading, enabledOptionIds } = useEnabledTemplateOptions(template?.id);
  
  // ✅ NEW: Conditional options based on option_rules (e.g., show track_selection when hardware_type = track)
  // Build selected options map for the conditional hook
  const selectedOptionsForRules = useMemo(() => {
    const result: Record<string, string> = { ...treatmentOptionSelections };
    
    // ✅ CRITICAL FIX: Include selectedHeading for heading→hardware rules to evaluate
    if (selectedHeading) {
      result['selected_heading'] = selectedHeading;
    }
    
    // ✅ CRITICAL FIX: Include selectedLining for lining-based rules
    if (selectedLining) {
      result['selected_lining'] = selectedLining;
    }
    
    // Also include direct measurements that might be treatment options
    Object.keys(measurements).forEach(key => {
      if (key.startsWith('treatment_option_')) {
        result[key.replace('treatment_option_', '')] = measurements[key];
      }
    });
    return result;
  }, [treatmentOptionSelections, measurements, selectedHeading, selectedLining]);
  
  const { isOptionVisible, getDefaultValue, rules: conditionalRules } = useConditionalOptions(template?.id, selectedOptionsForRules);
  
  console.log('🔧 DynamicCurtainOptions - Conditional Rules Debug:', {
    templateId: template?.id,
    rulesCount: conditionalRules?.length || 0,
    selectedOptionsForRules,
  });
  
  // CRITICAL: Force refetch inventory when component mounts to ensure fresh data
  useEffect(() => {
    console.log('🔄 [v2.0.4] Force refetching inventory on mount');
    refetchInventory();
  }, [refetchInventory]);
  
  // Initialize treatmentOptionSelections from saved measurements
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    Object.keys(measurements).forEach(key => {
      // Look for both direct keys (e.g., 'hardware') and prefixed keys (e.g., 'treatment_option_hardware')
      if (key.startsWith('treatment_option_')) {
        const optionKey = key.replace('treatment_option_', '');
        initialSelections[optionKey] = measurements[key];
      } else if (!key.startsWith('selected_') && 
                 !['rail_width', 'drop', 'header_hem', 'bottom_hem', 'side_hems', 'seam_hems', 
                   'return_left', 'return_right', 'waste_percent', 'pooling_amount', 
                   'manufacturing_type', 'heading_fullness', 'curtain_type', 'curtain_side',
                   'pooling_option', 'fabric_rotated', 'surface_id', 'surface_name', 
                   'window_type', 'unit', 'fabric_width_cm', 'wall_width_cm', 'wall_height_cm',
                   'fullness_ratio', 'horizontal_pieces_needed', 'fabric_orientation'].includes(key)) {
        // This might be a treatment option stored without prefix
        initialSelections[key] = measurements[key];
      }
    });
    
    if (Object.keys(initialSelections).length > 0) {
      console.log('🎨 Restoring treatment option selections:', initialSelections);
      setTreatmentOptionSelections(initialSelections);
    }
  }, [template?.id, measurements]); // Re-initialize when template or measurements change
  
  // ✅ CRITICAL FIX: Apply heading→hardware defaults from option_rules
  // When heading changes, check if rules specify a hardware_type default and apply it
  useEffect(() => {
    const hardwareDefault = getDefaultValue('hardware_type');
    
    // Only apply if:
    // 1. We have a heading selected
    // 2. Rules computed a hardware default
    // 3. No hardware is currently selected OR current hardware differs from default
    const currentHardware = treatmentOptionSelections['hardware_type'];
    
    if (selectedHeading && hardwareDefault && !currentHardware) {
      console.log('🎯 Auto-applying hardware default from heading rule:', {
        selectedHeading,
        hardwareDefault,
        currentHardware
      });
      
      // Apply the default hardware selection
      handleTreatmentOptionChange('hardware_type', hardwareDefault);
    }
  }, [selectedHeading, getDefaultValue, treatmentOptionSelections]);
  
  // ❌ REMOVED: Auto-select first option logic
  // WHITELIST approach: User must explicitly select options
  // No auto-selection prevents "random" values appearing

  // Restore sub-category selections from saved measurements when editing
  useEffect(() => {
    if (treatmentOptions.length === 0 || subCategoryRestored) return;
    
    const restoredSubCategories: Record<string, string> = {};
    let hasRestorations = false;
    
    treatmentOptions.forEach(option => {
      if (!option.visible || !option.option_values) return;
      
      // Check if there's a saved main selection for this option
      const selectedValueId = treatmentOptionSelections[option.key] || measurements[`treatment_option_${option.key}`];
      if (!selectedValueId) return;
      
      const selectedValue = option.option_values.find((v: any) => v.id === selectedValueId);
      const subOptions = selectedValue?.extra_data?.sub_options;
      
      if (!subOptions || subOptions.length === 0) return;
      
      // Check each sub-option to see if there's saved data for it
      for (const subOption of subOptions) {
        const subKey = `${option.key}_${subOption.key}`;
        const savedSubValue = treatmentOptionSelections[subKey] || measurements[`treatment_option_${subKey}`] || measurements[subKey];
        
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
  }, [treatmentOptions.length, measurements, treatmentOptionSelections, subCategoryRestored]);
  
  // Filter for heading items from inventory - EXACT match on 'heading' category
  const headingOptions = useMemo(() => {
    // ✅ CRITICAL FIX: Use exact match 'heading' instead of includes()
    // Database stores category as 'heading' exactly
    const filtered = inventory.filter(item => item.category === 'heading');
    
    console.log('🔴 [v2.0.5] headingOptions filter - EXACT MATCH:', {
      inventoryTotal: inventory.length,
      headingsFound: filtered.length,
      allCategories: [...new Set(inventory.map(i => i.category))],
      headingItems: filtered.map(h => ({ id: h.id, name: h.name, category: h.category, fullness: h.fullness_ratio }))
    });
    
    return filtered;
  }, [inventory]);
  
  // ❌ REMOVED: Auto-select first heading logic
  // WHITELIST approach: User must explicitly select heading
  // No auto-selection prevents "random" values appearing
  
  // ❌ REMOVED: Auto-select first lining logic  
  // WHITELIST approach: User must explicitly select lining
  // No auto-selection prevents "random" values appearing

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: units.currency || 'USD'
    }).format(amount);
  };

  const handleHeadingChange = (headingId: string) => {
    console.log('🔥🔥🔥 DROPDOWN FIRED: handleHeadingChange', { 
      headingId,
      currentValue: measurements.selected_heading,
      totalHeadingOptions: headingOptions.length
    });
    
    const heading = headingOptions.find(h => h.id === headingId);
    console.log('🔥🔥🔥 Found heading:', heading);
    
    // ✅ CRITICAL FIX: Clear ALL hardware selections when heading changes
    // This allows the new heading→hardware default rule to apply
    console.log('🔧 Clearing hardware selections for new heading');
    setTreatmentOptionSelections(prev => {
      const updated = { ...prev };
      delete updated['hardware_type'];
      delete updated['track_selection'];
      delete updated['rod_selection'];
      // Also delete any accessories
      Object.keys(updated).forEach(k => {
        if (k.startsWith('track_selection_') || k.startsWith('rod_selection_')) {
          delete updated[k];
        }
      });
      return updated;
    });
    
    // Clear from measurements too
    onChange('treatment_option_hardware_type', undefined);
    onChange('treatment_option_track_selection', undefined);
    onChange('treatment_option_rod_selection', undefined);
    
    // Clear from parent's selectedOptions
    if (onSelectedOptionsChange) {
      const updatedOptions = selectedOptions.filter(opt => {
        const optKey = (opt as any).optionKey || '';
        return !optKey.startsWith('hardware_type') && 
               !optKey.startsWith('track_selection') && 
               !optKey.startsWith('rod_selection');
      });
      onSelectedOptionsChange(updatedOptions);
    }
    
    if (heading && onOptionPriceChange) {
      // Headings are stored in enhanced_inventory_items - use correct pricing fields
      const headingPrice = heading.price_per_meter || heading.selling_price || 0;
      // Default to 'per-meter' for headings from settings
      const metadata = heading.metadata as any;
      const pricingMethod = metadata?.pricing_method || 'per-meter';
      onOptionPriceChange('heading', headingPrice, heading.name, pricingMethod);
    }
    
    // CRITICAL: Update measurements object first
    onChange('selected_heading', headingId);
    
    // CRITICAL: Then update parent state so it gets saved
    if (onHeadingChange) {
      console.log('🔥 Calling onHeadingChange with:', headingId);
      onHeadingChange(headingId);
    }
    
    // ✅ CRITICAL FIX: ALWAYS set heading fullness from the heading's database value
    // Priority: heading.fullness_ratio > metadata.fullness_ratio > ERROR (no fallback!)
    if (heading) {
      // Check for direct fullness_ratio field FIRST (this is the database column)
      const headingFullness = (heading as any).fullness_ratio;
      const metadata = heading.metadata as any;
      
      let fullnessToUse: number | null = null;
      let fullnessSource = '';
      
      // Priority 1: Direct database column fullness_ratio
      if (typeof headingFullness === 'number' && headingFullness > 0) {
        fullnessToUse = headingFullness;
        fullnessSource = 'heading.fullness_ratio (database column)';
      }
      // Priority 2: Metadata with multiple ratios
      else if (metadata?.use_multiple_ratios && metadata?.multiple_fullness_ratios?.length > 0) {
        fullnessToUse = metadata.multiple_fullness_ratios[0];
        fullnessSource = 'metadata.multiple_fullness_ratios[0]';
      }
      // Priority 3: Metadata single fullness_ratio
      else if (typeof metadata?.fullness_ratio === 'number' && metadata.fullness_ratio > 0) {
        fullnessToUse = metadata.fullness_ratio;
        fullnessSource = 'metadata.fullness_ratio';
      }
      
      if (fullnessToUse !== null) {
        console.log('✅ Setting heading_fullness:', fullnessToUse, 'from:', fullnessSource, 'heading:', heading.name);
        onChange('heading_fullness', fullnessToUse);
        // Also set fullness_ratio for consistency
        onChange('fullness_ratio', fullnessToUse);
      } else {
        // ❌ NO FALLBACK - log error so user knows to fix the heading
        console.error('❌ HEADING HAS NO FULLNESS_RATIO:', heading.name, 'ID:', heading.id);
        console.error('❌ This heading needs fullness_ratio configured in Settings > Inventory');
      }
      
      // Check for eyelet rings
      console.log('🔍 DynamicCurtainOptions - Selected heading:', {
        id: heading.id,
        name: heading.name,
        fullness_ratio: headingFullness,
        heading_type: metadata?.heading_type,
        has_eyelet_rings: !!metadata?.eyelet_rings
      });
      
      if (metadata?.heading_type === 'eyelet' && metadata?.eyelet_rings) {
        setAvailableRings(metadata.eyelet_rings);
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
    console.log('🔥 DROPDOWN FIRED: handleLiningChange', { liningType });
    
    const lining = template?.lining_types?.find((l: any) => l.type === liningType);
    console.log('🔥 Found lining:', lining);
    
    // ❌ REMOVED: Lining should NOT be added to selectedOptions
    // Lining has dedicated calculation in parent component that uses fabric usage
    // DO NOT call onOptionPriceChange for lining
    
    // CRITICAL: Update both measurements object AND parent state
    onChange('selected_lining', liningType);
    if (onLiningChange) {
      onLiningChange(liningType);
    }
    
    console.log('🧵 Lining changed:', {
      type: liningType,
      found: !!lining,
      pricePerMetre: lining?.price_per_metre || 0,
      labourPerCurtain: lining?.labour_per_curtain || 0,
      pricingMethod: lining?.pricing_method || 'per-meter',
      note: 'Lining calculated separately with fabric usage - NOT in selectedOptions'
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
    
    // ✅ CRITICAL FIX: Mutual exclusivity for hardware_type
    // When hardware_type changes, clear the OPPOSITE selection to prevent both showing in quotes
    if (optionKey === 'hardware_type') {
      const option = treatmentOptions.find(opt => opt.key === 'hardware_type');
      const selectedValue = option?.option_values?.find(v => v.id === valueId);
      const selectedLabel = selectedValue?.label?.toLowerCase() || '';
      
      console.log('🔧 Hardware type changed to:', selectedLabel, '- clearing opposite selection');
      
      if (selectedLabel.includes('track')) {
        // User selected Track - clear Rod selection
        setTreatmentOptionSelections(prev => {
          const updated = { ...prev };
          delete updated['rod_selection'];
          return updated;
        });
        onChange('treatment_option_rod_selection', undefined);
        // Remove rod from selectedOptions
        if (onSelectedOptionsChange) {
          const updatedOptions = selectedOptions.filter(opt => 
            !(opt as any).optionKey?.startsWith('rod_selection') && 
            !opt.name?.toLowerCase().includes('rod')
          );
          onSelectedOptionsChange(updatedOptions);
        }
      } else if (selectedLabel.includes('rod')) {
        // User selected Rod - clear Track selection
        setTreatmentOptionSelections(prev => {
          const updated = { ...prev };
          delete updated['track_selection'];
          return updated;
        });
        onChange('treatment_option_track_selection', undefined);
        // Remove track from selectedOptions
        if (onSelectedOptionsChange) {
          const updatedOptions = selectedOptions.filter(opt => 
            !(opt as any).optionKey?.startsWith('track_selection') && 
            !opt.name?.toLowerCase().includes('track')
          );
          onSelectedOptionsChange(updatedOptions);
        }
      }
    }
    
    // Find the selected option value and its price
    const option = treatmentOptions.find(opt => opt.key === optionKey);
    if (option && option.option_values) {
      const selectedValue = option.option_values.find(val => val.id === valueId);
      if (selectedValue) {
        let price = getOptionPrice(selectedValue);
        let accessoryBreakdown: string[] = [];
        let accessoryResult: HardwareAccessoryResult | null = null;
        
        // ✅ NEW: Calculate hardware accessories for track/rod selections
        const isHardwareSelection = optionKey === 'track_selection' || optionKey === 'rod_selection';
        const accessoryPrices = selectedValue.extra_data?.accessory_prices;
        const mountTypeSelection = treatmentOptionSelections['mount_type'] || measurements['treatment_option_mount_type'];
        
        if (isHardwareSelection && accessoryPrices && Object.keys(accessoryPrices).length > 0) {
          // Get rail width from measurements (stored in MM, convert to CM)
          const railWidthMm = measurements.rail_width || measurements.wall_width || 0;
          const railWidthCm = railWidthMm / 10;
          const fullness = measurements.fullness_ratio || measurements.heading_fullness || 1;
          
          // Determine mount type from selection
          let mountType: 'ceiling' | 'wall' | 'both' = 'wall';
          if (mountTypeSelection) {
            const mountOption = treatmentOptions.find(o => o.key === 'mount_type');
            const mountValue = mountOption?.option_values?.find(v => v.id === mountTypeSelection);
            const mountLabel = mountValue?.label?.toLowerCase() || '';
            if (mountLabel.includes('ceiling') && mountLabel.includes('wall')) {
              mountType = 'both';
            } else if (mountLabel.includes('ceiling')) {
              mountType = 'ceiling';
            }
          }
          
          if (railWidthCm > 0) {
            accessoryResult = calculateAccessoriesFromOptionData(
              accessoryPrices,
              price,
              railWidthCm,
              fullness,
              mountType
            );
            
            // Use grand total (base + accessories) as the price
            price = accessoryResult.grandTotalPrice;
            accessoryBreakdown = accessoryResult.breakdown;
            
            console.log('🔧 Hardware accessory calculation:', {
              hardware: selectedValue.label,
              basePrice: accessoryResult.hardwareBasePrice,
              accessoriesTotal: accessoryResult.accessoriesTotalPrice,
              grandTotal: accessoryResult.grandTotalPrice,
              breakdown: accessoryBreakdown,
              railWidthCm,
              fullness,
              mountType
            });
          }
        }
        
        // Update parent's price tracking
        if (onOptionPriceChange) {
          const pricingMethod = selectedValue.extra_data?.pricing_method || 'per-meter';
          onOptionPriceChange(optionKey, price, selectedValue.label, pricingMethod);
        }
        
        // ✅ CLEAN FIX: Update selectedOptions using optionKey as unique identifier
        if (onSelectedOptionsChange) {
          // Remove ALL options that start with this option's key or label prefix
          // This ensures both main option and any sub-options are cleared
          // Also remove any existing accessory items for this hardware
          const updatedOptions = selectedOptions.filter(opt => {
            const optKey = (opt as any).optionKey;
            if (optKey) {
              return !optKey.startsWith(optionKey) && !optKey.startsWith(`${optionKey}_accessory`);
            }
            return !opt.name.startsWith(`${option.label}:`);
          });
          
          // ✅ FIX: Add ALL selected options regardless of price
          const pricingMethod = selectedValue.extra_data?.pricing_method || 'per-meter';
          const pricingGridData = selectedValue.extra_data?.pricing_grid_data;
          
          // ✅ ENHANCED: For hardware with accessories, add ITEMIZED breakdown
          if (isHardwareSelection && accessoryResult && accessoryResult.accessories.length > 0) {
            // 1. Add base hardware item (without accessories total)
            updatedOptions.push({ 
              name: `${option.label}: ${selectedValue.label}`, 
              price: accessoryResult.hardwareBasePrice, 
              pricingMethod: 'fixed',
              pricingGridData,
              optionKey: optionKey,
              category: 'hardware',
              description: 'Base price'
            } as any);
            
            // 2. Add each accessory as a separate line item
            accessoryResult.accessories.forEach((acc, accIdx) => {
              updatedOptions.push({
                name: acc.name,
                price: acc.totalPrice,
                pricingMethod: 'fixed',
                optionKey: `${optionKey}_accessory_${accIdx}`,
                category: 'hardware_accessory',
                parentOptionKey: optionKey,
                quantity: acc.quantity,
                unit_price: acc.unitPrice,
                pricingDetails: acc.formulaDescription // e.g., "1 per 10cm"
              } as any);
            });
            
            console.log('🔧 Hardware breakdown itemized:', {
              base: { name: selectedValue.label, price: accessoryResult.hardwareBasePrice },
              accessories: accessoryResult.accessories,
              totalItems: 1 + accessoryResult.accessories.length
            });
          } else {
            // Non-hardware option or hardware without accessories
            updatedOptions.push({ 
              name: `${option.label}: ${selectedValue.label}`, 
              price, 
              pricingMethod: isHardwareSelection ? 'fixed' : pricingMethod,
              pricingGridData,
              optionKey: optionKey,
              accessoryBreakdown // Store breakdown for display in quotes (legacy)
            } as any);
          }
          
          onSelectedOptionsChange(updatedOptions);
          console.log('🎨 Updated selectedOptions:', updatedOptions.map(o => o.name));
        }
      }
    }
    
    // Clear any sub-category selections for this option when main option changes
    setSubCategorySelections(prev => {
      const updated = { ...prev };
      delete updated[optionKey];
      return updated;
    });
    
    // Store in measurements
    onChange(`treatment_option_${optionKey}`, valueId);
  };

  // Validate treatment options - only validate options that are enabled on template
  const validation = useMemo(() => {
    if (treatmentOptionsLoading || settingsLoading) return { isValid: true, errors: [], warnings: [] };
    // ✅ FIX: Pass enabledOptionIds to validation so it only validates enabled options
    return validateTreatmentOptions(treatmentOptions, treatmentOptionSelections, enabledOptionIds);
  }, [treatmentOptions, treatmentOptionSelections, treatmentOptionsLoading, settingsLoading, enabledOptionIds]);

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

  // Determine which prices to use - prefer heading overrides, then pricing method, then template defaults
  // ✅ FIX: Check heading-specific price overrides first for per-metre pricing
  const machinePricePerMetre = getManufacturingPrice(
    false, // machine
    measurements.selected_heading,
    template.heading_prices,
    { machine_price_per_metre: selectedPricingMethod?.machine_price_per_metre, hand_price_per_metre: selectedPricingMethod?.hand_price_per_metre },
    { machine_price_per_metre: template.machine_price_per_metre, hand_price_per_metre: template.hand_price_per_metre }
  );
  const handPricePerMetre = getManufacturingPrice(
    true, // hand
    measurements.selected_heading,
    template.heading_prices,
    { machine_price_per_metre: selectedPricingMethod?.machine_price_per_metre, hand_price_per_metre: selectedPricingMethod?.hand_price_per_metre },
    { machine_price_per_metre: template.machine_price_per_metre, hand_price_per_metre: template.hand_price_per_metre }
  );
  const machinePricePerDrop = selectedPricingMethod?.machine_price_per_drop ?? template.machine_price_per_drop;
  const handPricePerDrop = selectedPricingMethod?.hand_price_per_drop ?? template.hand_price_per_drop;
  const machinePricePerPanel = selectedPricingMethod?.machine_price_per_panel ?? template.machine_price_per_panel;
  const handPricePerPanel = selectedPricingMethod?.hand_price_per_panel ?? template.hand_price_per_panel;

  // Check method availability based on heading
  const methodAvailability = getMethodAvailability(
    measurements.selected_heading,
    template.heading_prices,
    template.offers_hand_finished
  );

  // Filter headings based on template's selected_heading_ids
  // If template doesn't specify selected_heading_ids, show all available headings
  const availableHeadings = template.selected_heading_ids && template.selected_heading_ids.length > 0
    ? headingOptions.filter(h => template.selected_heading_ids.includes(h.id))
    : headingOptions; // ✅ FIXED: Show all headings if template doesn't filter them

  // ✅ FIX: Detect TWC templates to suppress confusing validation alerts
  const isTWCTemplate = template?.metadata?.twc_product_id || 
    template?.description?.includes('TWC Template') ||
    template?.system_type?.toLowerCase?.()?.includes('twc');

  return (
    <div className="space-y-3 px-3">
      {/* Validation Alert - SUPPRESS for TWC templates as they have their own option structure */}
      {!isTWCTemplate && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <ValidationAlert 
          errors={validation.errors}
          warnings={validation.warnings}
          templateId={template?.id}
        />
      )}

      {/* Heading Configuration State Detection and Validation */}
      {(() => {
        // ✅ FIX: Suppress heading notices for TWC-imported templates
        // TWC templates use their own heading options, not the standard heading workflow
        const isTWCTemplate = template.metadata?.twc_product_id || 
          template.description?.includes('TWC Template') ||
          template.system_type?.toLowerCase().includes('twc');
        
        // Skip heading notices entirely for TWC templates
        if (isTWCTemplate) {
          console.log('🎯 Suppressing heading notice for TWC template:', template.name);
          return null;
        }
        
        const hasTemplateHeadings = (template.selected_heading_ids || []).length > 0;
        const hasInventoryHeadings = headingOptions.length > 0;
        const hasAnyAvailableHeadings = availableHeadings.length > 0;
        
        // Determine configuration state
        const headingConfigState = (() => {
          if (!hasTemplateHeadings && !hasInventoryHeadings) return 'none';
          if (hasTemplateHeadings && !hasInventoryHeadings) return 'template_only';
          if (!hasTemplateHeadings && hasInventoryHeadings) return 'inventory_only';
          if (hasTemplateHeadings && hasInventoryHeadings && !hasAnyAvailableHeadings) return 'mismatch';
          return 'ok';
        })();
        
        console.log('🎯 DynamicCurtainOptions - Heading Section Debug:', {
          treatmentCategory,
          isCurtains: treatmentCategory === 'curtains',
          totalInventoryItems: inventory.length,
          headingOptionsCount: headingOptions.length,
          availableHeadingsCount: availableHeadings.length,
          templateSelectedHeadingIds: template.selected_heading_ids,
          headingConfigState,
          headingOptions: headingOptions.map(h => ({ id: h.id, name: h.name, category: h.category })),
          availableHeadings: availableHeadings.map(h => ({ id: h.id, name: h.name }))
        });
        
        // Only show alerts for curtains treatment type
        if (treatmentCategory !== 'curtains') return null;
        
        if (headingConfigState === 'template_only') {
          return (
            <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                This template has heading styles selected ({template.selected_heading_ids?.length} configured), 
                but no heading items exist in your inventory. Please add heading items in Settings → Products → Headings.
              </AlertDescription>
            </Alert>
          );
        }
        
        if (headingConfigState === 'inventory_only') {
          return (
            <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                You have {headingOptions.length} heading item(s) in inventory, but none are linked to this template. 
                Open Settings → Products → Templates → Headings tab and select which headings to offer.
              </AlertDescription>
            </Alert>
          );
        }
        
        if (headingConfigState === 'mismatch') {
          return (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive text-sm">
                Template references {template.selected_heading_ids?.length} heading(s) that don't match inventory items. 
                This may happen if heading items were deleted. Please reconfigure the Headings tab in template settings.
              </AlertDescription>
            </Alert>
          );
        }
        
        return null;
      })()}
      
      {treatmentCategory === 'curtains' && availableHeadings.length > 0 && (
        <div className="space-y-3">
          <h4 className={`font-medium ${!measurements.selected_heading && availableHeadings.length > 1 ? 'text-destructive' : 'text-foreground'}`}>Heading Type</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Select Type</span>
            <div className="w-64">
              <Select
                value={selectedHeading || measurements.selected_heading || ''}
                onValueChange={handleHeadingChange}
                disabled={readOnly}
              >
                <SelectTrigger className={`bg-background border-input ${!(selectedHeading || measurements.selected_heading) && availableHeadings.length > 0 ? 'border-destructive ring-1 ring-destructive/30' : ''}`}>
                  <SelectValue placeholder={!(selectedHeading || measurements.selected_heading) && availableHeadings.length > 0 ? "⚠️ Select heading..." : "Select heading..."} />
                </SelectTrigger>
                <SelectContent 
                  className="z-[9999] bg-popover border-border shadow-lg max-h-[300px]"
                  position="popper"
                  sideOffset={5}
                  align="end"
                >
                  {availableHeadings.map(heading => {
                    const metadata = heading.metadata as any;
                    const fullness = (heading as any).fullness_ratio || metadata?.fullness_ratio;
                    return (
                      <SelectItem key={heading.id} value={heading.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{heading.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {fullness ? `${fullness}x` : formatCurrency(heading.price_per_meter || heading.selling_price || 0)}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
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
                      onValueChange={(value) => {
                        const newFullness = parseFloat(value);
                        console.log('🔄 FULLNESS DROPDOWN CHANGED:', {
                          oldValue: measurements.heading_fullness,
                          newValue: newFullness,
                          displayedValue: value
                        });
                        onChange('heading_fullness', newFullness);
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Select fullness..." />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] bg-popover border-border shadow-lg" position="popper" sideOffset={5} align="end">
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
                    <SelectContent className="z-[9999] bg-popover border-border shadow-lg" position="popper" sideOffset={5} align="end">
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

        {template.lining_types && template.lining_types.length > 0 && 
          !treatmentOptions.some(opt => opt.key === 'lining_type' && opt.visible) && (
          <div className="space-y-3">
          <h4 className={`font-medium ${!measurements.selected_lining && template.lining_types.length > 1 ? 'text-destructive' : 'text-foreground'}`}>Lining Type</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Select Lining</span>
            <div className="w-64">
              <Select
                value={measurements.selected_lining || ''}
                onValueChange={handleLiningChange}
              >
                <SelectTrigger className={`bg-background border-input ${!measurements.selected_lining && template.lining_types.length > 1 ? 'border-destructive ring-1 ring-destructive/30' : ''}`}>
                  <SelectValue placeholder={!measurements.selected_lining && template.lining_types.length > 1 ? "⚠️ Select..." : "Select..."} />
                </SelectTrigger>
                <SelectContent 
                  className="z-[9999] bg-popover border-border shadow-lg"
                  position="popper"
                  sideOffset={5}
                  align="end"
                >
                  <SelectItem value="none">No Lining</SelectItem>
                  {template.lining_types.map((lining: any, index: number) => (
                    <SelectItem key={index} value={lining.type}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{lining.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(lining.price_per_metre || 0)}/m
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

      {/* Fabric Width Type Selection */}
      {template.pricing_methods && template.pricing_methods.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium text-foreground">Fabric Width Type</h4>
              <p className="text-xs text-muted-foreground">Select the fabric width category for pricing</p>
            </div>
            <div className="w-64">
              <Select
                value={measurements.selected_pricing_method || ''}
                onValueChange={handlePricingMethodChange}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Select width type..." />
                </SelectTrigger>
                <SelectContent 
                  className="z-[9999] bg-popover border-border shadow-lg"
                  position="popper"
                  sideOffset={5}
                  align="end"
                >
                  {template.pricing_methods.map((method: any) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{method.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {method.fabric_width_type === 'wide' ? 'Wide' : 'Standard'}
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

      {/* Manufacturing Finish Type */}
      {template.offers_hand_finished && (
        (() => {
          const { machineAvailable, handAvailable } = methodAvailability;
          
          // Determine current selection and if it's valid
          const currentManufacturingType = measurements.manufacturing_type || template.manufacturing_type || 'machine';
          const isCurrentSelectionValid = 
            (currentManufacturingType === 'machine' && machineAvailable) ||
            (currentManufacturingType === 'hand' && handAvailable);
          
          // Auto-switch to valid option if current selection becomes invalid
          if (!isCurrentSelectionValid) {
            const newValue = machineAvailable ? 'machine' : (handAvailable ? 'hand' : 'machine');
            if (newValue !== currentManufacturingType) {
              // Use setTimeout to avoid setState during render
              setTimeout(() => handleManufacturingTypeChange(newValue as 'machine' | 'hand'), 0);
            }
          }
          
          // If only one option available, show simpler UI
          if (!machineAvailable || !handAvailable) {
            const availableMethod = machineAvailable ? 'Machine Finished' : 'Hand Finished';
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground">Manufacturing Finish</h4>
                    <p className="text-xs text-muted-foreground">
                      Only {availableMethod.toLowerCase()} is available for this heading
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {availableMethod}
                  </Badge>
                </div>
              </div>
            );
          }
          
          // Both options available - show dropdown
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">Manufacturing Finish</h4>
                  <p className="text-xs text-muted-foreground">Choose between machine or hand-finished</p>
                </div>
                <div className="w-64">
                  <Select
                    value={currentManufacturingType}
                    onValueChange={handleManufacturingTypeChange}
                  >
                    <SelectTrigger className="bg-background border-input">
                      <SelectValue placeholder="Select finish..." />
                    </SelectTrigger>
                    <SelectContent 
                      className="z-[9999] bg-popover border-border shadow-lg"
                      position="popper"
                      sideOffset={5}
                      align="end"
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
          );
        })()
      )}

      {/* Dynamic Treatment Options from Database - Filtered by template settings AND conditional rules */}
      {(() => {
        // Debug: Log options filtering with conditional visibility
        console.log('🔍 DynamicCurtainOptions - Options Filtering Debug:', {
          totalOptions: treatmentOptions.length,
          hasSettings,
          settingsLoading,
          conditionalRulesCount: conditionalRules?.length || 0,
          options: treatmentOptions.map(opt => ({
            id: opt.id,
            key: opt.key,
            label: opt.label,
            visible: opt.visible,
            valuesCount: opt.option_values?.length || 0,
            isConditionallyVisible: isOptionVisible(opt.key)
          }))
        });
        return null;
      })()}
      {treatmentOptions.length > 0 && treatmentOptions.map(option => {
        // Filter: check visibility AND has option values
        // NOTE: Since we now fetch by template ID, only enabled options are returned
        if (!option.visible || !option.option_values || option.option_values.length === 0) {
          console.log(`⏭️ Skipping option ${option.key}: visible=${option.visible}, values=${option.option_values?.length || 0}`);
          return null;
        }
        
        // ✅ CRITICAL: Skip heading_type options from TWC - these are already handled by the inventory-based heading selector above
        // This prevents duplicate "Heading Type" dropdowns from appearing
        if (option.key.toLowerCase().includes('heading_type') || option.key.toLowerCase().includes('heading-type')) {
          console.log(`⏭️ Skipping option ${option.key}: heading_type handled by inventory-based selector`);
          return null;
        }
        
        // ✅ NEW: Check conditional visibility from option_rules
        // This hides track_selection until hardware_type = 'track', etc.
        if (!isOptionVisible(option.key)) {
          console.log(`⏭️ Skipping option ${option.key}: hidden by conditional rule`);
          return null;
        }
        
        // ✅ Options are now pre-filtered by template query - no need for isOptionEnabled check
        console.log(`✅ Rendering option: ${option.key} (${option.label}) with ${option.option_values?.length || 0} values`);



        const selectedValueId = treatmentOptionSelections[option.key] || measurements[`treatment_option_${option.key}`];
        const selectedValue = option.option_values.find(v => v.id === selectedValueId);
        const subOptions = selectedValue?.extra_data?.sub_options;
        
        // Auto-select if only one option value exists
        const hasOnlyOneOption = option.option_values.length === 1;
        const shouldAutoSelect = hasOnlyOneOption && !selectedValueId;
        
        // Trigger auto-selection for single options
        if (shouldAutoSelect) {
          const singleOption = option.option_values[0];
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            console.log(`✅ Auto-selecting single option for ${option.label}:`, singleOption.label);
            handleTreatmentOptionChange(option.key, singleOption.id);
          }, 0);
        }
        
        // Show red indicator if multiple options but none selected
        const showRequiredIndicator = !selectedValueId && option.option_values.length > 1;
        
        // Format pricing label with method
        const formatPriceWithMethod = (value: any) => {
          const price = getOptionPrice(value);
          const method = getOptionPricingMethod(value);
          let methodLabel = '';
          switch (method) {
            case 'per-meter':
            case 'per-metre':
            case 'per-linear-meter':
              methodLabel = '/m';
              break;
            case 'per-sqm':
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
            default:
              methodLabel = '';
          }
          return price > 0 ? `${formatCurrency(price)}${methodLabel}` : null;
        };

        return (
          <div key={option.id} className="space-y-3">
            <h4 className={`font-medium ${showRequiredIndicator ? 'text-destructive' : 'text-foreground'}`}>{option.label}</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Select {option.label}</span>
              <div className="w-64">
                <Select
                  value={selectedValueId || ''}
                  onValueChange={(value) => {
                    console.log(`🔥 Treatment option change: ${option.key} = ${value}`);
                    handleTreatmentOptionChange(option.key, value);
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger className={`bg-background border-input ${showRequiredIndicator ? 'border-destructive ring-1 ring-destructive/30' : ''}`}>
                    <SelectValue placeholder={showRequiredIndicator ? "⚠️ Select..." : "Select..."} />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-popover border-border z-50"
                    position="popper"
                    sideOffset={5}
                  >
                    {option.option_values.map(value => {
                      const priceLabel = formatPriceWithMethod(value);
                      return (
                        <SelectItem key={value.id} value={value.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{value.label}</span>
                            {priceLabel && (
                              <Badge variant="outline" className="text-xs">
                                {priceLabel}
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

            {/* Sub-options - Cascading: First select category, then select item */}
            {selectedValueId && subOptions && subOptions.length > 0 && (() => {
              // Auto-select sub-category if only one exists
              const currentSubCategory = subCategorySelections[option.key];
              const visibleSubOptions = subOptions.filter((subOption: any) => {
                if (subOption.condition) {
                  const conditionKey = Object.keys(subOption.condition)[0];
                  const requiredValue = subOption.condition[conditionKey];
                  const actualValue = treatmentOptionSelections[`${option.key}_${conditionKey}`];
                  if (actualValue !== requiredValue) {
                    return false;
                  }
                }
                return true;
              });
              
              // Auto-select if only one sub-option category
              if (visibleSubOptions.length === 1 && !currentSubCategory) {
                setTimeout(() => {
                  console.log(`✅ Auto-selecting single sub-category for ${option.label}:`, visibleSubOptions[0].label);
                  setSubCategorySelections(prev => ({ ...prev, [option.key]: visibleSubOptions[0].key }));
                }, 0);
              }
              
              const showSubCategoryIndicator = !currentSubCategory && visibleSubOptions.length > 1;
              
              return (
              <div className="ml-4 space-y-3">
                {/* Step 1: Category selector - choose between sub-option types (e.g., Tracks OR Rods) */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${showSubCategoryIndicator ? 'text-destructive' : 'text-muted-foreground'}`}>Select Type</span>
                  <div className="w-64">
                    <Select
                      value={currentSubCategory || ''}
                      onValueChange={(categoryKey) => {
                        console.log(`🔥 Sub-category change: ${option.key} type = ${categoryKey}`);
                        
                        // ✅ CLEAN FIX: Remove ALL old sub-option entries when changing category
                        if (onSelectedOptionsChange) {
                          const cleanedOptions = selectedOptions.filter(opt => {
                            // Remove any option that starts with this option's label followed by " - "
                            // This catches "Hardware - Rods:" and "Hardware - tracks:" etc.
                            return !opt.name.startsWith(`${option.label} - `);
                          });
                          onSelectedOptionsChange(cleanedOptions);
                          console.log('🧹 Cleaned sub-options for category change:', cleanedOptions.map(o => o.name));
                        }
                        
                        // Clear previous item selection when category changes
                        const prevCategory = subCategorySelections[option.key];
                        if (prevCategory && prevCategory !== categoryKey) {
                          // Clear the measurement for old category
                          onChange(`treatment_option_${option.key}_${prevCategory}`, '');
                          // Clear from local state
                          setTreatmentOptionSelections(prev => {
                            const updated = { ...prev };
                            delete updated[`${option.key}_${prevCategory}`];
                            return updated;
                          });
                        }
                        
                        setSubCategorySelections(prev => ({ ...prev, [option.key]: categoryKey }));
                      }}
                      disabled={readOnly}
                    >
                      <SelectTrigger className={`bg-background border-input ${showSubCategoryIndicator ? 'border-destructive ring-1 ring-destructive/30' : ''}`}>
                        <SelectValue placeholder={showSubCategoryIndicator ? "⚠️ Select type..." : "Select type..."} />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] bg-popover border-border shadow-lg" position="popper" sideOffset={5} align="end">
                        {visibleSubOptions.map((subOption: any) => (
                          <SelectItem key={subOption.id} value={subOption.key}>
                            {subOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Step 2: Item selector - shows ONLY when category is selected */}
                {currentSubCategory && (() => {
                  const selectedSubOption = subOptions.find((so: any) => so.key === currentSubCategory);
                  if (!selectedSubOption || !selectedSubOption.choices) return null;
                  
                  const currentItemSelection = treatmentOptionSelections[`${option.key}_${selectedSubOption.key}`];
                  const subOptionKey = `${option.key}_${selectedSubOption.key}`;
                  
                  // Auto-select if only one choice
                  if (selectedSubOption.choices.length === 1 && !currentItemSelection) {
                    const singleChoice = selectedSubOption.choices[0];
                    setTimeout(() => {
                      console.log(`✅ Auto-selecting single choice for ${selectedSubOption.label}:`, singleChoice.label);
                      handleTreatmentOptionChange(subOptionKey, singleChoice.value);
                      
                      const displayLabel = `${option.label} - ${selectedSubOption.label}: ${singleChoice.label}`;
                      const pricingMethod = singleChoice.pricing_method || selectedSubOption.pricing_method || 'per-unit';
                      const price = singleChoice.price || 0;
                      
                      if (onOptionPriceChange) {
                        onOptionPriceChange(subOptionKey, price, displayLabel, pricingMethod);
                      }
                      
                      if (onSelectedOptionsChange) {
                        // ✅ CLEAN FIX: Filter by optionKey or label prefix
                        const updatedOptions = selectedOptions.filter(opt => {
                          const optKey = (opt as any).optionKey;
                          if (optKey) return optKey !== subOptionKey;
                          return !opt.name.startsWith(`${option.label} - ${selectedSubOption.label}:`);
                        });
                        updatedOptions.push({ 
                          name: displayLabel, 
                          price, 
                          pricingMethod,
                          optionKey: subOptionKey // ✅ Store key for reliable filtering
                        } as any);
                        onSelectedOptionsChange(updatedOptions);
                      }
                    }, 0);
                  }
                  
                  const showItemIndicator = !currentItemSelection && selectedSubOption.choices.length > 1;
                  
                  return (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${showItemIndicator ? 'text-destructive' : 'text-muted-foreground'}`}>{selectedSubOption.label}</span>
                      <div className="w-64">
                        <Select
                          value={currentItemSelection || ''}
                          onValueChange={(choiceValue) => {
                            console.log(`🔥 Choice selection: ${subOptionKey} = ${choiceValue}`);
                            handleTreatmentOptionChange(subOptionKey, choiceValue);
                            
                            const choice = selectedSubOption.choices?.find((c: any) => c.value === choiceValue);
                            if (choice) {
                              const displayLabel = `${option.label} - ${selectedSubOption.label}: ${choice.label}`;
                              const pricingMethod = choice.pricing_method || selectedSubOption.pricing_method || 'per-unit';
                              const price = choice.price || 0;
                              
                              // Update option price
                              if (onOptionPriceChange) {
                                onOptionPriceChange(subOptionKey, price, displayLabel, pricingMethod);
                              }
                              
                              // ✅ CLEAN FIX: Also update selectedOptions for Cost Summary display
                              if (onSelectedOptionsChange) {
                                const updatedOptions = selectedOptions.filter(opt => {
                                  const optKey = (opt as any).optionKey;
                                  if (optKey) return optKey !== subOptionKey;
                                  return !opt.name.startsWith(`${option.label} - ${selectedSubOption.label}:`);
                                });
                                updatedOptions.push({
                                  name: displayLabel,
                                  price: price,
                                  pricingMethod,
                                  optionKey: subOptionKey // ✅ Store key for reliable filtering
                                } as any);
                                onSelectedOptionsChange(updatedOptions);
                              }
                            }
                          }}
                          disabled={readOnly}
                        >
                          <SelectTrigger className={`bg-background border-input ${showItemIndicator ? 'border-destructive ring-1 ring-destructive/30' : ''}`}>
                            <SelectValue placeholder={showItemIndicator ? "⚠️ Select..." : "Select..."} />
                          </SelectTrigger>
                          <SelectContent className="z-[9999] bg-popover border-border shadow-lg" position="popper" sideOffset={5} align="end">
                            {selectedSubOption.choices.map((choice: any) => (
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
                  );
                })()}
              </div>
              );
            })()}
          </div>
        );
      })}

    </div>
  );
};