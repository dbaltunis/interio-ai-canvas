/**
 * CENTRALIZED MEASUREMENT BOUNDARY UTILITIES
 * 
 * This is the SINGLE SOURCE OF TRUTH for unit conversions in the application.
 * 
 * GOLDEN RULE:
 * - Database stores MILLIMETERS (MM)
 * - All internal calculations use MM or CM (fabric industry standard)
 * - Conversion to/from user's preferred unit happens ONLY at boundaries
 * 
 * BOUNDARY DEFINITIONS:
 * - INPUT BOUNDARY: When user enters a value → convert TO internal unit immediately
 * - OUTPUT BOUNDARY: When displaying to user → convert FROM internal unit
 * - CALCULATION BOUNDARY: When passing to fabric calculator → ensure CM
 * 
 * DO NOT:
 * - Convert units in the middle of calculations
 * - Assume what unit a value is in - always be explicit
 * - Use hardcoded conversion factors outside this file
 */

// Note: Using local conversion factors instead of importing to avoid circular dependencies
// This file is the SINGLE SOURCE OF TRUTH for unit conversions

// Unified type for length units
export type LengthUnit = 'mm' | 'cm' | 'm' | 'inches' | 'feet' | 'yards';

// ============= CONVERSION FACTORS =============

const MM_PER_UNIT: Record<string, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  inches: 25.4,
  in: 25.4,
  feet: 304.8,
  ft: 304.8,
  yards: 914.4,
  yd: 914.4,
};

const CM_PER_UNIT: Record<string, number> = {
  mm: 0.1,
  cm: 1,
  m: 100,
  inches: 2.54,
  in: 2.54,
  feet: 30.48,
  ft: 30.48,
  yards: 91.44,
  yd: 91.44,
};

// ============= CORE CONVERSION FUNCTIONS =============

/**
 * Convert any unit to millimeters (database standard)
 * Use this when SAVING to database or when internal MM is required
 */
export function toMM(value: number, fromUnit: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('[measurementBoundary] Invalid value for toMM:', value);
    return 0;
  }
  const factor = MM_PER_UNIT[fromUnit.toLowerCase()];
  if (!factor) {
    console.error('[measurementBoundary] Unknown unit for toMM:', fromUnit);
    return value; // Return as-is to avoid data loss
  }
  return value * factor;
}

/**
 * Convert millimeters to any unit
 * Use this when DISPLAYING to user or when converting from database
 */
export function fromMM(valueMM: number, toUnit: string): number {
  if (typeof valueMM !== 'number' || isNaN(valueMM)) {
    console.warn('[measurementBoundary] Invalid value for fromMM:', valueMM);
    return 0;
  }
  const factor = MM_PER_UNIT[toUnit.toLowerCase()];
  if (!factor) {
    console.error('[measurementBoundary] Unknown unit for fromMM:', toUnit);
    return valueMM; // Return as-is
  }
  return valueMM / factor;
}

/**
 * Convert any unit to centimeters (fabric calculation standard)
 * Use this when passing to fabric calculations
 */
export function toCM(value: number, fromUnit: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('[measurementBoundary] Invalid value for toCM:', value);
    return 0;
  }
  const factor = CM_PER_UNIT[fromUnit.toLowerCase()];
  if (!factor) {
    console.error('[measurementBoundary] Unknown unit for toCM:', fromUnit);
    return value;
  }
  return value * factor;
}

/**
 * Convert centimeters to any unit
 * Use this when converting fabric calculation results to display
 */
export function fromCM(valueCM: number, toUnit: string): number {
  if (typeof valueCM !== 'number' || isNaN(valueCM)) {
    console.warn('[measurementBoundary] Invalid value for fromCM:', valueCM);
    return 0;
  }
  const factor = CM_PER_UNIT[toUnit.toLowerCase()];
  if (!factor) {
    console.error('[measurementBoundary] Unknown unit for fromCM:', toUnit);
    return valueCM;
  }
  return valueCM / factor;
}

/**
 * Convert between any two units
 * This is a convenience function that goes through MM as intermediate
 */
export function convertUnits(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) return value;
  const mm = toMM(value, fromUnit);
  return fromMM(mm, toUnit);
}

// ============= INPUT BOUNDARY HELPERS =============

/**
 * Convert user input (in user's preferred unit) to CM for fabric calculations
 * CALL THIS ONCE at the input boundary, before passing to any calculator
 * 
 * @param userValue - The raw numeric value from user input
 * @param userUnit - The user's preferred display unit (from useMeasurementUnits)
 * @returns The value in centimeters
 */
export function userInputToCM(userValue: number, userUnit: string): number {
  const result = toCM(userValue, userUnit);
  console.log('[measurementBoundary] userInputToCM:', { userValue, userUnit, resultCM: result });
  return result;
}

/**
 * Convert user input (in user's preferred unit) to MM for database storage
 * CALL THIS ONCE when saving to database
 * 
 * @param userValue - The raw numeric value from user input
 * @param userUnit - The user's preferred display unit
 * @returns The value in millimeters
 */
export function userInputToMM(userValue: number, userUnit: string): number {
  const result = toMM(userValue, userUnit);
  console.log('[measurementBoundary] userInputToMM:', { userValue, userUnit, resultMM: result });
  return result;
}

// ============= OUTPUT BOUNDARY HELPERS =============

/**
 * Convert internal MM value to user's display unit
 * CALL THIS ONLY at display boundaries (UI components)
 * 
 * @param internalMM - The value in millimeters (from database)
 * @param displayUnit - The user's preferred display unit
 * @returns The value in the user's unit
 */
export function mmToDisplay(internalMM: number, displayUnit: string): number {
  return fromMM(internalMM, displayUnit);
}

/**
 * Convert internal CM value to user's display unit
 * CALL THIS ONLY at display boundaries for fabric calculation results
 * 
 * @param internalCM - The value in centimeters (from fabric calculator)
 * @param displayUnit - The user's preferred display unit
 * @returns The value in the user's unit
 */
export function cmToDisplay(internalCM: number, displayUnit: string): number {
  return fromCM(internalCM, displayUnit);
}

// ============= FORMATTING HELPERS =============

const UNIT_LABELS: Record<string, string> = {
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  inches: 'in',
  in: 'in',
  feet: 'ft',
  ft: 'ft',
  yards: 'yd',
  yd: 'yd',
};

/**
 * Format a measurement value with its unit label
 */
export function formatWithUnit(value: number, unit: string, decimals: number = 1): string {
  const label = UNIT_LABELS[unit.toLowerCase()] || unit;
  return `${value.toFixed(decimals)}${label}`;
}

/**
 * Format MM value to user's display unit with label
 */
export function formatFromMM(valueMM: number, displayUnit: string, decimals: number = 1): string {
  const converted = fromMM(valueMM, displayUnit);
  return formatWithUnit(converted, displayUnit, decimals);
}

/**
 * Format CM value to user's display unit with label
 */
export function formatFromCM(valueCM: number, displayUnit: string, decimals: number = 1): string {
  const converted = fromCM(valueCM, displayUnit);
  return formatWithUnit(converted, displayUnit, decimals);
}

// ============= VALIDATION HELPERS =============

/**
 * Check if a value looks reasonable for the given unit
 * Helps catch unit mismatch bugs during development
 */
export function validateMeasurement(value: number, unit: string, context: string): boolean {
  // Maximum reasonable window/fabric dimension in each unit
  const MAX_REASONABLE: Record<string, number> = {
    mm: 20000,    // 20 meters
    cm: 2000,     // 20 meters
    m: 20,        // 20 meters
    inches: 800,  // ~20 meters
    feet: 66,     // ~20 meters
    yards: 22,    // ~20 meters
  };
  
  const max = MAX_REASONABLE[unit.toLowerCase()];
  if (max && value > max) {
    console.warn(`[measurementBoundary] ${context}: Value ${value}${unit} seems too large. Possible unit mismatch?`);
    return false;
  }
  
  if (value < 0) {
    console.warn(`[measurementBoundary] ${context}: Negative value ${value}${unit}`);
    return false;
  }
  
  return true;
}

// ============= FABRIC-SPECIFIC HELPERS =============

/**
 * Convert fabric width from database (assumed to be in CM) to display unit
 * Fabric widths are stored in CM in the database
 */
export function fabricWidthToDisplay(widthCM: number, displayUnit: string): number {
  return fromCM(widthCM, displayUnit);
}

/**
 * Validate fabric width value
 * Fabric widths are typically between 100cm and 300cm
 */
export function validateFabricWidth(widthCM: number, fabricName: string): boolean {
  if (widthCM < 50 || widthCM > 400) {
    console.warn(`[measurementBoundary] Unusual fabric width ${widthCM}cm for "${fabricName}". ` +
      `Expected 50-400cm. Check if value needs conversion from inches (${widthCM * 2.54}cm if inches).`);
    return false;
  }
  return true;
}

/**
 * Detect if a fabric width value is likely in inches and needs conversion
 * Common fabric widths in inches: 36, 44, 45, 54, 60, 90, 108, 118
 */
export function detectFabricWidthUnit(width: number): 'cm' | 'inches' | 'unknown' {
  const COMMON_INCH_WIDTHS = [36, 44, 45, 54, 60, 90, 108, 118, 120];
  const COMMON_CM_WIDTHS = [90, 110, 137, 140, 150, 200, 280, 300, 320];
  
  if (COMMON_INCH_WIDTHS.includes(width)) {
    return 'inches';
  }
  if (COMMON_CM_WIDTHS.includes(width)) {
    return 'cm';
  }
  // Heuristic: values under 100 are likely inches
  if (width < 100 && width > 20) {
    return 'inches';
  }
  return 'unknown';
}

/**
 * Normalize fabric width to CM, auto-detecting if it's in inches
 */
export function normalizeFabricWidthToCM(width: number): { widthCM: number; wasConverted: boolean; detectedUnit: string } {
  const detected = detectFabricWidthUnit(width);
  
  if (detected === 'inches') {
    return {
      widthCM: width * 2.54,
      wasConverted: true,
      detectedUnit: 'inches'
    };
  }
  
  return {
    widthCM: width,
    wasConverted: false,
    detectedUnit: detected === 'cm' ? 'cm' : 'assumed cm'
  };
}
