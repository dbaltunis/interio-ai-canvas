// CRITICAL: Option pricing calculations
// Currency symbol must be passed from user settings via useCurrencyAwarePricing hook
// Fullness and fabricWidth should ideally come from template/item settings
// IMPORTANT: Blinds (venetian, cellular, vertical) should NOT use fullness - fullness = 1.0 for blinds

import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { calculatePrice, resolvePricingMethod, type PricingMethod, type PricingContext } from "@/utils/pricing/pricingStrategies";

export const calculateOptionCost = (option: any, formData: any, currencySymbol: string = '$') => {
  const baseCost = getOptionPrice(option);
  let method = getOptionPricingMethod(option) as PricingMethod;
  
  // If option inherits from window covering, use window covering's method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = resolvePricingMethod(method, option.window_covering_pricing_method as PricingMethod);
  }

  // CRITICAL: Detect if this is a blind type to avoid applying curtain-style fullness
  const isBlind = formData.treatment_type?.toLowerCase().includes('blind') ||
                  formData.treatment_category?.toLowerCase().includes('blind') ||
                  formData.curtain_type === 'blind';
  
  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: formData.quantity || 1,
    // CRITICAL: Blinds use fullness = 1.0 (no multiplication), curtains use 2.5 or custom value
    fullness: isBlind ? 1.0 : (parseFloat(formData.heading_fullness) || 2.5),
    fabricWidth: parseFloat(formData.fabric_width) || (isBlind ? 100 : 137),
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod,
    // CRITICAL: Pass pricing grid data for options
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

  // CRITICAL: Detect if this is a blind type to avoid applying curtain-style fullness
  const isBlind = formData.treatment_type?.toLowerCase().includes('blind') ||
                  formData.treatment_category?.toLowerCase().includes('blind') ||
                  formData.curtain_type === 'blind';

  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: formData.quantity || 1,
    // CRITICAL: Blinds use fullness = 1.0 (no multiplication), curtains use 2.5 or custom value
    fullness: isBlind ? 1.0 : (parseFloat(formData.heading_fullness) || 2.5),
    fabricWidth: parseFloat(formData.fabric_width) || (isBlind ? 100 : 137),
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod,
    // CRITICAL: Pass pricing grid data for options
    pricingGridData: option.extra_data?.pricing_grid_data || option.pricing_grid_data,
    currencySymbol
  };

  return calculatePrice(method, context);
};
