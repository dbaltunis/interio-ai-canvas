/**
 * SHUTTER CALCULATION FORMULAS
 * ============================
 *
 * SINGLE SOURCE OF TRUTH for all shutter/plantation shutter calculations.
 * Pure functions - no React, no Supabase, no side effects.
 *
 * Shutters are area-based products with additional panel/louvre calculations.
 *
 * AREA FORMULA (same as blinds):
 *   effectiveWidth = recessWidth + (sideHem * 2)
 *   effectiveHeight = recessHeight + headerHem + bottomHem
 *   sqm = (effectiveWidth / 100) * (effectiveHeight / 100)
 *
 * PANEL CONFIGURATION:
 *   For bi-fold and sliding shutters, panels are determined by:
 *   - Recess width / preferred panel width
 *   - T-post positions
 *   - Minimum/maximum panel width constraints
 *
 * ORDER SIZE (inside mount):
 *   orderWidth = min(topWidth, middleWidth, bottomWidth) - widthDeduction
 *   orderHeight = min(leftHeight, middleHeight, rightHeight) - heightDeduction
 *   (Use the SMALLEST measurement to ensure fit)
 *
 * PRICING:
 *   Shutters typically use GRID pricing (width x height lookup).
 *   Adders: T-posts, divider rails, custom shapes, motorisation.
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

export interface ShutterInput {
  /** Recess or finished width in CM */
  widthCm: number;
  /** Recess or finished height in CM */
  heightCm: number;
  /** Side clearance/deduction PER SIDE in CM */
  sideClearanceCm: number;
  /** Top clearance/deduction in CM */
  topClearanceCm: number;
  /** Bottom clearance/deduction in CM */
  bottomClearanceCm: number;
  /** Waste percentage (e.g. 5 = 5%) */
  wastePercent: number;
}

export interface ShutterResult {
  /** Square meters (with waste) */
  sqm: number;
  /** Square meters (before waste) */
  sqmRaw: number;
  /** Order width (after deductions) in CM */
  orderWidthCm: number;
  /** Order height (after deductions) in CM */
  orderHeightCm: number;
  /** Formula breakdown for transparency/debugging */
  breakdown: FormulaBreakdown;
}

// ============================================================
// Panel Configuration Types
// ============================================================

export interface ShutterPanelInput {
  /** Total opening width in CM */
  openingWidthCm: number;
  /** Preferred panel width in CM (manufacturer default, typically 40-60cm) */
  preferredPanelWidthCm: number;
  /** Minimum panel width in CM (manufacturer constraint) */
  minPanelWidthCm: number;
  /** Maximum panel width in CM (manufacturer constraint) */
  maxPanelWidthCm: number;
  /** Configuration type */
  configuration: 'bi-fold' | 'sliding' | 'hinged' | 'fixed';
}

export interface ShutterPanelResult {
  /** Number of panels */
  panelCount: number;
  /** Width of each panel in CM */
  panelWidthCm: number;
  /** Number of T-posts (dividers between panel pairs) */
  tPostCount: number;
}

// ============================================================
// Validation
// ============================================================

function validateShutterInput(input: ShutterInput): void {
  assertPositive(input.widthCm, 'widthCm');
  assertPositive(input.heightCm, 'heightCm');
  assertNonNegative(input.sideClearanceCm, 'sideClearanceCm');
  assertNonNegative(input.topClearanceCm, 'topClearanceCm');
  assertNonNegative(input.bottomClearanceCm, 'bottomClearanceCm');
  assertNonNegative(input.wastePercent, 'wastePercent');
}

// ============================================================
// Shutter Area Calculation
// ============================================================

/**
 * Calculate shutter area (sqm) for pricing.
 *
 * Shutters use the ORDER SIZE (after deductions) for area calculation,
 * not the raw recess measurements.
 */
export function calculateShutterArea(input: ShutterInput): ShutterResult {
  validateShutterInput(input);

  const steps: FormulaStep[] = [];
  const values: Record<string, number> = {};

  // Step 1: Order width (recess - deductions)
  const orderWidthCm = input.widthCm - (input.sideClearanceCm * 2);
  values.orderWidthCm = orderWidthCm;
  steps.push(step(
    'Order width',
    `${input.widthCm} - (${input.sideClearanceCm} x 2 sides)`,
    orderWidthCm, 'cm'
  ));

  // Step 2: Order height
  const orderHeightCm = input.heightCm - input.topClearanceCm - input.bottomClearanceCm;
  values.orderHeightCm = orderHeightCm;
  steps.push(step(
    'Order height',
    `${input.heightCm} - ${input.topClearanceCm} (top) - ${input.bottomClearanceCm} (bottom)`,
    orderHeightCm, 'cm'
  ));

  // Step 3: SQM
  const sqmRaw = (orderWidthCm / 100) * (orderHeightCm / 100);
  values.sqmRaw = roundTo(sqmRaw, 4);
  steps.push(step(
    'Area',
    `(${orderWidthCm}/100) x (${orderHeightCm}/100)`,
    roundTo(sqmRaw, 2), 'sqm'
  ));

  // Step 4: Waste
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
    orderWidthCm,
    orderHeightCm,
    breakdown: {
      steps,
      values,
      summary: `(${orderWidthCm}cm x ${orderHeightCm}cm) / 10000 = ${sqm} sqm`,
    },
  };
}

// ============================================================
// Panel Configuration
// ============================================================

/**
 * Calculate optimal panel configuration for bi-fold/sliding shutters.
 *
 * Rules:
 * - Even number of panels for bi-fold (pairs fold together)
 * - Panel width must be within manufacturer min/max constraints
 * - T-posts placed between panel pairs for bi-fold
 */
export function calculateShutterPanels(input: ShutterPanelInput): ShutterPanelResult {
  assertPositive(input.openingWidthCm, 'openingWidthCm');
  assertPositive(input.preferredPanelWidthCm, 'preferredPanelWidthCm');

  // Calculate ideal panel count
  let panelCount = Math.round(input.openingWidthCm / input.preferredPanelWidthCm);
  panelCount = Math.max(1, panelCount); // At least 1 panel

  // For bi-fold, ensure even number
  if (input.configuration === 'bi-fold' && panelCount % 2 !== 0) {
    panelCount += 1;
  }

  // Calculate actual panel width
  let panelWidthCm = input.openingWidthCm / panelCount;

  // Enforce min/max constraints
  if (panelWidthCm < input.minPanelWidthCm && panelCount > 1) {
    panelCount -= (input.configuration === 'bi-fold' ? 2 : 1);
    panelCount = Math.max(1, panelCount);
    panelWidthCm = input.openingWidthCm / panelCount;
  }

  if (panelWidthCm > input.maxPanelWidthCm) {
    panelCount += (input.configuration === 'bi-fold' ? 2 : 1);
    panelWidthCm = input.openingWidthCm / panelCount;
  }

  // T-posts: one between each pair for bi-fold, none for others
  const tPostCount = input.configuration === 'bi-fold'
    ? Math.max(0, Math.floor(panelCount / 2) - 1)
    : 0;

  return {
    panelCount,
    panelWidthCm: roundTo(panelWidthCm, 1),
    tPostCount,
  };
}
