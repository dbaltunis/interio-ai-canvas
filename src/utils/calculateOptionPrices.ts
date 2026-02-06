import { getPriceFromGrid } from "@/hooks/usePricingGrids";
import { normalizePricingMethod, PRICING_METHODS } from "@/constants/pricingMethods";

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
  curtainCount?: number;   // Number of panels/curtains (2 for pair, 1 for single)
  widthsRequired?: number; // Number of fabric widths/drops
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
  
  // CRITICAL: Convert to CM based on the EXPLICIT unit - no guessing
  // Measurements can come in user's display unit OR database unit (MM)
  let widthCm: number, heightCm: number;
  if (measurementUnit === 'cm') {
    // Already in CM - use directly
    widthCm = rawWidth;
    heightCm = rawHeight;
  } else if (measurementUnit === 'm') {
    // In meters - multiply by 100
    widthCm = rawWidth * 100;
    heightCm = rawHeight * 100;
  } else if (measurementUnit === 'inches' || measurementUnit === 'in') {
    // In inches - multiply by 2.54
    widthCm = rawWidth * 2.54;
    heightCm = rawHeight * 2.54;
  } else if (measurementUnit === 'mm') {
    // Database standard MM - divide by 10
    widthCm = rawWidth / 10;
    heightCm = rawHeight / 10;
  } else {
    // UNKNOWN UNIT: Log warning and assume MM (database standard)
    // This prevents silent errors from incorrect unit assumptions
    console.warn(`⚠️ [calculateOptionPrices] Unknown measurement unit "${measurementUnit}", assuming MM. Pass explicit unit for accuracy.`);
    widthCm = rawWidth / 10;
    heightCm = rawHeight / 10;
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

    // ✅ CRITICAL FIX: If calculatedPrice already exists and is valid, USE IT!
    // This preserves saved prices when editing existing treatments
    // Only recalculate if calculatedPrice is missing/zero AND basePrice exists
    if (option.calculatedPrice !== undefined && option.calculatedPrice !== null && option.calculatedPrice > 0) {
      console.log(`💰 Option "${option.name}": Using existing calculatedPrice ${option.calculatedPrice} (not recalculating)`);
      return {
        ...option,
        calculatedPrice: option.calculatedPrice,
        pricingDetails: option.pricingDetails || 'Saved price',
        basePrice: option.basePrice ?? basePrice
      };
    }

    let calculatedPrice = basePrice;
    let pricingDetails = '';

    // STANDARDIZED: Use centralized pricing method normalization
    const rawMethod = option.pricingMethod || '';
    const method = normalizePricingMethod(rawMethod);
    
    // CRITICAL: Hardware uses ACTUAL rail width, NOT fullness-adjusted fabric linear meters!
    const optionNameLower = (option.name || '').toLowerCase();
    const optionKeyLower = (option.optionKey || option.option_key || '').toLowerCase();
    
    // ✅ FIX: Prefer explicit category over keyword detection for reliability
    const optionCategory = ((option as any).category || (option as any).optionCategory || '').toLowerCase();
    const isHardwareByCategory = optionCategory === 'hardware' || 
                                  optionCategory === 'track' || 
                                  optionCategory === 'accessories' ||
                                  optionCategory === 'motorization';
    
    // Fallback to keyword detection for legacy data without category
    const isHardwareByKeyword = optionNameLower.includes('hardware') || 
                                optionNameLower.includes('track') || 
                                optionNameLower.includes('pole') || 
                                optionNameLower.includes('rod') ||
                                optionNameLower.includes('rail') ||
                                optionNameLower.includes('motor') ||
                                optionKeyLower.includes('hardware') ||
                                optionKeyLower.includes('track') ||
                                optionKeyLower.includes('pole');
    
    // Prefer explicit category, fall back to keyword matching
    const isHardware = isHardwareByCategory || isHardwareByKeyword;
    
    // Log warning when relying on keyword detection (helps identify data that needs category)
    if (isHardwareByKeyword && !isHardwareByCategory) {
      console.warn(`⚠️ [calculateOptionPrices] Option "${option.name}" detected as hardware by keyword. Consider setting category='hardware' explicitly for reliability.`);
    }

    // Check if hardware has a FIXED LENGTH in its name (e.g., "2.4m", "3m", "1.8m")
    const fixedLengthMatch = optionNameLower.match(/(\d+\.?\d*)\s*m\b/);
    const hasFixedLength = isHardware && fixedLengthMatch;
    
    // Hardware uses actual rail width in meters, fabric uses fullness-adjusted linear meters
    const actualRailMeters = widthM;
    const metersForCalculation = isHardware ? actualRailMeters : linearMeters;
    
    // Calculate based on normalized pricing method
    const isLinearMethod = method === PRICING_METHODS.PER_LINEAR_METER || 
                          method === PRICING_METHODS.PER_METRE || 
                          method === PRICING_METHODS.PER_METER ||
                          method === PRICING_METHODS.PER_LINEAR_YARD ||
                          method === PRICING_METHODS.PER_YARD;
    
    if (hasFixedLength && isLinearMethod) {
      // Fixed-length hardware item - price is per unit
      calculatedPrice = basePrice;
      pricingDetails = `${basePrice.toFixed(2)} per unit (fixed length item)`;
    } else if (isLinearMethod) {
      if (basePrice > 0 && metersForCalculation > 0) {
        calculatedPrice = basePrice * metersForCalculation;
        pricingDetails = `${basePrice.toFixed(2)}/m × ${metersForCalculation.toFixed(2)}m`;
      }
    } else if (method === PRICING_METHODS.PER_SQM) {
      // Per sqm for OPTIONS only (e.g., some blind coatings) - NOT for fabric
      if (basePrice > 0 && widthCm > 0 && heightCm > 0) {
        const sqm = (widthCm * heightCm) / 10000;
        calculatedPrice = basePrice * sqm;
        pricingDetails = `${basePrice.toFixed(2)}/sqm × ${sqm.toFixed(2)}sqm`;
      }
    } else if (method === PRICING_METHODS.PRICING_GRID && option.pricingGridData) {
      const gridPrice = getPriceFromGrid(option.pricingGridData, widthCm, heightCm);
      if (gridPrice > 0) {
        calculatedPrice = gridPrice;
        pricingDetails = 'Grid lookup';
      }
    } else if (method === PRICING_METHODS.PER_WIDTH) {
      if (basePrice > 0 && widthCm > 0) {
        calculatedPrice = basePrice * actualRailMeters;
        pricingDetails = `${basePrice.toFixed(2)}/m × ${actualRailMeters.toFixed(2)}m`;
      }
    } else if (method === PRICING_METHODS.PERCENTAGE) {
      // Percentage of fabric cost
      const fabricTotal = linearMeters * (option.fabricCostPerUnit || 0);
      if (basePrice > 0 && fabricTotal > 0) {
        calculatedPrice = (basePrice / 100) * fabricTotal;
        pricingDetails = `${basePrice}% of fabric`;
      }
    } else if (method === PRICING_METHODS.PER_PANEL) {
      // Per-panel pricing - multiply by curtain/blind count
      // For pairs = 2, for singles = 1
      // ✅ FIX: Operator precedence - use nullish coalescing and proper grouping
      const panelCount = fabricCalculation?.curtainCount ?? 
                         ((measurements as any)?.curtain_type === 'pair' ? 2 : 1);
      if (basePrice > 0) {
        calculatedPrice = basePrice * panelCount;
        pricingDetails = `${basePrice.toFixed(2)}/panel × ${panelCount} panel(s)`;
      }
    } else if (method === PRICING_METHODS.PER_DROP) {
      // Per-drop pricing - multiply by widths/drops required  
      const dropCount = fabricCalculation?.widthsRequired || 1;
      if (basePrice > 0) {
        calculatedPrice = basePrice * dropCount;
        pricingDetails = `${basePrice.toFixed(2)}/drop × ${dropCount} drop(s)`;
      }
    }
    // 'fixed', 'per-unit', 'per-piece', 'per-roll' - use base price as-is

    console.log(`💰 Option price calc: ${option.name}`, {
      basePrice,
      calculatedPrice,
      pricingMethod: method,
      rawMethod,
      isHardware,
      hasFixedLength,
      metersForCalculation,
      pricingDetails
    });

    return {
      ...option,
      calculatedPrice,
      pricingDetails,
      basePrice
    };
  });
};

/**
 * Get the effective price for an option (calculatedPrice if available, otherwise price)
 */
export const getOptionEffectivePrice = (option: OptionWithPrice): number => {
  return Number(option.calculatedPrice) || Number(option.price) || 0;
};
