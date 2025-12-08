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
 * Gets fabric width - MUST come from fabric item or template
 */
const getFabricWidth = (formData: any, isBlind: boolean): number => {
  const fabricWidth = parseFloat(formData.fabric_width) ||
                      parseFloat(formData.fabric_width_cm);
  
  if (!fabricWidth || fabricWidth <= 0) {
    console.warn('[OPTION_CALC] Missing fabric width - should come from fabric item');
  }
  
  return fabricWidth || (isBlind ? 100 : 137); // Log warning but provide reasonable fallback
};

export const calculateOptionCost = (option: any, formData: any, currencySymbol: string = '$') => {
  const baseCost = getOptionPrice(option);
  let method = getOptionPricingMethod(option) as PricingMethod;
  
  // If option inherits from window covering, use window covering's method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = resolvePricingMethod(method, option.window_covering_pricing_method as PricingMethod);
  }

  const isBlind = isBlindType(formData);
  
  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: formData.quantity || 1,
    fullness: getFullness(formData, isBlind),
    fabricWidth: getFabricWidth(formData, isBlind),
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod,
    pricingGridData: option.extra_data?.pricing_grid_data || option.pricing_grid_data,
    currencySymbol
  };

  return calculatePrice(method, context);
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

  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: formData.quantity || 1,
    fullness: getFullness(formData, isBlind),
    fabricWidth: getFabricWidth(formData, isBlind),
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod,
    pricingGridData: option.extra_data?.pricing_grid_data || option.pricing_grid_data,
    currencySymbol
  };

  return calculatePrice(method, context);
};
