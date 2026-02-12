/**
 * COMMON CALCULATION FORMULAS
 * ===========================
 *
 * Shared utilities used by ALL product-specific formulas.
 * Pure functions - no React, no Supabase, no side effects.
 *
 * UNIT STANDARDS:
 * - Database stores: MILLIMETERS (MM)
 * - Templates store: CENTIMETERS (CM)
 * - Fabric widths: CENTIMETERS (CM)
 * - Calculations use: CENTIMETERS (CM) internally
 * - Output: METERS (M) for linear, SQM for area
 *
 * DO NOT MODIFY these formulas without updating:
 * 1. The corresponding unit tests in __tests__/
 * 2. The formula documentation comments
 * 3. The ALGORITHM_VERSION in algorithms/index.ts
 */

// ============================================================
// Unit Conversion (pure, no external deps)
// ============================================================

/** Convert millimeters to centimeters */
export function mmToCm(mm: number): number {
  return mm / 10;
}

/** Convert centimeters to millimeters */
export function cmToMm(cm: number): number {
  return cm * 10;
}

/** Convert centimeters to meters */
export function cmToM(cm: number): number {
  return cm / 100;
}

/** Convert meters to centimeters */
export function mToCm(m: number): number {
  return m * 100;
}

/** Round to specified decimal places */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ============================================================
// Waste Calculation
// ============================================================

/**
 * Apply waste percentage to a quantity.
 *
 * Formula:
 *   result = quantity * (1 + wastePercent / 100)
 *
 * @param quantity   - The raw quantity (meters, sqm, etc.)
 * @param wastePercent - Waste percentage (e.g. 5 = 5%). Default 0.
 * @returns The quantity with waste added
 */
export function applyWaste(quantity: number, wastePercent: number = 0): number {
  if (wastePercent <= 0) return quantity;
  return quantity * (1 + wastePercent / 100);
}

// ============================================================
// Seam Calculation
// ============================================================

/**
 * Calculate number of seams when joining fabric widths.
 *
 * Rule: seams = max(0, widths - 1)
 * Example: 3 widths joined = 2 seams
 *
 * @param widthsRequired - Number of fabric widths being joined
 * @returns Number of seams
 */
export function calculateSeamCount(widthsRequired: number): number {
  return Math.max(0, widthsRequired - 1);
}

/**
 * Calculate total seam allowance in centimeters.
 *
 * IMPORTANT: seamHemCm is the TOTAL allowance per join (not per side).
 * For example, if each side of a seam needs 1.5cm, set seamHemCm = 3.
 * This matches the CalculationEngine convention.
 *
 * Formula:
 *   totalSeamAllowance = seamCount * seamHemCm
 *
 * @param seamCount  - Number of seams (from calculateSeamCount)
 * @param seamHemCm  - Total fabric consumed per seam join in CM
 * @returns Total seam allowance in CM
 */
export function calculateSeamAllowance(seamCount: number, seamHemCm: number): number {
  return seamCount * seamHemCm;
}

// ============================================================
// Pattern Repeat
// ============================================================

/**
 * Adjust a measurement to align with pattern repeat.
 *
 * Formula:
 *   adjusted = ceil(measurement / repeat) * repeat
 *
 * Used for CUTTING GUIDANCE ONLY. Pattern repeat adjustments
 * affect how you cut the fabric, but the pricing calculation
 * should use the raw (non-repeat-adjusted) values.
 *
 * @param measurementCm - The raw measurement in CM
 * @param repeatCm      - Pattern repeat interval in CM (0 = no repeat)
 * @returns The adjusted measurement, rounded up to next full repeat
 */
export function alignToPatternRepeat(measurementCm: number, repeatCm: number): number {
  if (repeatCm <= 0) return measurementCm;
  return Math.ceil(measurementCm / repeatCm) * repeatCm;
}

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Assert that a value is a positive number.
 * @throws Error if value is not positive
 */
export function assertPositive(value: number, name: string): void {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    throw new Error(`${name} must be a positive number, got: ${value}`);
  }
}

/**
 * Assert that a value is a non-negative number (zero allowed).
 * @throws Error if value is negative
 */
export function assertNonNegative(value: number, name: string): void {
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    throw new Error(`${name} must be non-negative, got: ${value}`);
  }
}

// ============================================================
// Formula Step Builder (for transparency/debugging)
// ============================================================

export interface FormulaStep {
  label: string;
  formula: string;
  result: number;
  unit: string;
}

export interface FormulaBreakdown {
  steps: FormulaStep[];
  values: Record<string, number>;
  summary: string;
}

/**
 * Create a formula step for audit trail / transparency.
 */
export function step(label: string, formula: string, result: number, unit: string): FormulaStep {
  return { label, formula, result, unit };
}
