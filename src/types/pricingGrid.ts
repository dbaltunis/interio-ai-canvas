/**
 * Unified Pricing Grid Types
 *
 * This module standardizes all pricing grid data structures across the application.
 * All CSV parsers and grid operations should use these types.
 *
 * STANDARD FORMAT:
 * - widthColumns: Array of width values (numbers, in cm)
 * - dropRows: Array of { drop, prices } objects
 * - unit: Always 'cm' or 'mm'
 * - prices accessed via: dropRows[dropIndex].prices[widthIndex]
 */

export type GridUnit = 'cm' | 'mm';

/**
 * Standard drop row with prices for each width column
 */
export interface StandardDropRow {
  drop: number;
  prices: number[];
}

/**
 * Standard pricing grid data structure
 * This is the CANONICAL format all grids should be normalized to
 */
export interface StandardPricingGridData {
  /** Width values in ascending order (in unit specified) */
  widthColumns: number[];
  /** Drop rows with prices array matching widthColumns length */
  dropRows: StandardDropRow[];
  /** Unit of measurement for dimensions */
  unit: GridUnit;
  /** Optional currency code */
  currency?: string;
  /** Grid format version for future migrations */
  version?: number;
}

/**
 * Legacy format A: dropRanges/widthRanges with 2D prices array
 */
export interface LegacyFormatA {
  dropRanges: (string | number)[];
  widthRanges: (string | number)[];
  prices: (string | number)[][];
}

/**
 * Legacy format B: widthColumns/dropRows with nested prices
 */
export interface LegacyFormatB {
  widthColumns: (string | number)[];
  dropRows: { drop: string | number; prices: (string | number)[] }[];
  unit?: GridUnit;
}

/**
 * Legacy format C: Flat arrays with prices dict
 */
export interface LegacyFormatC {
  widthColumns: (string | number)[];
  dropRows: (string | number)[];
  prices: Record<string, string | number>;
}

/**
 * Legacy format D: widths/heights terminology
 */
export interface LegacyFormatD {
  widths: (string | number)[];
  heights: (string | number)[];
  prices: (string | number)[][];
}

/**
 * Union of all known grid formats
 */
export type AnyPricingGridData =
  | StandardPricingGridData
  | LegacyFormatA
  | LegacyFormatB
  | LegacyFormatC
  | LegacyFormatD
  | Record<string, any>;

/**
 * Type guard: Check if data is in standard format
 */
export function isStandardFormat(data: any): data is StandardPricingGridData {
  if (!data || typeof data !== 'object') return false;

  const hasWidthColumns = Array.isArray(data.widthColumns) &&
    data.widthColumns.every((w: any) => typeof w === 'number');

  const hasDropRows = Array.isArray(data.dropRows) &&
    data.dropRows.every((row: any) =>
      typeof row === 'object' &&
      typeof row.drop === 'number' &&
      Array.isArray(row.prices) &&
      row.prices.every((p: any) => typeof p === 'number')
    );

  const hasUnit = data.unit === 'cm' || data.unit === 'mm';

  return hasWidthColumns && hasDropRows && hasUnit;
}

/**
 * Type guard: Check if data is legacy format A (dropRanges/widthRanges)
 */
export function isLegacyFormatA(data: any): data is LegacyFormatA {
  return data &&
    Array.isArray(data.dropRanges) &&
    Array.isArray(data.widthRanges) &&
    Array.isArray(data.prices) &&
    Array.isArray(data.prices[0]);
}

/**
 * Type guard: Check if data is legacy format B (dropRows with nested prices)
 */
export function isLegacyFormatB(data: any): data is LegacyFormatB {
  return data &&
    Array.isArray(data.widthColumns) &&
    Array.isArray(data.dropRows) &&
    data.dropRows.length > 0 &&
    typeof data.dropRows[0] === 'object' &&
    'drop' in data.dropRows[0] &&
    'prices' in data.dropRows[0];
}

/**
 * Type guard: Check if data is legacy format C (prices as dict)
 */
export function isLegacyFormatC(data: any): data is LegacyFormatC {
  return data &&
    Array.isArray(data.widthColumns) &&
    Array.isArray(data.dropRows) &&
    data.dropRows.length > 0 &&
    typeof data.dropRows[0] !== 'object' &&
    data.prices &&
    typeof data.prices === 'object' &&
    !Array.isArray(data.prices);
}

/**
 * Type guard: Check if data is legacy format D (widths/heights)
 */
export function isLegacyFormatD(data: any): data is LegacyFormatD {
  return data &&
    Array.isArray(data.widths) &&
    Array.isArray(data.heights) &&
    Array.isArray(data.prices);
}

/**
 * Parse a value to number, handling strings
 */
function toNumber(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Infer unit from grid data based on max values
 * Values >= 500 are assumed to be mm, otherwise cm
 */
export function inferUnit(data: any): GridUnit {
  // If unit is explicitly set, use it
  if (data?.unit === 'cm' || data?.unit === 'mm') {
    return data.unit;
  }

  // Find max dimension value
  let maxValue = 0;

  const checkValues = (arr: any[]) => {
    if (!Array.isArray(arr)) return;
    arr.forEach(v => {
      const num = typeof v === 'object' && v?.drop !== undefined
        ? toNumber(v.drop)
        : toNumber(v);
      if (num > maxValue) maxValue = num;
    });
  };

  // Check all possible dimension arrays
  checkValues(data?.widthColumns);
  checkValues(data?.widthRanges);
  checkValues(data?.widths);
  checkValues(data?.dropRows);
  checkValues(data?.dropRanges);
  checkValues(data?.heights);

  // Threshold: 500+ assumed mm
  return maxValue >= 500 ? 'mm' : 'cm';
}

/**
 * Normalize ANY grid format to the standard format
 * This is the main entry point for grid normalization
 */
export function normalizeGridData(data: any): StandardPricingGridData | null {
  if (!data || typeof data !== 'object') {
    console.warn('[normalizeGridData] Invalid input: not an object');
    return null;
  }

  // Already in standard format
  if (isStandardFormat(data)) {
    return data;
  }

  const unit = inferUnit(data);

  try {
    // Format A: dropRanges/widthRanges with 2D prices
    if (isLegacyFormatA(data)) {
      const widthColumns = data.widthRanges.map(toNumber).sort((a, b) => a - b);
      const dropRows: StandardDropRow[] = data.dropRanges.map((drop, dropIdx) => ({
        drop: toNumber(drop),
        prices: (data.prices[dropIdx] || []).map(toNumber)
      })).sort((a, b) => a.drop - b.drop);

      return { widthColumns, dropRows, unit, version: 1 };
    }

    // Format B: widthColumns/dropRows with nested prices
    if (isLegacyFormatB(data)) {
      const widthColumns = data.widthColumns.map(toNumber).sort((a, b) => a - b);
      const dropRows: StandardDropRow[] = data.dropRows.map(row => ({
        drop: toNumber(row.drop),
        prices: row.prices.map(toNumber)
      })).sort((a, b) => a.drop - b.drop);

      return { widthColumns, dropRows, unit: data.unit || unit, version: 1 };
    }

    // Format C: Flat arrays with prices dict
    if (isLegacyFormatC(data)) {
      const widthColumns = data.widthColumns.map(toNumber).sort((a, b) => a - b);
      const dropRows: StandardDropRow[] = data.dropRows.map(drop => {
        const dropNum = toNumber(drop);
        const prices = widthColumns.map(width => {
          // Try different key formats: "width_drop", "width-drop"
          const key1 = `${width}_${dropNum}`;
          const key2 = `${width}-${dropNum}`;
          const key3 = `${dropNum}_${width}`;
          const val = data.prices[key1] ?? data.prices[key2] ?? data.prices[key3] ?? 0;
          return toNumber(val);
        });
        return { drop: dropNum, prices };
      }).sort((a, b) => a.drop - b.drop);

      return { widthColumns, dropRows, unit, version: 1 };
    }

    // Format D: widths/heights terminology
    if (isLegacyFormatD(data)) {
      const widthColumns = data.widths.map(toNumber).sort((a, b) => a - b);
      const dropRows: StandardDropRow[] = data.heights.map((height, idx) => ({
        drop: toNumber(height),
        prices: (data.prices[idx] || []).map(toNumber)
      })).sort((a, b) => a.drop - b.drop);

      return { widthColumns, dropRows, unit, version: 1 };
    }

    // Unknown format - try to extract what we can
    console.warn('[normalizeGridData] Unknown format, attempting best-effort parse');

    // Look for any arrays that might be dimensions
    const possibleWidths = data.widthColumns || data.widthRanges || data.widths || [];
    const possibleDrops = data.dropRows || data.dropRanges || data.heights || [];
    const possiblePrices = data.prices || [];

    if (possibleWidths.length && possibleDrops.length) {
      const widthColumns = possibleWidths.map(toNumber).sort((a, b) => a - b);

      // Handle dropRows as either objects or flat array
      let dropRows: StandardDropRow[];
      if (Array.isArray(possibleDrops) && possibleDrops[0]?.drop !== undefined) {
        // Object array format
        dropRows = possibleDrops.map((row: any) => ({
          drop: toNumber(row.drop),
          prices: Array.isArray(row.prices) ? row.prices.map(toNumber) : []
        }));
      } else if (Array.isArray(possiblePrices) && Array.isArray(possiblePrices[0])) {
        // 2D prices array
        dropRows = possibleDrops.map((drop: any, idx: number) => ({
          drop: toNumber(drop),
          prices: (possiblePrices[idx] || []).map(toNumber)
        }));
      } else {
        console.warn('[normalizeGridData] Could not determine prices structure');
        return null;
      }

      return {
        widthColumns,
        dropRows: dropRows.sort((a, b) => a.drop - b.drop),
        unit,
        version: 1
      };
    }

    console.warn('[normalizeGridData] Could not normalize grid data');
    return null;

  } catch (error) {
    console.error('[normalizeGridData] Error normalizing grid:', error);
    return null;
  }
}

/**
 * Validate that a standard grid has consistent dimensions
 */
export function validateStandardGrid(grid: StandardPricingGridData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!grid.widthColumns.length) {
    errors.push('No width columns defined');
  }

  if (!grid.dropRows.length) {
    errors.push('No drop rows defined');
  }

  // Check each row has correct number of prices
  grid.dropRows.forEach((row, idx) => {
    if (row.prices.length !== grid.widthColumns.length) {
      errors.push(`Row ${idx} (drop ${row.drop}) has ${row.prices.length} prices but expected ${grid.widthColumns.length}`);
    }
  });

  // Check for duplicate drops
  const drops = grid.dropRows.map(r => r.drop);
  const uniqueDrops = new Set(drops);
  if (uniqueDrops.size !== drops.length) {
    errors.push('Duplicate drop values found');
  }

  // Check for duplicate widths
  const uniqueWidths = new Set(grid.widthColumns);
  if (uniqueWidths.size !== grid.widthColumns.length) {
    errors.push('Duplicate width values found');
  }

  // Check all values are positive
  if (grid.widthColumns.some(w => w <= 0)) {
    errors.push('Width values must be positive');
  }
  if (grid.dropRows.some(r => r.drop <= 0)) {
    errors.push('Drop values must be positive');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get price from a standard grid for given dimensions
 * Uses linear interpolation for values between grid points
 */
export function getPriceFromStandardGrid(
  grid: StandardPricingGridData,
  width: number,
  drop: number,
  inputUnit: GridUnit = 'cm'
): number | null {
  if (!grid || !grid.widthColumns.length || !grid.dropRows.length) {
    return null;
  }

  // Convert input to grid unit if needed
  let w = width;
  let d = drop;
  if (inputUnit !== grid.unit) {
    if (inputUnit === 'mm' && grid.unit === 'cm') {
      w = width / 10;
      d = drop / 10;
    } else if (inputUnit === 'cm' && grid.unit === 'mm') {
      w = width * 10;
      d = drop * 10;
    }
  }

  // Find closest width index (round up to nearest grid point)
  let widthIdx = grid.widthColumns.findIndex(col => col >= w);
  if (widthIdx === -1) {
    widthIdx = grid.widthColumns.length - 1; // Use max width
  }

  // Find closest drop index (round up to nearest grid point)
  let dropIdx = grid.dropRows.findIndex(row => row.drop >= d);
  if (dropIdx === -1) {
    dropIdx = grid.dropRows.length - 1; // Use max drop
  }

  const row = grid.dropRows[dropIdx];
  if (!row || !row.prices || widthIdx >= row.prices.length) {
    return null;
  }

  return row.prices[widthIdx];
}

/**
 * Convert grid dimensions between units
 */
export function convertGridUnit(grid: StandardPricingGridData, targetUnit: GridUnit): StandardPricingGridData {
  if (grid.unit === targetUnit) {
    return grid;
  }

  const factor = targetUnit === 'mm' ? 10 : 0.1;

  return {
    widthColumns: grid.widthColumns.map(w => w * factor),
    dropRows: grid.dropRows.map(row => ({
      drop: row.drop * factor,
      prices: row.prices // Prices don't change with unit conversion
    })),
    unit: targetUnit,
    currency: grid.currency,
    version: grid.version
  };
}
