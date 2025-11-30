/**
 * Type-Safe Measurement System
 * 
 * CRITICAL STANDARD: All internal measurements are stored in MILLIMETERS (MM).
 * This is the single source of truth for the entire application.
 * 
 * Convert TO MM immediately on input boundaries (user forms, database reads)
 * Convert FROM MM only at display boundaries (UI display, PDF generation)
 */

export type LengthUnit = 'mm' | 'cm' | 'm' | 'inches' | 'feet' | 'yards';
export type AreaUnit = 'sq_mm' | 'sq_cm' | 'sq_m' | 'sq_inches' | 'sq_feet';

/**
 * Type-safe measurement with explicit unit
 * Use this for values that need to carry their unit information
 */
export interface TypedMeasurement {
  value: number;
  unit: LengthUnit;
}

/**
 * Standard window measurements interface
 * CRITICAL: All values are in MILLIMETERS internally
 */
export interface WindowMeasurements {
  /** Rail/headrail width in MM */
  rail_width: number;
  /** Drop/height in MM */
  drop: number;
  /** Pooling amount in MM (optional) */
  pooling_amount?: number;
  /** Return left in MM (optional) */
  return_left?: number;
  /** Return right in MM (optional) */
  return_right?: number;
  /** Stackback left in MM (optional) */
  stackback_left?: number;
  /** Stackback right in MM (optional) */
  stackback_right?: number;
}

/**
 * Fabric calculation result with explicit units
 * CRITICAL: Internal fabric calculations store dimensions in CM for fabric industry compatibility
 */
export interface FabricCalculation {
  /** Rail width in CM (converted from MM for fabric calculations) */
  railWidth: number;
  /** Drop height in CM (converted from MM for fabric calculations) */
  drop: number;
  /** Total drop including hems in CM */
  totalDrop: number;
  /** Fabric width in CM */
  fabricWidth: number;
  /** Linear meters required */
  linearMeters: number;
  /** Fullness ratio (e.g., 2.5 for 2.5x fullness) */
  fullnessRatio: number;
  /** Number of widths required */
  widthsRequired: number;
  /** Number of seams */
  seamsCount?: number;
  /** Other calculation fields... */
  [key: string]: any;
}

/**
 * Conversion helpers - ALWAYS convert through MM as base unit
 */

/** Convert any length unit TO millimeters */
export const toMM = (value: number, fromUnit: LengthUnit): number => {
  switch (fromUnit) {
    case 'mm': return value;
    case 'cm': return value * 10;
    case 'm': return value * 1000;
    case 'inches': return value * 25.4;
    case 'feet': return value * 304.8;
    case 'yards': return value * 914.4;
    default: return value;
  }
};

/** Convert millimeters TO any length unit */
export const fromMM = (valueMm: number, toUnit: LengthUnit): number => {
  switch (toUnit) {
    case 'mm': return valueMm;
    case 'cm': return valueMm / 10;
    case 'm': return valueMm / 1000;
    case 'inches': return valueMm / 25.4;
    case 'feet': return valueMm / 304.8;
    case 'yards': return valueMm / 914.4;
    default: return valueMm;
  }
};

/** Convert centimeters TO millimeters (common fabric industry conversion) */
export const cmToMM = (cm: number): number => cm * 10;

/** Convert millimeters TO centimeters (common fabric industry conversion) */
export const mmToCM = (mm: number): number => mm / 10;

/** Convert between any two length units (via MM intermediate) */
export const convertLength = (value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number => {
  const mm = toMM(value, fromUnit);
  return fromMM(mm, toUnit);
};

/**
 * Safe measurement accessor - ensures values are always in MM
 * Use this when reading from any source that might have unit ambiguity
 */
export const ensureMM = (value: number, assumedUnit: LengthUnit = 'mm'): number => {
  // If value is suspiciously small for MM, it might already be in a different unit
  // But we trust the assumedUnit parameter
  return toMM(value, assumedUnit);
};

/**
 * Format measurement for display with proper unit label
 */
export const formatMeasurement = (valueMm: number, targetUnit: LengthUnit): string => {
  const converted = fromMM(valueMm, targetUnit);
  const unitLabels: Record<LengthUnit, string> = {
    'mm': 'mm',
    'cm': 'cm',
    'm': 'm',
    'inches': '"',
    'feet': "'",
    'yards': 'yd'
  };
  
  return `${converted.toFixed(1)}${unitLabels[targetUnit]}`;
};
