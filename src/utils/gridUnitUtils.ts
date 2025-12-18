/**
 * Grid Unit Utilities
 * 
 * Handles unit detection, inference, and conversion for pricing grids.
 * 
 * Grids can be stored in either MM or CM. This module provides utilities
 * to infer the unit from grid values and convert inputs appropriately.
 */

export type GridUnit = 'mm' | 'cm';

/**
 * Infer the unit of a pricing grid based on its values.
 * 
 * Logic:
 * - If any width/drop value is >= 500, it's likely in MM (e.g., 600mm = 60cm)
 * - If all values are < 500, it's likely in CM
 * 
 * This works because:
 * - Standard curtain widths: 600-3000mm (60-300cm)
 * - Standard blind widths: 30-300cm (300-3000mm)
 * - A width of 500mm = 50cm (reasonable for both)
 */
export function inferGridUnit(gridData: any): GridUnit {
  if (!gridData) return 'cm';
  
  // If unit is explicitly set, use it
  if (gridData.unit === 'mm' || gridData.unit === 'cm') {
    return gridData.unit;
  }
  
  // Get the first width value to analyze
  let firstWidth = 0;
  
  if (gridData.widthColumns && gridData.widthColumns.length > 0) {
    firstWidth = parseInt(gridData.widthColumns[0]?.toString() || '0', 10);
  } else if (gridData.widthRanges && gridData.widthRanges.length > 0) {
    firstWidth = parseInt(gridData.widthRanges[0]?.toString() || '0', 10);
  }
  
  // Get max width for more accurate detection
  let maxWidth = firstWidth;
  const widths = gridData.widthColumns || gridData.widthRanges || [];
  for (const w of widths) {
    const val = parseInt(w?.toString() || '0', 10);
    if (val > maxWidth) maxWidth = val;
  }
  
  // If max width is >= 500, it's likely in MM
  // Most blinds max at ~300cm (3000mm), curtains at ~300cm (3000mm)
  // A value of 500 would be unusual for CM (5 meters!) but normal for MM (50cm)
  if (maxWidth >= 500) {
    return 'mm';
  }
  
  return 'cm';
}

/**
 * Convert a dimension to match the grid's unit.
 * 
 * @param valueCm - The input value in centimeters
 * @param gridUnit - The unit the grid is stored in
 * @returns The value converted to match the grid's unit
 */
export function convertToGridUnit(valueCm: number, gridUnit: GridUnit): number {
  if (gridUnit === 'mm') {
    return valueCm * 10; // CM to MM
  }
  return valueCm; // Already in CM
}

/**
 * Get the display label for a grid unit
 */
export function getGridUnitLabel(unit: GridUnit): string {
  return unit === 'mm' ? 'millimeters (mm)' : 'centimeters (cm)';
}

/**
 * Get the short label for a grid unit
 */
export function getGridUnitShortLabel(unit: GridUnit): string {
  return unit;
}

/**
 * Determine if a value array looks like millimeters
 */
export function looksLikeMillimeters(values: (string | number)[]): boolean {
  if (!values || values.length === 0) return false;
  
  const maxVal = Math.max(...values.map(v => parseInt(v?.toString() || '0', 10)));
  return maxVal >= 500;
}

/**
 * Format a grid dimension value with its unit for display
 */
export function formatGridDimension(value: string | number, unit: GridUnit): string {
  return `${value}${unit}`;
}
