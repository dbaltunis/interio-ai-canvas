/**
 * INTERIO CALCULATION FORMULAS
 * ============================
 *
 * THIS FOLDER IS THE SINGLE SOURCE OF TRUTH for all measurement,
 * fabric, area, and pricing calculations in the application.
 *
 * RULES:
 * 1. All calculation logic lives HERE and ONLY here.
 * 2. CalculationEngine.ts calls these formulas.
 * 3. Legacy code paths (orientationCalculator, useFabricCalculator) call these formulas.
 * 4. UI components NEVER contain calculation logic - they import from here.
 * 5. Every formula is a PURE FUNCTION - no React, no Supabase, no side effects.
 * 6. Every formula has unit tests in __tests__/.
 * 7. DO NOT MODIFY formulas without updating tests and ALGORITHM_VERSION.
 *
 * FILE STRUCTURE:
 *
 *   common.formulas.ts   - Unit conversion, waste, seams, pattern repeat, validation
 *   curtain.formulas.ts  - Curtain fabric calculations (vertical + railroaded)
 *   blind.formulas.ts    - Blind/shade area calculations (roller, venetian, vertical, cellular)
 *   shutter.formulas.ts  - Shutter area and panel calculations
 *   pricing.formulas.ts  - All pricing methods, markup, margin calculations
 *   __tests__/           - Unit tests with real-world worked examples
 *
 * UNIT STANDARDS:
 *   Database → MM | Templates → CM | Fabric widths → CM
 *   Calculations → CM internally | Output → M (linear) or SQM (area)
 */

// Common utilities
export {
  mmToCm,
  cmToMm,
  cmToM,
  mToCm,
  roundTo,
  applyWaste,
  calculateSeamCount,
  calculateSeamAllowance,
  alignToPatternRepeat,
  assertPositive,
  assertNonNegative,
  step,
  type FormulaStep,
  type FormulaBreakdown,
} from './common.formulas';

// Curtain formulas
export {
  calculateCurtainVertical,
  calculateCurtainHorizontal,
  calculateCurtain,
  type CurtainInput,
  type CurtainResult,
} from './curtain.formulas';

// Blind formulas
export {
  calculateBlindSqm,
  calculateVenetianBlind,
  calculateVerticalBlind,
  type BlindInput,
  type BlindResult,
  type VenetianInput,
  type VenetianResult,
  type VerticalBlindInput,
  type VerticalBlindResult,
} from './blind.formulas';

// Shutter formulas
export {
  calculateShutterArea,
  calculateShutterPanels,
  type ShutterInput,
  type ShutterResult,
  type ShutterPanelInput,
  type ShutterPanelResult,
} from './shutter.formulas';

// Pricing formulas
export {
  pricePerRunningMeter,
  pricePerSqm,
  priceFixed,
  pricePerDrop,
  pricePercentage,
  lookupGridPrice,
  applyMarkup,
  calculateGrossMargin,
  calculateImpliedMarkup,
  getProfitStatus,
  type PricingGrid,
  type MarkupSource,
} from './pricing.formulas';
