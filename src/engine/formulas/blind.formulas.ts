/**
 * BLIND CALCULATION FORMULAS
 * ==========================
 *
 * SINGLE SOURCE OF TRUTH for all blind/shade area calculations.
 * Pure functions - no React, no Supabase, no side effects.
 *
 * Covers:
 * - Roller blinds
 * - Zebra/dual blinds
 * - Venetian blinds (aluminium/wood slats)
 * - Vertical blinds (louvers)
 * - Cellular/honeycomb blinds
 * - Panel glide
 * - Awnings
 *
 * AREA (SQM) FORMULA:
 *
 *   1. Effective Width:
 *      effectiveWidth = railWidth + (sideHem * 2)
 *
 *   2. Effective Height:
 *      effectiveHeight = drop + headerHem + bottomHem
 *
 *   3. Square Meters:
 *      sqm = (effectiveWidth / 100) * (effectiveHeight / 100)
 *
 *   4. With Waste:
 *      sqmWithWaste = sqm * (1 + wastePercent / 100)
 *
 * VENETIAN BLINDS - Slat Stack (quote-critical):
 *
 *   stackHeight = stackFactor * drop + headrailAllowance
 *   (State whether stack blocks part of glazing when raised)
 *
 * VERTICAL BLINDS - Louver Count:
 *
 *   louverCount = ceil(trackWidth / (louverWidth * overlapFactor))
 *
 * INPUT UNITS: All inputs in CENTIMETERS (CM).
 * OUTPUT UNITS: Square meters (SQM) for area, centimeters (CM) for dimensions.
 *
 * DO NOT MODIFY without updating unit tests and ALGORITHM_VERSION.
 */

import {
  roundTo,
  applyWaste,
  assertPositive,
  assertNonNegative,
  type FormulaStep,
  type FormulaBreakdown,
  step,
} from './common.formulas';

// ============================================================
// Input / Output Types
// ============================================================

export interface BlindInput {
  /** Rail/track width in CM */
  railWidthCm: number;
  /** Drop/height in CM */
  dropCm: number;
  /** Header/top hem allowance in CM */
  headerHemCm: number;
  /** Bottom hem allowance in CM */
  bottomHemCm: number;
  /** Side hem allowance PER SIDE in CM */
  sideHemCm: number;
  /** Waste percentage (e.g. 5 = 5%) */
  wastePercent: number;
}

export interface BlindResult {
  /** Square meters (with waste) */
  sqm: number;
  /** Square meters (before waste) */
  sqmRaw: number;
  /** Effective width including side hems in CM */
  effectiveWidthCm: number;
  /** Effective height including header + bottom hems in CM */
  effectiveHeightCm: number;
  /** Formula breakdown for transparency/debugging */
  breakdown: FormulaBreakdown;
}

// ============================================================
// Venetian-specific Types
// ============================================================

export interface VenetianInput extends BlindInput {
  /** Slat width in MM */
  slatWidthMm: number;
  /** Stack factor (multiplier for stack height calculation) */
  stackFactor?: number;
  /** Headrail allowance in CM */
  headrailAllowanceCm?: number;
}

export interface VenetianResult extends BlindResult {
  /** Approximate slat stack height when fully raised (CM) */
  stackHeightCm: number;
}

// ============================================================
// Vertical Blind-specific Types
// ============================================================

export interface VerticalBlindInput extends BlindInput {
  /** Louver/vane width in CM */
  louverWidthCm: number;
  /** Overlap factor (spacing between louvers, typically 0.85-0.95) */
  overlapFactor?: number;
}

export interface VerticalBlindResult extends BlindResult {
  /** Number of louvers/vanes required */
  louverCount: number;
}

// ============================================================
// Validation
// ============================================================

function validateBlindInput(input: BlindInput): void {
  assertPositive(input.railWidthCm, 'railWidthCm');
  assertPositive(input.dropCm, 'dropCm');
  assertNonNegative(input.headerHemCm, 'headerHemCm');
  assertNonNegative(input.bottomHemCm, 'bottomHemCm');
  assertNonNegative(input.sideHemCm, 'sideHemCm');
  assertNonNegative(input.wastePercent, 'wastePercent');
}

// ============================================================
// Standard Blind SQM Calculation
// ============================================================

/**
 * Calculate square meters for a standard blind/shade.
 * Applies to: roller, zebra, cellular, panel glide, awning.
 */
export function calculateBlindSqm(input: BlindInput): BlindResult {
  validateBlindInput(input);

  const steps: FormulaStep[] = [];
  const values: Record<string, number> = {};

  // Step 1: Effective width
  const effectiveWidthCm = input.railWidthCm + (input.sideHemCm * 2);
  values.effectiveWidthCm = effectiveWidthCm;
  steps.push(step(
    'Effective width',
    `${input.railWidthCm} + (${input.sideHemCm} x 2 sides)`,
    effectiveWidthCm, 'cm'
  ));

  // Step 2: Effective height
  const effectiveHeightCm = input.dropCm + input.headerHemCm + input.bottomHemCm;
  values.effectiveHeightCm = effectiveHeightCm;
  steps.push(step(
    'Effective height',
    `${input.dropCm} + ${input.headerHemCm} (header) + ${input.bottomHemCm} (bottom)`,
    effectiveHeightCm, 'cm'
  ));

  // Step 3: SQM
  const sqmRaw = (effectiveWidthCm / 100) * (effectiveHeightCm / 100);
  values.sqmRaw = roundTo(sqmRaw, 4);
  steps.push(step(
    'Area',
    `(${effectiveWidthCm}/100) x (${effectiveHeightCm}/100)`,
    roundTo(sqmRaw, 2), 'sqm'
  ));

  // Step 4: Apply waste
  const sqm = roundTo(applyWaste(sqmRaw, input.wastePercent), 2);
  values.sqm = sqm;
  if (input.wastePercent > 0) {
    steps.push(step(
      'With waste',
      `${roundTo(sqmRaw, 2)} x (1 + ${input.wastePercent}%)`,
      sqm, 'sqm'
    ));
  }

  return {
    sqm,
    sqmRaw: roundTo(sqmRaw, 4),
    effectiveWidthCm,
    effectiveHeightCm,
    breakdown: {
      steps,
      values,
      summary: `(${effectiveWidthCm}cm x ${effectiveHeightCm}cm) / 10000 = ${sqm} sqm`,
    },
  };
}

// ============================================================
// Venetian Blind Calculation
// ============================================================

/**
 * Calculate venetian blind area with slat stack height.
 *
 * Stack height is quote-critical: it determines how much of the
 * window glazing is blocked when the blind is fully raised.
 */
export function calculateVenetianBlind(input: VenetianInput): VenetianResult {
  const baseResult = calculateBlindSqm(input);

  const stackFactor = input.stackFactor ?? 0.07; // typical for 25mm slats
  const headrailAllowanceCm = input.headrailAllowanceCm ?? 5;
  const stackHeightCm = roundTo(
    (stackFactor * input.dropCm) + headrailAllowanceCm,
    1
  );

  // Add stack height to breakdown
  baseResult.breakdown.steps.push(step(
    'Slat stack height (when raised)',
    `${stackFactor} x ${input.dropCm} + ${headrailAllowanceCm} headrail`,
    stackHeightCm, 'cm'
  ));
  baseResult.breakdown.values.stackHeightCm = stackHeightCm;

  return {
    ...baseResult,
    stackHeightCm,
  };
}

// ============================================================
// Vertical Blind Calculation
// ============================================================

/**
 * Calculate vertical blind area with louver count.
 *
 * Formula:
 *   louverCount = ceil(trackWidth / (louverWidth * overlapFactor))
 *
 * The overlap factor accounts for louver spacing:
 * - 0.89 for 89mm louvers (standard)
 * - 0.127 for 127mm louvers (standard)
 */
export function calculateVerticalBlind(input: VerticalBlindInput): VerticalBlindResult {
  const baseResult = calculateBlindSqm(input);

  assertPositive(input.louverWidthCm, 'louverWidthCm');
  const overlapFactor = input.overlapFactor ?? 1.0;
  const louverCount = Math.ceil(
    input.railWidthCm / (input.louverWidthCm * overlapFactor)
  );

  // Add louver count to breakdown
  baseResult.breakdown.steps.push(step(
    'Louver count',
    `ceil(${input.railWidthCm} / (${input.louverWidthCm} x ${overlapFactor}))`,
    louverCount, 'louvers'
  ));
  baseResult.breakdown.values.louverCount = louverCount;

  return {
    ...baseResult,
    louverCount,
  };
}
