// DEPRECATED: Use new pricing utilities from @/hooks/pricing instead
// This file is kept for backward compatibility only

import { getOptionPrice, getOptionPricingMethod } from "@/utils/optionDataAdapter";
import { calculatePrice, resolvePricingMethod, type PricingMethod, type PricingContext } from "@/utils/pricing/pricingStrategies";

export const calculateOptionCost = (option: any, formData: any) => {
  const baseCost = getOptionPrice(option);
  let method = getOptionPricingMethod(option) as PricingMethod;
  
  // If option inherits from window covering, use window covering's method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = resolvePricingMethod(method, option.window_covering_pricing_method as PricingMethod);
  }

  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: formData.quantity || 1,
    fullness: parseFloat(formData.heading_fullness) || 2.5,
    fabricWidth: parseFloat(formData.fabric_width) || 137,
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod
  };

  return calculatePrice(method, context);
};

export const calculateHierarchicalOptionCost = (option: any, formData: any) => {
  const baseCost = getOptionPrice(option);
  let method = getOptionPricingMethod(option) as PricingMethod;
  
  // If option inherits from window covering or category, use that method
  if (method === 'inherit' && option.window_covering_pricing_method) {
    method = resolvePricingMethod(method, option.window_covering_pricing_method as PricingMethod);
  } else if (method === 'inherit' && option.category_calculation_method) {
    method = resolvePricingMethod(method, option.category_calculation_method as PricingMethod);
  }

  const context: PricingContext = {
    baseCost,
    railWidth: parseFloat(formData.rail_width) || 0,
    drop: parseFloat(formData.drop) || 0,
    quantity: formData.quantity || 1,
    fullness: parseFloat(formData.heading_fullness) || 2.5,
    fabricWidth: parseFloat(formData.fabric_width) || 137,
    fabricCost: parseFloat(formData.fabric_cost_per_yard || "0") || 0,
    fabricUsage: parseFloat(formData.fabric_usage || "0") || 0,
    windowCoveringPricingMethod: option.window_covering_pricing_method as PricingMethod
  };

  return calculatePrice(method, context);
};
