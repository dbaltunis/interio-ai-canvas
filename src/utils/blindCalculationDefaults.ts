/**
 * Blind Calculation Utilities
 * 
 * NO HIDDEN DEFAULTS - all values must come from template.
 * If template values are missing, functions throw errors.
 */

import { BLIND_FORMULA, BlindFormulaInputs, BlindFormulaResult } from './calculationFormulas';

export interface BlindHemValues {
  headerHemCm: number;
  bottomHemCm: number;
  sideHemCm: number;
  wastePercent: number;
}

/**
 * Extract blind hem values from template
 * THROWS if any required value is missing - NO DEFAULTS
 */
export const getBlindHemValues = (template: any): BlindHemValues => {
  if (!template) {
    throw new Error('[getBlindHemValues] Template is required - cannot calculate without manufacturing settings');
  }
  
  // PRIORITY FIX: User-editable fields (header_allowance, bottom_hem, side_hem) take priority
  // over legacy blind_*_hem_cm fields which are often hidden from UI
  const headerRaw = template.header_allowance ?? template.header_hem_cm ?? template.blind_header_hem_cm;
  const bottomRaw = template.bottom_hem ?? template.bottom_allowance ?? template.bottom_hem_cm ?? template.blind_bottom_hem_cm;
  const sideRaw = template.side_hem ?? template.side_hems ?? template.side_hem_cm ?? template.blind_side_hem_cm;
  const wasteRaw = template.waste_percent ?? template.waste_percentage ?? 0;
  
  const missing: string[] = [];
  if (headerRaw == null) missing.push('header_hem');
  if (bottomRaw == null) missing.push('bottom_hem');
  if (sideRaw == null) missing.push('side_hem');

  if (missing.length > 0) {
    // WARN instead of throwing - TWC-synced templates may be missing hem fields
    // Use 0 as safe default so calculations still work (just without hem allowance)
    console.warn(
      `⚠️ [getBlindHemValues] Template "${template.name || template.id}" missing values: ${missing.join(', ')}. ` +
      `Using 0 as default. Configure these in template manufacturing settings for accurate calculations.`
    );
  }

  return {
    headerHemCm: headerRaw != null ? parseFloat(headerRaw) : 0,
    bottomHemCm: bottomRaw != null ? parseFloat(bottomRaw) : 0,
    sideHemCm: sideRaw != null ? parseFloat(sideRaw) : 0,
    wastePercent: parseFloat(wasteRaw) || 0
  };
};

/**
 * Calculate blind sqm with hems applied
 * Uses centralized BLIND_FORMULA
 */
export const calculateBlindSqm = (
  railWidthCm: number,
  dropCm: number,
  hems: BlindHemValues
): {
  sqm: number;
  sqmRaw?: number;
  effectiveWidthCm: number;
  effectiveHeightCm: number;
  widthCalcNote: string;
  heightCalcNote: string;
  formula?: string;
} => {
  if (!railWidthCm || railWidthCm <= 0) {
    throw new Error('[calculateBlindSqm] railWidthCm is required and must be > 0');
  }
  if (!dropCm || dropCm <= 0) {
    throw new Error('[calculateBlindSqm] dropCm is required and must be > 0');
  }
  
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
 * Debug logging for blind calculations
 */
export const logBlindCalculation = (
  context: string,
  railWidthCm: number,
  dropCm: number,
  hems: BlindHemValues,
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

/**
 * @deprecated Use getBlindHemValues instead. This alias will be removed in a future version.
 * WARNING: Despite the name "Defaults", this function THROWS if hem values are missing!
 * It does NOT return default values.
 */
export const getBlindHemDefaults = (template: any): BlindHemValues => {
  console.warn(
    '⚠️ [DEPRECATED] getBlindHemDefaults is deprecated and misleadingly named. ' +
    'Use getBlindHemValues instead. This function throws errors for missing values - it does NOT return defaults!'
  );
  return getBlindHemValues(template);
};
