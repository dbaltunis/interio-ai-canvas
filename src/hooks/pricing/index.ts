// Pricing Hooks - Centralized Export

export { useCompletePricing, type CompletePricingParams, type CompletePricingResult } from './useCompletePricing';
export { useFabricPricing, type FabricPricingParams, type FabricPricingResult } from './useFabricPricing';
export { useOptionPricing, type OptionPricingParams, type OptionPricingResult } from './useOptionPricing';
export { 
  useHardwareAccessoryPricing, 
  calculateHardwareAccessories,
  calculateAccessoriesFromOptionData,
  buildHardwareBreakdownItems,
  type HardwareAccessoryResult,
  type AccessoryItem
} from './useHardwareAccessoryPricing';

// Re-export utilities for convenience
export { calculatePrice, resolvePricingMethod, type PricingMethod, type PricingContext, type PricingResult } from '@/utils/pricing/pricingStrategies';
export { calculateLabor, type LaborCalculationParams, type LaborResult } from '@/utils/pricing/laborCalculator';
