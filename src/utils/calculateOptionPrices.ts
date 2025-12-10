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
  unit?: string;
}

interface FabricCalculation {
  linearMeters?: number;
}

/**
 * Calculate the actual prices for options based on their pricing method.
 * This function enriches options with calculatedPrice field that should be saved to DB.
 * 
 * UNIT STANDARD: Measurements come from database in MM (millimeters)
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

  // Get raw measurement values
  const rawWidth = Number(measurements?.rail_width) || Number(measurements?.width) || 0;
  const rawHeight = Number(measurements?.drop) || Number(measurements?.height) || 0;
  const measurementUnit = (measurements?.unit || 'mm')?.toLowerCase();
  
  // CRITICAL: Convert to CM based on the actual unit
  // Measurements can come in user's display unit (CM) OR database unit (MM)
  let widthCm: number, heightCm: number;
  if (measurementUnit === 'cm') {
    // Already in CM - use directly
    widthCm = rawWidth;
    heightCm = rawHeight;
  } else if (measurementUnit === 'm') {
    // In meters - multiply by 100
    widthCm = rawWidth * 100;
    heightCm = rawHeight * 100;
  } else {
    // Assume MM (database standard) - divide by 10
    // But if value < 1000, it's likely already in CM (safety check)
    widthCm = rawWidth > 10000 ? rawWidth / 10 : rawWidth;
    heightCm = rawHeight > 10000 ? rawHeight / 10 : rawHeight;
  }
  
  // Convert to meters for per-meter calculations
  const widthM = widthCm / 100;
  const heightM = heightCm / 100;
  
  // Linear meters from fabric calculation (already in meters)
  const linearMeters = fabricCalculation?.linearMeters || widthM;

  console.log(`📐 Option price calc context:`, {
    rawWidth,
    rawHeight,
    widthCm,
    heightCm,
    widthM,
    linearMeters
  });

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
    
    // Check if hardware has a FIXED LENGTH in its name (e.g., "2.4m", "3m", "1.8m")
    // These should be priced as fixed units, not per-meter
    const fixedLengthMatch = optionNameLower.match(/(\d+\.?\d*)\s*m\b/);
    const hasFixedLength = isHardware && fixedLengthMatch;
    
    // Hardware uses actual rail width in meters, fabric uses fullness-adjusted linear meters
    const actualRailMeters = widthM;
    const metersForCalculation = isHardware ? actualRailMeters : linearMeters;
    
    // FIXED-LENGTH HARDWARE: Don't apply per-meter, use as single unit
    if (hasFixedLength && (method === 'per-meter' || method === 'per-metre' || method === 'per-linear-meter')) {
      // Fixed-length item like "Curtain Track white 2.4m" - price is per unit
      calculatedPrice = basePrice;
      pricingDetails = `${basePrice.toFixed(2)} per unit (fixed length item)`;
    } else if (method === 'per-meter' || method === 'per-metre' || method === 'per-linear-meter') {
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
      hasFixedLength,
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
