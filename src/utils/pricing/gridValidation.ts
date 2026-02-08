/**
 * Unified Grid Validation Utility
 * ================================
 * CRITICAL: Use this EVERYWHERE for consistent grid validation.
 * This prevents the bug where different parts of the app use different criteria.
 *
 * Grid formats supported:
 * 1. Standard CSV format: { widthColumns, dropRows }
 * 2. Legacy range format: { widthRanges, dropRanges, prices }
 * 3. Gustin format: { widths, heights, prices }
 * 4. TWC metadata format: { widthColumns, dropRows } (stored in metadata.pricing_grid_data)
 */

export interface GridValidationResult {
  isValid: boolean;
  format: 'standard' | 'range' | 'gustin' | 'legacy_rows' | 'empty' | 'invalid';
  reason?: string;
}

/**
 * Check if pricing grid data is valid and usable for price lookups.
 *
 * @param gridData - The pricing grid data object
 * @returns boolean - true if the grid has valid pricing data
 *
 * USAGE: Import and use this function instead of inline checks!
 * ```typescript
 * import { hasValidPricingGrid } from '@/utils/pricing/gridValidation';
 *
 * if (hasValidPricingGrid(fabric.pricing_grid_data)) {
 *   // Safe to use getPriceFromGrid
 * }
 * ```
 */
export const hasValidPricingGrid = (gridData: any): boolean => {
  if (!gridData || typeof gridData !== 'object') return false;

  // Check for empty object
  if (Object.keys(gridData).length === 0) return false;

  // Standard format: widthColumns + dropRows (CSV uploaded grids)
  if (gridData.widthColumns && Array.isArray(gridData.widthColumns) && gridData.widthColumns.length > 0) {
    if (gridData.dropRows && Array.isArray(gridData.dropRows) && gridData.dropRows.length > 0) {
      return true;
    }
  }

  // Legacy format: widths + dropRanges OR widthRanges + dropRanges
  if (gridData.dropRanges && Array.isArray(gridData.dropRanges) && gridData.dropRanges.length > 0) {
    if (
      (gridData.widths && Array.isArray(gridData.widths) && gridData.widths.length > 0) ||
      (gridData.widthRanges && Array.isArray(gridData.widthRanges) && gridData.widthRanges.length > 0)
    ) {
      return true;
    }
  }

  // Gustin format: widths + heights + prices (3D array)
  if (
    gridData.widths && Array.isArray(gridData.widths) && gridData.widths.length > 0 &&
    gridData.heights && Array.isArray(gridData.heights) && gridData.heights.length > 0 &&
    gridData.prices && Array.isArray(gridData.prices) && gridData.prices.length > 0
  ) {
    return true;
  }

  // Legacy rows format (very old)
  if (gridData.rows && Array.isArray(gridData.rows) && gridData.rows.length > 0) {
    const firstRow = gridData.rows[0];
    if (firstRow && (firstRow.height !== undefined || firstRow.drop !== undefined)) {
      return true;
    }
  }

  return false;
};

/**
 * Detailed grid validation with format detection.
 * Use this when you need to know WHY a grid is invalid.
 */
export const validatePricingGrid = (gridData: any): GridValidationResult => {
  if (!gridData) {
    return { isValid: false, format: 'invalid', reason: 'Grid data is null or undefined' };
  }

  if (typeof gridData !== 'object') {
    return { isValid: false, format: 'invalid', reason: `Grid data is not an object (got ${typeof gridData})` };
  }

  if (Object.keys(gridData).length === 0) {
    return { isValid: false, format: 'empty', reason: 'Grid data is an empty object' };
  }

  // Standard format
  if (gridData.widthColumns && Array.isArray(gridData.widthColumns)) {
    if (gridData.widthColumns.length === 0) {
      return { isValid: false, format: 'standard', reason: 'widthColumns array is empty' };
    }
    if (!gridData.dropRows || !Array.isArray(gridData.dropRows) || gridData.dropRows.length === 0) {
      return { isValid: false, format: 'standard', reason: 'dropRows missing or empty' };
    }
    return { isValid: true, format: 'standard' };
  }

  // Range format
  if (gridData.dropRanges && Array.isArray(gridData.dropRanges) && gridData.dropRanges.length > 0) {
    if (gridData.widths && Array.isArray(gridData.widths) && gridData.widths.length > 0) {
      return { isValid: true, format: 'range' };
    }
    if (gridData.widthRanges && Array.isArray(gridData.widthRanges) && gridData.widthRanges.length > 0) {
      return { isValid: true, format: 'range' };
    }
    return { isValid: false, format: 'range', reason: 'Has dropRanges but missing widths/widthRanges' };
  }

  // Gustin format
  if (gridData.widths && gridData.heights && gridData.prices) {
    if (!Array.isArray(gridData.widths) || gridData.widths.length === 0) {
      return { isValid: false, format: 'gustin', reason: 'widths not an array or empty' };
    }
    if (!Array.isArray(gridData.heights) || gridData.heights.length === 0) {
      return { isValid: false, format: 'gustin', reason: 'heights not an array or empty' };
    }
    if (!Array.isArray(gridData.prices) || gridData.prices.length === 0) {
      return { isValid: false, format: 'gustin', reason: 'prices not an array or empty' };
    }
    return { isValid: true, format: 'gustin' };
  }

  // Legacy rows format
  if (gridData.rows && Array.isArray(gridData.rows) && gridData.rows.length > 0) {
    return { isValid: true, format: 'legacy_rows' };
  }

  return {
    isValid: false,
    format: 'invalid',
    reason: `Unrecognized grid format. Keys: ${Object.keys(gridData).join(', ')}`
  };
};

/**
 * Check if a fabric/material item uses pricing grid pricing.
 * This is the SINGLE SOURCE OF TRUTH for determining if grid pricing applies.
 *
 * @param item - The fabric/material item with potential pricing_grid_data
 * @returns boolean - true if the item should use grid pricing
 */
export const itemUsesPricingGrid = (item: any): boolean => {
  if (!item) return false;

  // Check if item has valid grid data
  if (!hasValidPricingGrid(item.pricing_grid_data)) {
    return false;
  }

  // Grid data exists and is valid
  return true;
};

/**
 * Get grid markup percentage from item, with proper fallback.
 *
 * @param item - The fabric/material item
 * @returns number - The markup percentage to apply (0 if none)
 */
export const getGridMarkup = (item: any): number => {
  if (!item) return 0;

  // Priority: pricing_grid_markup > markup_percentage > 0
  return item.pricing_grid_markup || item.markup_percentage || 0;
};
