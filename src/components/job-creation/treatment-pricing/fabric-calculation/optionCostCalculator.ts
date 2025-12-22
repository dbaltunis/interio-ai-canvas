/**
 * Option pricing calculations
 * 
 * ARCHITECTURE RULES:
 * - Fullness and fabricWidth MUST come from template/formData - no hardcoded defaults
 * - Blinds use fullness = 1.0 (no multiplication)
 * - All values must be explicitly provided or calculation should warn
 */

import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { calculatePrice, resolvePricingMethod, type PricingMethod, type PricingContext } from "@/utils/pricing/pricingStrategies";

/**
 * Determines if treatment is a blind type (fullness = 1.0)
 */
const isBlindType = (formData: any): boolean => {
  const treatmentType = formData.treatment_type?.toLowerCase() || '';
  const treatmentCategory = formData.treatment_category?.toLowerCase() || '';
  
  return treatmentType.includes('blind') || 
         treatmentCategory.includes('blind') ||
         treatmentCategory === 'roller_blinds' ||
         treatmentCategory === 'venetian_blinds' ||
         treatmentCategory === 'cellular_blinds' ||
         treatmentCategory === 'vertical_blinds' ||
         formData.curtain_type === 'blind';
};

/**
 * Gets fullness value - MUST come from template, no hardcoded defaults
 */
const getFullness = (formData: any, isBlind: boolean): number => {
  // Blinds always use 1.0 - no fullness multiplication
  if (isBlind) return 1.0;
  
  // For curtains/romans, fullness MUST come from formData (which comes from template)
  const fullness = parseFloat(formData.heading_fullness) || 
                   parseFloat(formData.fullness_ratio) ||
                   parseFloat(formData.template_fullness);
  
  if (!fullness || fullness <= 0) {
    console.warn('[OPTION_CALC] Missing fullness value - should come from template. formData:', {
      heading_fullness: formData.heading_fullness,
      fullness_ratio: formData.fullness_ratio,
      template_fullness: formData.template_fullness
    });
  }
  
  return fullness || 1.0; // Return 1.0 as safe fallback but log warning
};

/**
 * Gets fabric width - MUST come from fabric item or template, NO hardcoded fallbacks
 */
const getFabricWidth = (formData: any, isBlind: boolean): number | null => {
  const fabricWidth = parseFloat(formData.fabric_width) ||
                      parseFloat(formData.fabric_width_cm);
  
  if (!fabricWidth || fabricWidth <= 0) {
    console.warn('[OPTION_CALC] Missing fabric width - should come from fabric item. Calculations may be incomplete.');
    return null; // NO hardcoded 137/100 - fail loud
  }
  
  return fabricWidth;
};

export const calculateOptionCost = (option: any, formData: any, currencySymbol: string = '$') => {
  const baseCost = getOptionPrice(option);
  let method = getOptionPricingMethod(option) as PricingMethod;
  
  // If option inherits from window covering, use window covering's method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = resolvePricingMethod(method, option.window_covering_pricing_method as PricingMethod);
  }

  const isBlind = isBlindType(formData);
  
  // Check if this option should only apply to specific headings
  const appliesToHeadings = option.applies_to_headings || option.extra_data?.applies_to_headings;
  if (appliesToHeadings && Array.isArray(appliesToHeadings) && appliesToHeadings.length > 0) {
    const selectedHeading = formData.heading_type || formData.heading_style || formData.heading;
    if (selectedHeading && !appliesToHeadings.includes(selectedHeading.toLowerCase())) {
      // Option doesn't apply to selected heading - return zero cost
      return {
        cost: 0,
        calculation: `Not applicable for ${selectedHeading} heading`,
        breakdown: { units: 0, unitCost: 0, multiplier: 0 }
      };
    }
  }
  
  // For per-panel pricing, use widths_required from fabric calculation if available
  // This gives us the pre-calculated panel count from the fabric calculator
  const panelCount = formData.widths_required || formData.panel_count;
  
  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: panelCount || formData.quantity || 1, // Use panel count for per-panel pricing
    fullness: getFullness(formData, isBlind),
    fabricWidth: getFabricWidth(formData, isBlind),
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod,
    pricingGridData: option.extra_data?.pricing_grid_data || option.pricing_grid_data,
    currencySymbol
  };

  // Apply pricing rules (height multipliers, minimums, etc.)
  let result = calculatePrice(method, context);
  result = applyPricingRules(result, option, formData);
  
  return result;
};

/**
 * Apply additional pricing rules like height multipliers and minimums
 */
const applyPricingRules = (result: any, option: any, formData: any): any => {
  const pricingRules = option.pricing_rules || option.extra_data?.pricing_rules;
  if (!pricingRules) return result;
  
  let finalCost = result.cost;
  let calculation = result.calculation;
  
  // Height multiplier rule (e.g., double price above 10ft)
  if (pricingRules.height_multiplier) {
    const dropFt = (parseFloat(formData.drop) || 0) / 304.8; // mm to ft
    const threshold = pricingRules.height_multiplier.threshold_ft || 10;
    const multiplier = pricingRules.height_multiplier.multiplier || 2;
    
    if (dropFt > threshold) {
      finalCost *= multiplier;
      calculation += ` × ${multiplier} (height > ${threshold}ft)`;
    }
  }
  
  // Minimum order value
  if (pricingRules.minimum) {
    const minValue = pricingRules.minimum.value || 0;
    if (finalCost < minValue && finalCost > 0) {
      calculation = `Minimum: ${result.calculation} → ${minValue}`;
      finalCost = minValue;
    }
  }
  
  // Minimum sqft rule (e.g., 16 sqft minimum for Roman making)
  if (pricingRules.minimum_sqft) {
    const railWidthFt = (parseFloat(formData.rail_width) || 0) / 304.8;
    const dropFt = (parseFloat(formData.drop) || 0) / 304.8;
    const actualSqft = railWidthFt * dropFt;
    const minSqft = pricingRules.minimum_sqft.value || 16;
    
    if (actualSqft < minSqft) {
      const minCost = result.breakdown?.unitCost ? result.breakdown.unitCost * minSqft : finalCost;
      calculation = `Min ${minSqft}sqft: ${result.calculation}`;
      finalCost = Math.max(finalCost, minCost);
    }
  }
  
  return {
    ...result,
    cost: finalCost,
    calculation
  };
};

export const calculateHierarchicalOptionCost = (option: any, formData: any, currencySymbol: string = '$') => {
  const baseCost = getOptionPrice(option);
  let method = getOptionPricingMethod(option) as PricingMethod;
  
  // If option inherits from window covering or category, use that method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = resolvePricingMethod(method, option.window_covering_pricing_method as PricingMethod);
  } else if (method === 'inherit' && option.category_calculation_method) {
    method = resolvePricingMethod(method, option.category_calculation_method as PricingMethod);
  }

  const isBlind = isBlindType(formData);
  
  // Check if this option should only apply to specific headings
  const appliesToHeadings = option.applies_to_headings || option.extra_data?.applies_to_headings;
  if (appliesToHeadings && Array.isArray(appliesToHeadings) && appliesToHeadings.length > 0) {
    const selectedHeading = formData.heading_type || formData.heading_style || formData.heading;
    if (selectedHeading && !appliesToHeadings.includes(selectedHeading.toLowerCase())) {
      return {
        cost: 0,
        calculation: `Not applicable for ${selectedHeading} heading`,
        breakdown: { units: 0, unitCost: 0, multiplier: 0 }
      };
    }
  }

  // For per-panel pricing, use widths_required from fabric calculation
  const panelCount = formData.widths_required || formData.panel_count;

  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: panelCount || formData.quantity || 1,
    fullness: getFullness(formData, isBlind),
    fabricWidth: getFabricWidth(formData, isBlind),
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod,
    pricingGridData: option.extra_data?.pricing_grid_data || option.pricing_grid_data,
    currencySymbol
  };

  let result = calculatePrice(method, context);
  result = applyPricingRules(result, option, formData);
  
  return result;
};
