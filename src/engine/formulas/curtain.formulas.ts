/**
 * CURTAIN CALCULATION FORMULAS
 * ============================
 *
 * SINGLE SOURCE OF TRUTH for all curtain fabric calculations.
 * Pure functions - no React, no Supabase, no side effects.
 *
 * Supports two fabric orientations:
 * - VERTICAL (Standard): Fabric roll runs top-to-bottom, width covers the track.
 * - HORIZONTAL (Railroaded): Fabric roll runs side-to-side, width covers the drop.
 *
 * INPUT UNITS: All inputs in CENTIMETERS (CM).
 * OUTPUT UNITS: Linear meters (M) for fabric, centimeters (CM) for dimensions.
 *
 * INDUSTRY STANDARD FORMULA (Vertical/Standard):
 *
 *   1. Total Drop:
 *      totalDrop = drop + headerHem + bottomHem + pooling
 *
 *   2. Finished Width (overlap BEFORE fullness):
 *      finishedWidth = (railWidth + overlap) * fullness
 *
 *   3. Side Hems (both sides of each panel):
 *      totalSideHems = sideHem * 2 * panelCount
 *
 *   4. Total Width:
 *      totalWidth = finishedWidth + returnLeft + returnRight + totalSideHems
 *
 *   5. Widths Required:
 *      widthsRequired = ceil(totalWidth / fabricWidth)
 *
 *   6. Seam Allowance (seamHem is TOTAL per join):
 *      seams = max(0, widthsRequired - 1)
 *      seamAllowance = seams * seamHem
 *
 *   7. Total Fabric:
 *      totalFabricCm = (widthsRequired * totalDrop) + seamAllowance
 *      linearMeters = totalFabricCm / 100
 *
 *   8. Waste:
 *      linearMetersWithWaste = linearMeters * (1 + wastePercent / 100)
 *
 * INDUSTRY STANDARD FORMULA (Horizontal/Railroaded):
 *
 *   1-4. Same as vertical
 *   5. Horizontal Pieces:
 *      pieces = ceil(totalDrop / fabricWidth)
 *   6. Seam Allowance:
 *      seams = max(0, pieces - 1)
 *      seamAllowance = seams * seamHem
 *   7. Total Fabric:
 *      totalFabricCm = (pieces * totalWidth) + seamAllowance
 *      linearMeters = totalFabricCm / 100
 *
 * Reference: See measurement guide sections 7.2-7.3 for orientation diagrams.
 *
 * DO NOT MODIFY without updating unit tests and ALGORITHM_VERSION.
 */

import {
  roundTo,
  applyWaste,
  calculateSeamCount,
  calculateSeamAllowance,
  assertPositive,
  assertNonNegative,
  type FormulaStep,
  type FormulaBreakdown,
  step,
} from './common.formulas';

// ============================================================
// Input / Output Types
// ============================================================

export interface CurtainInput {
  /** Rail/track width in CM */
  railWidthCm: number;
  /** Drop/height in CM */
  dropCm: number;
  /** Fullness multiplier (e.g. 2.0 = double fullness) */
  fullness: number;
  /** Fabric roll width in CM */
  fabricWidthCm: number;
  /** Number of panels (1 = single, 2 = pair) */
  panelCount: number;
  /** Header/top hem allowance in CM */
  headerHemCm: number;
  /** Bottom hem allowance in CM */
  bottomHemCm: number;
  /** Side hem allowance PER SIDE in CM */
  sideHemCm: number;
  /** Total seam allowance per join in CM (NOT per side) */
  seamHemCm: number;
  /** Left return in CM (wrap to wall) */
  returnLeftCm: number;
  /** Right return in CM (wrap to wall) */
  returnRightCm: number;
  /** Overlap at center meeting point in CM (added BEFORE fullness) */
  overlapCm: number;
  /** Pooling/puddle allowance in CM */
  poolingCm: number;
  /** Waste percentage (e.g. 5 = 5%) */
  wastePercent: number;
}

export interface CurtainResult {
  /** Total linear meters of fabric to order (with waste) */
  linearMeters: number;
  /** Linear meters before waste */
  linearMetersRaw: number;
  /** Number of fabric widths required */
  widthsRequired: number;
  /** Total drop including all allowances in CM */
  totalDropCm: number;
  /** Total width including fullness, returns, side hems in CM */
  totalWidthCm: number;
  /** Finished width after fullness (before returns/hems) in CM */
  finishedWidthCm: number;
  /** Number of seams between joined widths */
  seamsCount: number;
  /** Total seam allowance in CM */
  seamAllowanceCm: number;
  /** Total side hem allowance in CM */
  totalSideHemsCm: number;
  /** Total returns (left + right) in CM */
  totalReturnsCm: number;
  /** Formula breakdown for transparency/debugging */
  breakdown: FormulaBreakdown;
}

// ============================================================
// Validation
// ============================================================

function validateCurtainInput(input: CurtainInput): void {
  assertPositive(input.railWidthCm, 'railWidthCm');
  assertPositive(input.dropCm, 'dropCm');
  assertPositive(input.fullness, 'fullness');
  assertPositive(input.fabricWidthCm, 'fabricWidthCm');
  assertPositive(input.panelCount, 'panelCount');
  assertNonNegative(input.headerHemCm, 'headerHemCm');
  assertNonNegative(input.bottomHemCm, 'bottomHemCm');
  assertNonNegative(input.sideHemCm, 'sideHemCm');
  assertNonNegative(input.seamHemCm, 'seamHemCm');
  assertNonNegative(input.returnLeftCm, 'returnLeftCm');
  assertNonNegative(input.returnRightCm, 'returnRightCm');
  assertNonNegative(input.overlapCm, 'overlapCm');
  assertNonNegative(input.poolingCm, 'poolingCm');
  assertNonNegative(input.wastePercent, 'wastePercent');
}

// ============================================================
// VERTICAL (Standard Orientation)
// ============================================================

/**
 * Calculate curtain fabric for VERTICAL (standard) orientation.
 * Fabric roll runs top-to-bottom. Width of fabric covers the track width.
 * Buy length = drop direction.
 */
export function calculateCurtainVertical(input: CurtainInput): CurtainResult {
  validateCurtainInput(input);

  const steps: FormulaStep[] = [];
  const values: Record<string, number> = {};

  // Step 1: Total drop
  const totalDropCm =
    input.dropCm + input.headerHemCm + input.bottomHemCm + input.poolingCm;
  values.totalDropCm = totalDropCm;
  steps.push(step(
    'Total drop',
    `${input.dropCm} + ${input.headerHemCm} (header) + ${input.bottomHemCm} (bottom) + ${input.poolingCm} (pooling)`,
    totalDropCm, 'cm'
  ));

  // Step 2: Finished width (overlap BEFORE fullness - industry standard)
  const finishedWidthCm = (input.railWidthCm + input.overlapCm) * input.fullness;
  values.finishedWidthCm = finishedWidthCm;
  steps.push(step(
    'Finished width',
    `(${input.railWidthCm} rail + ${input.overlapCm} overlap) x ${input.fullness} fullness`,
    finishedWidthCm, 'cm'
  ));

  // Step 3: Side hems (both sides of each panel)
  const totalSideHemsCm = input.sideHemCm * 2 * input.panelCount;
  values.totalSideHemsCm = totalSideHemsCm;
  steps.push(step(
    'Total side hems',
    `${input.sideHemCm} x 2 sides x ${input.panelCount} panel(s)`,
    totalSideHemsCm, 'cm'
  ));

  // Step 4: Returns
  const totalReturnsCm = input.returnLeftCm + input.returnRightCm;
  values.totalReturnsCm = totalReturnsCm;

  // Step 5: Total width
  const totalWidthCm = finishedWidthCm + totalReturnsCm + totalSideHemsCm;
  values.totalWidthCm = totalWidthCm;
  steps.push(step(
    'Total width',
    `${finishedWidthCm} (finished) + ${totalReturnsCm} (returns) + ${totalSideHemsCm} (side hems)`,
    totalWidthCm, 'cm'
  ));

  // Step 6: Widths required
  const widthsRequired = Math.ceil(totalWidthCm / input.fabricWidthCm);
  values.widthsRequired = widthsRequired;
  steps.push(step(
    'Widths required',
    `ceil(${totalWidthCm} / ${input.fabricWidthCm})`,
    widthsRequired, 'widths'
  ));

  // Step 7: Seam allowance
  const seamsCount = calculateSeamCount(widthsRequired);
  const seamAllowanceCm = calculateSeamAllowance(seamsCount, input.seamHemCm);
  values.seamsCount = seamsCount;
  values.seamAllowanceCm = seamAllowanceCm;
  steps.push(step(
    'Seam allowance',
    `${seamsCount} seam(s) x ${input.seamHemCm} cm/seam`,
    seamAllowanceCm, 'cm'
  ));

  // Step 8: Total fabric
  const totalFabricCm = (widthsRequired * totalDropCm) + seamAllowanceCm;
  const linearMetersRaw = totalFabricCm / 100;
  values.linearMetersRaw = roundTo(linearMetersRaw, 2);
  steps.push(step(
    'Total fabric',
    `(${widthsRequired} widths x ${totalDropCm} cm drop) + ${seamAllowanceCm} cm seams`,
    roundTo(linearMetersRaw, 2), 'm'
  ));

  // Step 9: Apply waste
  const linearMeters = roundTo(applyWaste(linearMetersRaw, input.wastePercent), 2);
  values.linearMeters = linearMeters;
  if (input.wastePercent > 0) {
    steps.push(step(
      'With waste',
      `${roundTo(linearMetersRaw, 2)} x (1 + ${input.wastePercent}%)`,
      linearMeters, 'm'
    ));
  }

  return {
    linearMeters,
    linearMetersRaw: roundTo(linearMetersRaw, 2),
    widthsRequired,
    totalDropCm,
    totalWidthCm,
    finishedWidthCm,
    seamsCount,
    seamAllowanceCm,
    totalSideHemsCm,
    totalReturnsCm,
    breakdown: {
      steps,
      values,
      summary: `VERTICAL: ${widthsRequired} width(s) x ${roundTo(totalDropCm, 0)}cm + ${roundTo(seamAllowanceCm, 0)}cm seams = ${linearMeters}m`,
    },
  };
}

// ============================================================
// HORIZONTAL (Railroaded Orientation)
// ============================================================

/**
 * Calculate curtain fabric for HORIZONTAL (railroaded) orientation.
 * Fabric roll runs side-to-side (rotated 90 degrees).
 * Fabric width covers the drop. Buy length = width direction.
 */
export function calculateCurtainHorizontal(input: CurtainInput): CurtainResult {
  validateCurtainInput(input);

  const steps: FormulaStep[] = [];
  const values: Record<string, number> = {};

  // Step 1: Total drop
  const totalDropCm =
    input.dropCm + input.headerHemCm + input.bottomHemCm + input.poolingCm;
  values.totalDropCm = totalDropCm;
  steps.push(step(
    'Total drop',
    `${input.dropCm} + ${input.headerHemCm} (header) + ${input.bottomHemCm} (bottom) + ${input.poolingCm} (pooling)`,
    totalDropCm, 'cm'
  ));

  // Step 2: Finished width (overlap BEFORE fullness)
  const finishedWidthCm = (input.railWidthCm + input.overlapCm) * input.fullness;
  values.finishedWidthCm = finishedWidthCm;
  steps.push(step(
    'Finished width',
    `(${input.railWidthCm} rail + ${input.overlapCm} overlap) x ${input.fullness} fullness`,
    finishedWidthCm, 'cm'
  ));

  // Step 3: Side hems (both sides of each panel)
  const totalSideHemsCm = input.sideHemCm * 2 * input.panelCount;
  values.totalSideHemsCm = totalSideHemsCm;

  // Step 4: Returns
  const totalReturnsCm = input.returnLeftCm + input.returnRightCm;
  values.totalReturnsCm = totalReturnsCm;

  // Step 5: Total width
  const totalWidthCm = finishedWidthCm + totalReturnsCm + totalSideHemsCm;
  values.totalWidthCm = totalWidthCm;
  steps.push(step(
    'Total width',
    `${finishedWidthCm} (finished) + ${totalReturnsCm} (returns) + ${totalSideHemsCm} (side hems)`,
    totalWidthCm, 'cm'
  ));

  // Step 6: Horizontal pieces (drop split across fabric widths)
  const horizontalPieces = Math.ceil(totalDropCm / input.fabricWidthCm);
  values.horizontalPieces = horizontalPieces;
  steps.push(step(
    'Horizontal pieces',
    `ceil(${totalDropCm} drop / ${input.fabricWidthCm} fabric width)`,
    horizontalPieces, 'pieces'
  ));

  // Step 7: Seam allowance
  const seamsCount = calculateSeamCount(horizontalPieces);
  const seamAllowanceCm = calculateSeamAllowance(seamsCount, input.seamHemCm);
  values.seamsCount = seamsCount;
  values.seamAllowanceCm = seamAllowanceCm;
  steps.push(step(
    'Seam allowance',
    `${seamsCount} seam(s) x ${input.seamHemCm} cm/seam`,
    seamAllowanceCm, 'cm'
  ));

  // Step 8: Total fabric
  const totalFabricCm = (horizontalPieces * totalWidthCm) + seamAllowanceCm;
  const linearMetersRaw = totalFabricCm / 100;
  values.linearMetersRaw = roundTo(linearMetersRaw, 2);
  steps.push(step(
    'Total fabric',
    `(${horizontalPieces} pieces x ${totalWidthCm} cm width) + ${seamAllowanceCm} cm seams`,
    roundTo(linearMetersRaw, 2), 'm'
  ));

  // Step 9: Apply waste
  const linearMeters = roundTo(applyWaste(linearMetersRaw, input.wastePercent), 2);
  values.linearMeters = linearMeters;
  if (input.wastePercent > 0) {
    steps.push(step(
      'With waste',
      `${roundTo(linearMetersRaw, 2)} x (1 + ${input.wastePercent}%)`,
      linearMeters, 'm'
    ));
  }

  return {
    linearMeters,
    linearMetersRaw: roundTo(linearMetersRaw, 2),
    widthsRequired: horizontalPieces,
    totalDropCm,
    totalWidthCm,
    finishedWidthCm,
    seamsCount,
    seamAllowanceCm,
    totalSideHemsCm,
    totalReturnsCm,
    breakdown: {
      steps,
      values,
      summary: `RAILROADED: ${horizontalPieces} piece(s) x ${roundTo(totalWidthCm, 0)}cm + ${roundTo(seamAllowanceCm, 0)}cm seams = ${linearMeters}m`,
    },
  };
}

// ============================================================
// Convenience: Auto-select orientation
// ============================================================

/**
 * Calculate curtain fabric for the given orientation.
 */
export function calculateCurtain(
  orientation: 'vertical' | 'horizontal',
  input: CurtainInput
): CurtainResult {
  return orientation === 'horizontal'
    ? calculateCurtainHorizontal(input)
    : calculateCurtainVertical(input);
}
