/**
 * LEGACY CALCULATION FORMULAS - DELEGATES TO src/engine/formulas/
 *
 * This file is a BACKWARD-COMPATIBLE WRAPPER around the new formulas folder.
 * All actual math lives in src/engine/formulas/ (the single source of truth).
 *
 * Used by:
 * - orientationCalculator.ts (legacy path)
 * - blindCalculationDefaults.ts (legacy path)
 *
 * DO NOT add new calculation logic here.
 * New code should import directly from '@/engine/formulas'.
 */

import {
  calculateCurtainVertical,
  calculateCurtainHorizontal,
  calculateBlindSqm as formulaBlindSqm,
  type CurtainInput,
} from '@/engine/formulas';

// ============================================
// BLIND FORMULAS (SQM-based) - delegates to formulas/
// ============================================

export interface BlindFormulaInputs {
  railWidthCm: number;
  dropCm: number;
  headerHemCm: number;
  bottomHemCm: number;
  sideHemCm: number;
  wastePercent: number;
}

export interface BlindFormulaResult {
  sqmRaw: number;
  sqm: number;
  effectiveWidthCm: number;
  effectiveHeightCm: number;
  formula: string;
  widthCalcNote: string;
  heightCalcNote: string;
}

export const BLIND_FORMULA = {
  name: 'Blind SQM Calculation',
  description: 'Calculate square meters for blinds with hem allowances',

  calculate: (inputs: BlindFormulaInputs): BlindFormulaResult => {
    const result = formulaBlindSqm({
      railWidthCm: inputs.railWidthCm,
      dropCm: inputs.dropCm,
      headerHemCm: inputs.headerHemCm,
      bottomHemCm: inputs.bottomHemCm,
      sideHemCm: inputs.sideHemCm,
      wastePercent: inputs.wastePercent,
    });

    return {
      sqmRaw: result.sqmRaw,
      sqm: result.sqm,
      effectiveWidthCm: result.effectiveWidthCm,
      effectiveHeightCm: result.effectiveHeightCm,
      formula: result.breakdown.summary,
      widthCalcNote: `width: ${inputs.railWidthCm} + ${inputs.sideHemCm} + ${inputs.sideHemCm} = ${result.effectiveWidthCm} cm`,
      heightCalcNote: `height: ${inputs.dropCm} + ${inputs.headerHemCm} + ${inputs.bottomHemCm} = ${result.effectiveHeightCm} cm`,
    };
  },
};

// ============================================
// CURTAIN FORMULAS (Linear Meter based) - delegates to formulas/
// ============================================

export interface CurtainFormulaInputs {
  railWidthCm: number;
  dropCm: number;
  fullness: number;
  fabricWidthCm: number;
  quantity: number;
  headerHemCm: number;
  bottomHemCm: number;
  sideHemCm: number;
  seamHemCm: number;
  poolingCm: number;
  returnLeftCm: number;
  returnRightCm: number;
  overlapCm: number;
}

export interface CurtainFormulaResult {
  linearMeters: number;
  linearMetersCm: number;
  widthsRequired: number;
  totalDropCm: number;
  seamsCount: number;
  seamAllowanceCm: number;
  formula: string;
}

/**
 * Convert legacy CurtainFormulaInputs to new CurtainInput format
 */
function toFormulaInput(inputs: CurtainFormulaInputs): CurtainInput {
  return {
    railWidthCm: inputs.railWidthCm,
    dropCm: inputs.dropCm,
    fullness: inputs.fullness,
    fabricWidthCm: inputs.fabricWidthCm,
    panelCount: inputs.quantity,
    headerHemCm: inputs.headerHemCm,
    bottomHemCm: inputs.bottomHemCm,
    sideHemCm: inputs.sideHemCm,
    seamHemCm: inputs.seamHemCm,
    returnLeftCm: inputs.returnLeftCm,
    returnRightCm: inputs.returnRightCm,
    overlapCm: inputs.overlapCm || 0,
    poolingCm: inputs.poolingCm,
    wastePercent: 0, // Legacy path applies waste separately
  };
}

/**
 * Convert new CurtainResult to legacy CurtainFormulaResult format
 */
function toLegacyResult(result: ReturnType<typeof calculateCurtainVertical>): CurtainFormulaResult {
  // linearMetersCm: convert back from meters
  const linearMetersCm = result.linearMeters * 100;
  return {
    linearMeters: result.linearMeters,
    linearMetersCm,
    widthsRequired: result.widthsRequired,
    totalDropCm: result.totalDropCm,
    seamsCount: result.seamsCount,
    seamAllowanceCm: result.seamAllowanceCm,
    formula: result.breakdown.summary,
  };
}

/**
 * CURTAIN VERTICAL (Standard) FORMULA
 * Now delegates to src/engine/formulas/curtain.formulas.ts
 */
export const CURTAIN_VERTICAL_FORMULA = {
  name: 'Curtain Linear Meters (Vertical/Standard)',
  description: 'Standard orientation - fabric runs top to bottom',
  calculate: (inputs: CurtainFormulaInputs): CurtainFormulaResult => {
    const result = calculateCurtainVertical(toFormulaInput(inputs));
    return toLegacyResult(result);
  },
};

/**
 * CURTAIN HORIZONTAL (Railroaded) FORMULA
 * Now delegates to src/engine/formulas/curtain.formulas.ts
 */
export const CURTAIN_HORIZONTAL_FORMULA = {
  name: 'Curtain Linear Meters (Horizontal/Railroaded)',
  description: 'Railroaded orientation - fabric runs side to side',
  calculate: (inputs: CurtainFormulaInputs): CurtainFormulaResult => {
    const result = calculateCurtainHorizontal(toFormulaInput(inputs));
    return toLegacyResult(result);
  },
};

// ============================================
// PRICING FORMULAS (unchanged, thin wrappers)
// ============================================

export const PRICING_FORMULAS = {
  per_running_meter: {
    name: 'Per Running Meter/Yard',
    formula: 'totalCost = linearMeters × pricePerMeter',
    calculate: (linearMeters: number, pricePerMeter: number): number => {
      return linearMeters * pricePerMeter;
    },
  },
  per_sqm: {
    name: 'Per Square Meter',
    formula: 'totalCost = sqm × pricePerSqm',
    calculate: (sqm: number, pricePerSqm: number): number => {
      return sqm * pricePerSqm;
    },
  },
  per_drop: {
    name: 'Per Drop Height',
    formula: 'totalCost = matchingDropRange.price × quantity',
    calculate: (
      dropCm: number,
      dropRanges: Array<{ minDrop: number; maxDrop: number; price: number }>,
      quantity: number = 1
    ): number => {
      const matchingRange = dropRanges.find(
        (range) => dropCm >= range.minDrop && dropCm <= range.maxDrop
      );
      return matchingRange ? matchingRange.price * quantity : 0;
    },
  },
  pricing_grid: {
    name: 'Pricing Grid (Width × Drop)',
    formula: 'totalCost = grid[width][drop]',
    description: 'Grid dimensions should be in CM, lookup finds closest match',
  },
};

// ============================================
// HELPER: Get formula by category
// ============================================

export const getFormulasByCategory = (category: string) => {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes('blind') || categoryLower.includes('shade')) {
    return {
      type: 'sqm' as const,
      formula: BLIND_FORMULA,
    };
  }

  if (
    categoryLower.includes('curtain') ||
    categoryLower.includes('drape') ||
    categoryLower.includes('roman')
  ) {
    return {
      type: 'linear' as const,
      verticalFormula: CURTAIN_VERTICAL_FORMULA,
      horizontalFormula: CURTAIN_HORIZONTAL_FORMULA,
    };
  }

  throw new Error(
    `Unknown treatment category: ${category}. Cannot determine formula type.`
  );
};

export const findApplicableFormula = (
  treatmentCategory: string,
  orientation: 'vertical' | 'horizontal' = 'vertical'
) => {
  const formulas = getFormulasByCategory(treatmentCategory);

  if (formulas.type === 'linear') {
    return orientation === 'horizontal'
      ? formulas.horizontalFormula
      : formulas.verticalFormula;
  }

  return formulas.formula;
};
