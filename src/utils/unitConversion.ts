/**
 * Unit conversion utilities for consistent measurement handling
 * 
 * CRITICAL STANDARD: All database measurements are stored in MILLIMETERS (MM)
 * This file provides conversions between MM, CM, and M for display purposes
 * 
 * For comprehensive unit conversions, see src/types/measurements.ts
 */

/**
 * Convert centimeters to meters
 * @param cm - Value in centimeters
 * @returns Value in meters
 */
export const cmToM = (cm?: number): number => {
  return (cm ?? 0) / 100;
};

/**
 * Convert meters to centimeters
 * @param m - Value in meters
 * @returns Value in centimeters
 */
export const mToCm = (m?: number): number => {
  return (m ?? 0) * 100;
};

/**
 * Convert millimeters to centimeters
 * @param mm - Value in millimeters
 * @returns Value in centimeters
 */
export const mmToCm = (mm?: number): number => {
  return (mm ?? 0) / 10;
};

/**
 * Convert centimeters to millimeters
 * @param cm - Value in centimeters
 * @returns Value in millimeters
 */
export const cmToMm = (cm?: number): number => {
  return (cm ?? 0) * 10;
};

// Re-export the main currency formatter for consistency
export { formatCurrency } from './currency';

/**
 * Format linear meters with unit label
 * @param meters - Value in meters (not MM!)
 * @returns Formatted string like "2.50m"
 */
export const formatLinearMeters = (meters?: number): string => {
  const n = Number(meters ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toFixed(2)}m`;
};