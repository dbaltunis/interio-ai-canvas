/**
 * PRICING & MARKUP FORMULAS
 * =========================
 *
 * SINGLE SOURCE OF TRUTH for all pricing calculations.
 * Pure functions - no React, no Supabase, no side effects.
 *
 * PRICING METHODS:
 *
 *   1. Per Running Meter:
 *      cost = linearMeters * pricePerMeter
 *
 *   2. Per Square Meter:
 *      cost = sqm * pricePerSqm
 *
 *   3. Pricing Grid (Width x Drop lookup):
 *      cost = grid[matchedWidth][matchedDrop]
 *      (Grid dimensions in CM, lookup finds first column/row >= input)
 *
 *   4. Fixed Price:
 *      cost = fixedPrice
 *
 *   5. Per Drop Height (range bands):
 *      cost = matchingRange.price * quantity
 *
 * MARKUP HIERARCHY (highest to lowest priority):
 *
 *   1. Quote Override (per-job custom markup)
 *   2. Grid Markup (when product uses pricing_grid method)
 *   3. Product Markup (explicit markup_percentage on inventory item)
 *   4. Implied Markup (calculated from cost_price vs selling_price)
 *   5. Grid Markup (secondary, for non-grid products with grid reference)
 *   6. Subcategory Markup
 *   7. Category Markup
 *   8. Material vs Labor Markup
 *   9. Global Default
 *  10. Minimum Markup
 *
 * MARKUP FORMULA:
 *   sellingPrice = costPrice * (1 + markupPercent / 100)
 *
 * GROSS MARGIN FORMULA:
 *   margin% = (sellingPrice - costPrice) / sellingPrice * 100
 *
 * DO NOT MODIFY without updating unit tests and ALGORITHM_VERSION.
 */

import { roundTo } from './common.formulas';

// ============================================================
// Pricing Method Calculations
// ============================================================

/**
 * Calculate cost using per-running-meter pricing.
 * Used for: Curtains, roman blinds (fabric cost).
 */
export function pricePerRunningMeter(linearMeters: number, pricePerMeter: number): number {
  return roundTo(linearMeters * pricePerMeter, 2);
}

/**
 * Calculate cost using per-square-meter pricing.
 * Used for: Blinds, shutters, awnings.
 */
export function pricePerSqm(sqm: number, pricePerSqm: number): number {
  return roundTo(sqm * pricePerSqm, 2);
}

/**
 * Calculate cost using fixed pricing.
 * Used for: Options, accessories, services.
 */
export function priceFixed(fixedPrice: number): number {
  return roundTo(fixedPrice, 2);
}

/**
 * Calculate cost using drop-range bands.
 * Finds the first range where drop falls within min-max, returns price * qty.
 */
export function pricePerDrop(
  dropCm: number,
  ranges: Array<{ minDrop: number; maxDrop: number; price: number }>,
  quantity: number = 1
): number {
  const match = ranges.find(r => dropCm >= r.minDrop && dropCm <= r.maxDrop);
  return match ? roundTo(match.price * quantity, 2) : 0;
}

/**
 * Calculate cost using percentage of a base amount.
 * Used for: Percentage-based options.
 */
export function pricePercentage(baseAmount: number, percentage: number): number {
  return roundTo(baseAmount * (percentage / 100), 2);
}

// ============================================================
// Grid Pricing
// ============================================================

export interface PricingGrid {
  widthColumns: number[];
  dropRows: number[];
  prices: Record<string, number>;
}

/**
 * Lookup price from a width x drop pricing grid.
 *
 * Grid convention:
 * - widthColumns and dropRows are sorted ascending
 * - Lookup finds the FIRST column/row >= the input dimension
 * - Prices keyed as "width_drop" (e.g. "120_210")
 *
 * @returns The grid price, or null if no match found
 */
export function lookupGridPrice(
  grid: PricingGrid,
  widthCm: number,
  dropCm: number
): number | null {
  if (!grid?.widthColumns?.length || !grid?.dropRows?.length) {
    return null;
  }

  // Find first column >= width
  const matchedWidth = grid.widthColumns.find(col => col >= widthCm);
  if (matchedWidth === undefined) return null;

  // Find first row >= drop
  const matchedDrop = grid.dropRows.find(row => row >= dropCm);
  if (matchedDrop === undefined) return null;

  // Try key formats
  const keys = [
    `${matchedWidth}_${matchedDrop}`,
    `${matchedWidth}-${matchedDrop}`,
    `${matchedWidth}x${matchedDrop}`,
  ];

  for (const key of keys) {
    if (grid.prices[key] !== undefined) {
      return grid.prices[key];
    }
  }

  return null;
}

// ============================================================
// Markup Calculations
// ============================================================

export interface MarkupSource {
  percentage: number;
  source: 'quote_override' | 'grid' | 'product' | 'implied' | 'subcategory' | 'category' | 'material_labor' | 'global' | 'minimum';
  label: string;
}

/**
 * Apply markup percentage to a cost price.
 *
 * Formula: sellingPrice = costPrice * (1 + markup% / 100)
 */
export function applyMarkup(costPrice: number, markupPercent: number): number {
  if (costPrice <= 0) return costPrice;
  return roundTo(costPrice * (1 + markupPercent / 100), 2);
}

/**
 * Calculate gross profit margin percentage.
 *
 * Formula: margin% = (selling - cost) / selling * 100
 */
export function calculateGrossMargin(costPrice: number, sellingPrice: number): number {
  if (sellingPrice <= 0) return 0;
  return roundTo(((sellingPrice - costPrice) / sellingPrice) * 100, 1);
}

/**
 * Calculate implied markup from cost and selling prices.
 *
 * Formula: markup% = (selling - cost) / cost * 100
 * Returns 0 if either price is missing or invalid.
 */
export function calculateImpliedMarkup(costPrice: number, sellingPrice: number): number {
  if (!costPrice || costPrice <= 0 || !sellingPrice || sellingPrice <= 0) return 0;
  return roundTo(((sellingPrice - costPrice) / costPrice) * 100, 1);
}

/**
 * Get profit status label based on margin percentage.
 */
export function getProfitStatus(marginPercent: number): {
  status: 'loss' | 'low' | 'normal' | 'good';
  label: string;
} {
  if (marginPercent < 0) return { status: 'loss', label: 'Loss' };
  if (marginPercent < 20) return { status: 'low', label: 'Low Margin' };
  if (marginPercent < 40) return { status: 'normal', label: 'Normal' };
  return { status: 'good', label: 'Good Margin' };
}
