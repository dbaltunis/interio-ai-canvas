/**
 * Data adapter to transform treatment option values to legacy WindowCoveringOption format
 * This bridges the gap between the new treatment_options system and legacy code expecting base_cost/base_price
 */

import { OptionValue } from '@/hooks/useTreatmentOptions';

export interface WindowCoveringOption {
  id: string;
  name: string;
  description?: string;
  base_cost: number;
  base_price: number;
  cost_type: string;
  pricing_method: string;
  image_url?: string;
  is_required: boolean;
  is_default: boolean;
  option_type?: string;
  extra_data?: any;
}

/**
 * Transform an OptionValue from treatment_options to WindowCoveringOption format
 */
export const transformOptionValue = (optionValue: OptionValue, optionKey?: string): WindowCoveringOption => {
  // Extract price from extra_data, fallback to 0
  const price = optionValue.extra_data?.price || 0;
  
  // Extract pricing method from extra_data, fallback to 'per-unit'
  const pricingMethod = optionValue.extra_data?.pricing_method || 'per-unit';
  
  return {
    id: optionValue.id,
    name: optionValue.label,
    description: optionValue.extra_data?.description || undefined,
    base_cost: price,
    base_price: price,
    cost_type: pricingMethod,
    pricing_method: pricingMethod,
    image_url: optionValue.extra_data?.image_url || undefined,
    is_required: optionValue.extra_data?.is_required || false,
    is_default: optionValue.extra_data?.is_default || false,
    option_type: optionKey,
    extra_data: optionValue.extra_data,
  };
};

/**
 * Transform an array of OptionValues to WindowCoveringOptions
 */
export const transformOptionValues = (
  optionValues: OptionValue[], 
  optionKey?: string
): WindowCoveringOption[] => {
  return optionValues.map(ov => transformOptionValue(ov, optionKey));
};

/**
 * Get price from an option, checking both new and legacy formats
 */
export const getOptionPrice = (option: any): number => {
  // Try new format first (extra_data.price)
  if (option.extra_data?.price !== undefined) {
    return option.extra_data.price;
  }
  
  // Try legacy formats
  if (option.base_cost !== undefined) {
    return option.base_cost;
  }
  
  if (option.base_price !== undefined) {
    return option.base_price;
  }
  
  return 0;
};

/**
 * Get pricing method from an option, checking both new and legacy formats
 */
export const getOptionPricingMethod = (option: any): string => {
  // Try new format first
  if (option.extra_data?.pricing_method) {
    return option.extra_data.pricing_method;
  }
  
  // Try legacy formats
  if (option.pricing_method) {
    return option.pricing_method;
  }
  
  if (option.cost_type) {
    return option.cost_type;
  }
  
  return 'per-unit';
};
