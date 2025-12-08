/**
 * lengthUnits.ts
 * 
 * Centralized unit conversion utilities.
 * 
 * CRITICAL RULE: Engine and database ALWAYS use metric (mm/cm/m).
 * Imperial conversions happen ONLY at UI boundaries.
 * 
 * Internal standard:
 * - Database: millimeters (MM)
 * - Templates: centimeters (CM)
 * - Fabric widths: centimeters (CM)
 * - Display: user's preference (metric or imperial)
 */

export type LengthUnit = 'mm' | 'cm' | 'm' | 'inches' | 'feet' | 'yards';
export type AreaUnit = 'sqm' | 'sqft' | 'sqyd';

// Conversion factors TO millimeters
const TO_MM: Record<LengthUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  inches: 25.4,
  feet: 304.8,
  yards: 914.4,
};

// Conversion factors FROM millimeters
const FROM_MM: Record<LengthUnit, number> = {
  mm: 1,
  cm: 0.1,
  m: 0.001,
  inches: 1 / 25.4,
  feet: 1 / 304.8,
  yards: 1 / 914.4,
};

/**
 * Convert any length unit to millimeters
 */
export function toMm(value: number, fromUnit: LengthUnit): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`Invalid value for conversion: ${value}`);
  }
  return value * TO_MM[fromUnit];
}

/**
 * Convert millimeters to any length unit
 */
export function fromMm(mm: number, toUnit: LengthUnit): number {
  if (typeof mm !== 'number' || isNaN(mm)) {
    throw new Error(`Invalid mm value for conversion: ${mm}`);
  }
  return mm * FROM_MM[toUnit];
}

/**
 * Convert between any two length units
 */
export function convertLength(value: number, fromUnit: LengthUnit, toUnit: LengthUnit): number {
  if (fromUnit === toUnit) return value;
  const mm = toMm(value, fromUnit);
  return fromMm(mm, toUnit);
}

/**
 * Convert millimeters to centimeters
 */
export function mmToCm(mm: number): number {
  return mm / 10;
}

/**
 * Convert centimeters to millimeters
 */
export function cmToMm(cm: number): number {
  return cm * 10;
}

/**
 * Convert centimeters to meters
 */
export function cmToM(cm: number): number {
  return cm / 100;
}

/**
 * Convert meters to centimeters
 */
export function mToCm(m: number): number {
  return m * 100;
}

/**
 * Convert square meters to square feet
 */
export function sqmToSqft(sqm: number): number {
  return sqm * 10.7639;
}

/**
 * Convert square feet to square meters
 */
export function sqftToSqm(sqft: number): number {
  return sqft / 10.7639;
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format a measurement with unit label
 */
export function formatWithUnit(value: number, unit: LengthUnit, decimals: number = 1): string {
  const labels: Record<LengthUnit, string> = {
    mm: 'mm',
    cm: 'cm',
    m: 'm',
    inches: 'in',
    feet: 'ft',
    yards: 'yd',
  };
  return `${roundTo(value, decimals)}${labels[unit]}`;
}

/**
 * Determine if a unit is imperial
 */
export function isImperial(unit: LengthUnit): boolean {
  return unit === 'inches' || unit === 'feet' || unit === 'yards';
}

/**
 * Determine if a unit is metric
 */
export function isMetric(unit: LengthUnit): boolean {
  return unit === 'mm' || unit === 'cm' || unit === 'm';
}

/**
 * Get the preferred display unit based on measurement system
 */
export function getDisplayUnit(
  system: 'metric' | 'imperial',
  context: 'length' | 'width' | 'fabric' = 'length'
): LengthUnit {
  if (system === 'imperial') {
    return context === 'fabric' ? 'inches' : 'feet';
  }
  return context === 'fabric' ? 'cm' : 'cm';
}
