/**
 * Centralized Blind Calculation Defaults
 * Single source of truth for all blind sqm calculations
 * 
 * Re-exports from calculationFormulas.ts for backward compatibility
 * All formulas are now defined in calculationFormulas.ts
 */

import { BLIND_FORMULA, BLIND_DEFAULTS, BlindFormulaInputs, BlindFormulaResult } from './calculationFormulas';

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
  // PRIORITY: Template settings → Centralized defaults
  return {
    headerHemCm: parseFloat(template?.blind_header_hem_cm) || 
                 parseFloat(template?.header_allowance) || 
                 BLIND_DEFAULTS.headerHemCm,
    
    bottomHemCm: parseFloat(template?.blind_bottom_hem_cm) || 
                 parseFloat(template?.bottom_hem) || 
                 BLIND_DEFAULTS.bottomHemCm,
    
    sideHemCm: parseFloat(template?.blind_side_hem_cm) || 
               parseFloat(template?.side_hem) || 
               BLIND_DEFAULTS.sideHemCm,
    
    wastePercent: parseFloat(template?.waste_percent) || BLIND_DEFAULTS.wastePercent
  };
};

/**
 * Calculate blind sqm with hems applied
 * This uses the centralized BLIND_FORMULA from calculationFormulas.ts
 */
export const calculateBlindSqm = (
  railWidthCm: number,
  dropCm: number,
  hems: BlindHemDefaults
): {
  sqm: number;
  sqmRaw?: number;
  effectiveWidthCm: number;
  effectiveHeightCm: number;
  widthCalcNote: string;
  heightCalcNote: string;
  formula?: string;
} => {
  const inputs: BlindFormulaInputs = {
    railWidthCm,
    dropCm,
    headerHemCm: hems.headerHemCm,
    bottomHemCm: hems.bottomHemCm,
    sideHemCm: hems.sideHemCm,
    wastePercent: hems.wastePercent
  };
  
  const result = BLIND_FORMULA.calculate(inputs);
  
  return {
    sqm: result.sqm,
    sqmRaw: result.sqmRaw,
    effectiveWidthCm: result.effectiveWidthCm,
    effectiveHeightCm: result.effectiveHeightCm,
    widthCalcNote: result.widthCalcNote,
    heightCalcNote: result.heightCalcNote,
    formula: result.formula
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
  result: { sqm: number; effectiveWidthCm: number; effectiveHeightCm: number; formula?: string }
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
    area: `${(result.effectiveWidthCm/100).toFixed(2)} m × ${(result.effectiveHeightCm/100).toFixed(2)} m = ${result.sqm} sqm`,
    formula: result.formula
  });
};
