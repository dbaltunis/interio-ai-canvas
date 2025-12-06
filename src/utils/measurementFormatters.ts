/**
 * Centralized Measurement Formatting Utilities
 * 
 * CRITICAL: Use these functions for ALL measurement displays to ensure
 * consistent unit display based on user preferences.
 * 
 * Source Units:
 * - Database values: Always MM
 * - Fabric calculations: CM (industry standard)
 * - User input: User's configured unit
 */

import { convertLength, type MeasurementUnits } from "@/hooks/useBusinessSettings";

// Short labels for inline display (e.g., 100mm, 39")
const UNIT_LABELS_SHORT: Record<string, string> = {
  'mm': 'mm',
  'cm': 'cm',
  'm': 'm',
  'inches': '"',
  'feet': "'",
  'yards': 'yd'
};

// Long labels for headers and descriptions (e.g., "Width in inches")
const UNIT_LABELS_LONG: Record<string, string> = {
  'mm': 'mm',
  'cm': 'cm',
  'm': 'm',
  'inches': 'in',
  'feet': 'ft',
  'yards': 'yd'
};

// For backward compatibility
const UNIT_LABELS = UNIT_LABELS_SHORT;

/**
 * Get the label/symbol for a unit
 */
export const getUnitLabel = (unit: string): string => {
  return UNIT_LABELS[unit] || unit;
};

/**
 * Format a measurement from MM (database standard) to user's preferred unit
 */
export const formatFromMM = (valueMM: number, targetUnit: string, decimals: number = 1): string => {
  if (!valueMM || isNaN(valueMM)) return `0${getUnitLabel(targetUnit)}`;
  const converted = convertLength(valueMM, 'mm', targetUnit);
  return `${converted.toFixed(decimals)}${getUnitLabel(targetUnit)}`;
};

/**
 * Format a measurement from CM (fabric calculations) to user's preferred unit
 */
export const formatFromCM = (valueCM: number, targetUnit: string, decimals: number = 1): string => {
  if (!valueCM || isNaN(valueCM)) return `0${getUnitLabel(targetUnit)}`;
  const converted = convertLength(valueCM, 'cm', targetUnit);
  return `${converted.toFixed(decimals)}${getUnitLabel(targetUnit)}`;
};

/**
 * Format dimension pair (width × height) from CM to user's unit
 */
export const formatDimensionsFromCM = (
  widthCM: number, 
  heightCM: number, 
  targetUnit: string,
  decimals: number = 0
): string => {
  const w = convertLength(widthCM || 0, 'cm', targetUnit);
  const h = convertLength(heightCM || 0, 'cm', targetUnit);
  const label = getUnitLabel(targetUnit);
  return `${w.toFixed(decimals)}${label} × ${h.toFixed(decimals)}${label}`;
};

/**
 * Format dimension pair (width × height) from MM to user's unit
 */
export const formatDimensionsFromMM = (
  widthMM: number, 
  heightMM: number, 
  targetUnit: string,
  decimals: number = 0
): string => {
  const w = convertLength(widthMM || 0, 'mm', targetUnit);
  const h = convertLength(heightMM || 0, 'mm', targetUnit);
  const label = getUnitLabel(targetUnit);
  return `${w.toFixed(decimals)}${label} × ${h.toFixed(decimals)}${label}`;
};

/**
 * Format fabric width from CM (fabric industry standard) to user's fabric unit
 */
export const formatFabricWidthFromCM = (widthCM: number, fabricUnit: string, decimals: number = 1): string => {
  if (!widthCM || isNaN(widthCM)) return `0${getUnitLabel(fabricUnit)}`;
  const converted = convertLength(widthCM, 'cm', fabricUnit);
  return `${converted.toFixed(decimals)}${getUnitLabel(fabricUnit)}`;
};

/**
 * Format a raw value (assumed in user's unit) with proper label
 */
export const formatWithUnit = (value: number, unit: string, decimals: number = 1): string => {
  if (!value || isNaN(value)) return `0${getUnitLabel(unit)}`;
  return `${value.toFixed(decimals)}${getUnitLabel(unit)}`;
};

/**
 * Convert CM value to user's length unit and return numeric value
 */
export const convertFromCM = (valueCM: number, targetUnit: string): number => {
  return convertLength(valueCM || 0, 'cm', targetUnit);
};

/**
 * Convert MM value to user's length unit and return numeric value
 */
export const convertFromMM = (valueMM: number, targetUnit: string): number => {
  return convertLength(valueMM || 0, 'mm', targetUnit);
};
