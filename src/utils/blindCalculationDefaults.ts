/**
 * Centralized Blind Calculation Defaults
 * Single source of truth for all blind sqm calculations
 * 
 * FORMULA: 
 *   effectiveWidth = railWidth + (sideHem × 2)
 *   effectiveHeight = drop + headerHem + bottomHem
 *   sqm = (effectiveWidth × effectiveHeight) / 10000 × (1 + waste%)
 */

export interface BlindHemDefaults {
  headerHemCm: number;
  bottomHemCm: number;
  sideHemCm: number;
  wastePercent: number;
}

/**
 * Get blind hem defaults from template, with sensible fallbacks
 * User's expected calculation: 
 *   width: 120 + 4 + 4 = 128 cm (side = 4cm each)
 *   height: 120 + 8 + 10 = 138 cm (header = 8, bottom = 10)
 */
export const getBlindHemDefaults = (template?: any): BlindHemDefaults => {
  // PRIORITY: Template settings → Sensible defaults
  return {
    headerHemCm: parseFloat(template?.blind_header_hem_cm) || 
                 parseFloat(template?.header_allowance) || 
                 8, // Default: 8cm header
    
    bottomHemCm: parseFloat(template?.blind_bottom_hem_cm) || 
                 parseFloat(template?.bottom_hem) || 
                 10, // Default: 10cm bottom
    
    sideHemCm: parseFloat(template?.blind_side_hem_cm) || 
               parseFloat(template?.side_hem) || 
               4, // Default: 4cm per side
    
    wastePercent: parseFloat(template?.waste_percent) || 0 // Default: 0% waste
  };
};

/**
 * Calculate blind sqm with hems applied
 * This is THE SINGLE calculation function all code paths should use
 */
export const calculateBlindSqm = (
  railWidthCm: number,
  dropCm: number,
  hems: BlindHemDefaults
): {
  sqm: number;
  effectiveWidthCm: number;
  effectiveHeightCm: number;
  widthCalcNote: string;
  heightCalcNote: string;
} => {
  const effectiveWidthCm = railWidthCm + (hems.sideHemCm * 2);
  const effectiveHeightCm = dropCm + hems.headerHemCm + hems.bottomHemCm;
  
  const sqmRaw = (effectiveWidthCm * effectiveHeightCm) / 10000;
  const sqm = sqmRaw * (1 + hems.wastePercent / 100);
  
  // Round to 2 decimal places
  const roundedSqm = Math.round(sqm * 100) / 100;
  
  return {
    sqm: roundedSqm,
    effectiveWidthCm,
    effectiveHeightCm,
    widthCalcNote: `width: ${railWidthCm} + ${hems.sideHemCm} + ${hems.sideHemCm} = ${effectiveWidthCm} cm`,
    heightCalcNote: `height: ${dropCm} + ${hems.headerHemCm} + ${hems.bottomHemCm} = ${effectiveHeightCm} cm`
  };
};

/**
 * Debug logging for blind calculations - use this to trace calculation issues
 */
export const logBlindCalculation = (
  context: string,
  railWidthCm: number,
  dropCm: number,
  hems: BlindHemDefaults,
  result: { sqm: number; effectiveWidthCm: number; effectiveHeightCm: number }
) => {
  console.log(`📐 ${context} Blind Calculation:`, {
    input: { railWidthCm, dropCm },
    hems: {
      header: hems.headerHemCm,
      bottom: hems.bottomHemCm,
      side: hems.sideHemCm,
      waste: hems.wastePercent + '%'
    },
    effective: {
      width: `${railWidthCm} + ${hems.sideHemCm} + ${hems.sideHemCm} = ${result.effectiveWidthCm} cm`,
      height: `${dropCm} + ${hems.headerHemCm} + ${hems.bottomHemCm} = ${result.effectiveHeightCm} cm`
    },
    area: `${(result.effectiveWidthCm/100).toFixed(2)} m × ${(result.effectiveHeightCm/100).toFixed(2)} m = ${result.sqm} sqm`
  });
};
