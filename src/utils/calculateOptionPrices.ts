import { getPriceFromGrid } from "@/hooks/usePricingGrids";

interface OptionWithPrice {
  name: string;
  price?: number;
  pricingMethod?: string;
  pricingGridData?: any;
  calculatedPrice?: number;
  [key: string]: any;
}

interface Measurements {
  rail_width?: number;
  drop?: number;
  width?: number;
  height?: number;
}

interface FabricCalculation {
  linearMeters?: number;
}

/**
 * Calculate the actual prices for options based on their pricing method.
 * This function enriches options with calculatedPrice field that should be saved to DB.
 * 
 * @param options - Array of selected options with base prices
 * @param measurements - Width/height measurements in MM (rail_width, drop)
 * @param fabricCalculation - Optional fabric calculation with linear meters
 * @returns Options array with calculatedPrice field added
 */
export const calculateOptionPrices = (
  options: OptionWithPrice[],
  measurements: Measurements,
  fabricCalculation?: FabricCalculation
): OptionWithPrice[] => {
  if (!options || options.length === 0) return [];

  // Convert measurements from MM to CM
  const widthMM = Number(measurements?.rail_width) || Number(measurements?.width) || 0;
  const heightMM = Number(measurements?.drop) || Number(measurements?.height) || 0;
  const widthCm = widthMM / 10;
  const heightCm = heightMM / 10;
  const linearMeters = fabricCalculation?.linearMeters || (widthCm / 100);

  return options.map(option => {
    const basePrice = Number(option.price) || 0;
    let calculatedPrice = basePrice;
    let pricingDetails = '';

    // Calculate based on pricing method
    const method = option.pricingMethod?.toLowerCase();
    
    // CRITICAL: Hardware uses ACTUAL rail width, NOT fullness-adjusted fabric linear meters!
    // Hardware = tracks, poles, rods, rails - physical items matching window width
    const optionNameLower = (option.name || '').toLowerCase();
    const optionKeyLower = (option.optionKey || option.option_key || '').toLowerCase();
    const isHardware = optionNameLower.includes('hardware') || 
                       optionNameLower.includes('track') || 
                       optionNameLower.includes('pole') || 
                       optionNameLower.includes('rod') ||
                       optionNameLower.includes('rail') ||
                       optionKeyLower.includes('hardware') ||
                       optionKeyLower.includes('track') ||
                       optionKeyLower.includes('pole');
    
    // Hardware uses actual rail width in meters, fabric uses fullness-adjusted linear meters
    const actualRailMeters = widthCm / 100;
    const metersForCalculation = isHardware ? actualRailMeters : linearMeters;
    
    if (method === 'per-meter' || method === 'per-metre' || method === 'per-linear-meter') {
      if (basePrice > 0 && metersForCalculation > 0) {
        calculatedPrice = basePrice * metersForCalculation;
        pricingDetails = `${basePrice.toFixed(2)}/m × ${metersForCalculation.toFixed(2)}m`;
      }
    } else if (method === 'per-sqm' || method === 'per-square-meter') {
      if (basePrice > 0 && widthCm > 0 && heightCm > 0) {
        const sqm = (widthCm * heightCm) / 10000;
        calculatedPrice = basePrice * sqm;
        pricingDetails = `${basePrice.toFixed(2)}/sqm × ${sqm.toFixed(2)}sqm`;
      }
    } else if (method === 'pricing-grid' && option.pricingGridData) {
      const gridPrice = getPriceFromGrid(option.pricingGridData, widthCm, heightCm);
      if (gridPrice > 0) {
        calculatedPrice = gridPrice;
        pricingDetails = 'Grid lookup';
      }
    } else if (method === 'per-width') {
      if (basePrice > 0 && widthCm > 0) {
        calculatedPrice = basePrice * actualRailMeters; // Per meter width (always actual rail)
        pricingDetails = `${basePrice.toFixed(2)}/m × ${actualRailMeters.toFixed(2)}m`;
      }
    }
    // 'fixed', 'per-unit', 'per-item' - use base price as-is

    console.log(`💰 Option price calc: ${option.name}`, {
      basePrice,
      calculatedPrice,
      pricingMethod: method,
      isHardware,
      metersForCalculation,
      pricingDetails,
      widthCm,
      heightCm,
      linearMeters
    });

    return {
      ...option,
      calculatedPrice,
      pricingDetails,
      // Keep original price as basePrice for reference
      basePrice: basePrice
    };
  });
};

/**
 * Get the effective price for an option (calculatedPrice if available, otherwise price)
 */
export const getOptionEffectivePrice = (option: OptionWithPrice): number => {
  return Number(option.calculatedPrice) || Number(option.price) || 0;
};
