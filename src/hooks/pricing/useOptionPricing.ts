// Consolidated Option Pricing Hook

import { useMemo } from 'react';
import { calculatePrice, resolvePricingMethod, type PricingContext, type PricingMethod } from '@/utils/pricing/pricingStrategies';
import { getOptionPrice, getOptionPricingMethod } from '@/utils/optionDataAdapter';

export interface OptionPricingParams {
  formData: any;
  options: any[];
  hierarchicalOptions?: any[];
  windowCoveringPricingMethod?: PricingMethod;
}

export interface OptionPricingResult {
  totalCost: number;
  optionDetails: Array<{
    name: string;
    cost: number;
    method: string;
    calculation: string;
  }>;
}

export const useOptionPricing = (params: OptionPricingParams): OptionPricingResult => {
  const { formData, options = [], hierarchicalOptions = [], windowCoveringPricingMethod } = params;

  const result = useMemo(() => {
    let totalCost = 0;
    const optionDetails: Array<{ name: string; cost: number; method: string; calculation: string }> = [];

    const pricingContext: Partial<PricingContext> = {
      railWidth: parseFloat(formData.rail_width) || 0,
      drop: parseFloat(formData.drop) || 0,
      quantity: formData.quantity || 1,
      fullness: parseFloat(formData.heading_fullness) || 2.5,
      fabricWidth: parseFloat(formData.fabric_width) || 137,
      fabricCost: parseFloat(formData.fabric_cost_per_yard) || 0,
      fabricUsage: parseFloat(formData.fabric_usage) || 0,
      windowCoveringPricingMethod
    };

    // Calculate traditional options
    options.forEach(option => {
      if (formData.selected_options?.includes(option.id)) {
        const baseCost = getOptionPrice(option);
        let method = getOptionPricingMethod(option) as PricingMethod;
        
        // Resolve inherited pricing
        method = resolvePricingMethod(method, windowCoveringPricingMethod);

        const result = calculatePrice(method, {
          ...pricingContext,
          baseCost
        } as PricingContext);

        totalCost += result.cost;
        optionDetails.push({
          name: option.name,
          cost: result.cost,
          method,
          calculation: result.calculation
        });
      }
    });

    // Calculate hierarchical options
    hierarchicalOptions.forEach(category => {
      category.subcategories?.forEach((subcategory: any) => {
        subcategory.sub_subcategories?.forEach((subSub: any) => {
          if (formData.selected_options?.includes(subSub.id)) {
            const baseCost = getOptionPrice(subSub);
            let method = (subSub.calculation_method || subSub.pricing_method || 'fixed') as PricingMethod;
            
            // Check if category affects calculation method
            if (method === 'inherit' && category.calculation_method) {
              method = category.calculation_method as PricingMethod;
            }
            
            method = resolvePricingMethod(method, windowCoveringPricingMethod);

            const result = calculatePrice(method, {
              ...pricingContext,
              baseCost
            } as PricingContext);

            totalCost += result.cost;
            optionDetails.push({
              name: subSub.name,
              cost: result.cost,
              method,
              calculation: result.calculation
            });
          }

          // Check extras
          subSub.extras?.forEach((extra: any) => {
            if (formData.selected_options?.includes(extra.id)) {
              const baseCost = getOptionPrice(extra);
              let method = (extra.calculation_method || extra.pricing_method || 'fixed') as PricingMethod;
              method = resolvePricingMethod(method, windowCoveringPricingMethod);

              const result = calculatePrice(method, {
                ...pricingContext,
                baseCost
              } as PricingContext);

              totalCost += result.cost;
              optionDetails.push({
                name: extra.name,
                cost: result.cost,
                method,
                calculation: result.calculation
              });
            }
          });
        });
      });
    });

    return { totalCost, optionDetails };
  }, [formData, options, hierarchicalOptions, windowCoveringPricingMethod]);

  return result;
};
