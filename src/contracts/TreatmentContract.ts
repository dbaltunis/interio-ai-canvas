/**
 * TreatmentContract.ts
 * 
 * Single source of truth for treatment data structures.
 * All measurements follow strict unit standards:
 * - Database/API: millimeters (MM)
 * - Templates: centimeters (CM)
 * - Engine calculations: converts as needed
 * 
 * NO silent defaults. NO fallbacks. Missing data = validation error.
 */

import { TREATMENT_CATEGORIES, TreatmentCategoryDbValue, ALL_DB_VALUES } from '@/types/treatmentCategories';

// Re-export for convenience
export { TREATMENT_CATEGORIES, ALL_DB_VALUES };
export type { TreatmentCategoryDbValue };

// Treatment type classifications
export const LINEAR_TYPES: TreatmentCategoryDbValue[] = ['curtains', 'roman_blinds'];
export const AREA_TYPES: TreatmentCategoryDbValue[] = ['roller_blinds', 'venetian_blinds', 'vertical_blinds', 'cellular_blinds', 'shutters', 'plantation_shutters'];
export const GRID_TYPES: TreatmentCategoryDbValue[] = ['roller_blinds', 'venetian_blinds', 'vertical_blinds', 'cellular_blinds', 'shutters', 'plantation_shutters'];
export const UNSUPPORTED_TYPES: TreatmentCategoryDbValue[] = ['wallpaper', 'awning', 'panel_glide'];

/**
 * Measurements from UI/database - ALL VALUES IN MILLIMETERS
 * This is the raw input from windows_summary.measurements
 */
export interface MeasurementsContract {
  rail_width_mm: number;
  drop_mm: number;
  
  // Optional overrides (user selections in worksheet)
  heading_fullness?: number;      // e.g., 2.0, 2.5, 3.0
  return_left_cm?: number;
  return_right_cm?: number;
  pooling_cm?: number;
  
  // Blind-specific
  stack_position?: 'left' | 'right' | 'center' | 'split';
  control_side?: 'left' | 'right';
  
  // Raw values for reference
  raw?: Record<string, unknown>;
}

/**
 * Template configuration - ALL VALUES IN CENTIMETERS
 * This is the configuration from curtain_templates/product_templates
 */
export interface TemplateContract {
  id: string;
  name: string;
  treatment_category: TreatmentCategoryDbValue;
  
  // Pricing configuration
  pricing_type: 'per_running_meter' | 'per_sqm' | 'per_drop' | 'pricing_grid' | 'fixed';
  base_price?: number;
  
  // Manufacturing defaults (in CM)
  header_hem_cm: number;
  bottom_hem_cm: number;
  side_hem_cm: number;
  seam_hem_cm: number;
  
  // Curtain-specific
  default_fullness_ratio?: number;  // e.g., 2.5
  default_returns_cm?: number;
  
  // Waste factor
  waste_percentage: number;  // e.g., 5 for 5%
  
  // Pricing grid if applicable
  pricing_grid_data?: PricingGridContract;
  pricing_grid_id?: string;
}

/**
 * Fabric details - width ALWAYS in centimeters (industry standard)
 */
export interface FabricContract {
  id: string;
  name: string;
  width_cm: number;
  
  // Pricing
  price_per_meter?: number;
  price_per_sqm?: number;
  pricing_method: 'per_running_meter' | 'per_sqm' | 'fixed';
  
  // Pattern info
  pattern_repeat_cm?: number;
  railroading_allowed?: boolean;
  
  // Grid pricing (for fabrics with assigned grids)
  pricing_grid_data?: PricingGridContract;
}

/**
 * Material details for hard blinds (venetian slats, etc.)
 */
export interface MaterialContract {
  id: string;
  name: string;
  
  // Pricing
  price?: number;
  pricing_method: 'per_sqm' | 'pricing_grid' | 'fixed';
  
  // Specifications
  slat_width_mm?: number;
  material_type?: string;
  color?: string;
  
  // Grid pricing
  pricing_grid_data?: PricingGridContract;
}

/**
 * Selected option with pricing - strictly typed
 */
export interface SelectedOptionContract {
  option_id: string;
  option_key: string;           // e.g., 'control_type', 'mount_type'
  value_id: string;
  value_label: string;          // Display name
  value_code?: string;          // Internal code
  
  // Pricing - REQUIRED, no defaults
  price: number;
  pricing_method: 'fixed' | 'per_unit' | 'per_meter' | 'per_sqm' | 'percentage' | 'pricing_grid';
  
  // For percentage-based pricing
  percentage_of?: 'base' | 'fabric' | 'total';
  
  // Grid data if applicable
  pricing_grid_data?: PricingGridContract;
  
  // Source tracking
  source?: 'manual' | 'twc' | 'template_default';
}

/**
 * Pricing grid structure - supports all 3 existing formats
 * Format A: widthColumns[], dropRows[{drop, prices[]}]
 * Format B: widthRanges[], dropRanges[], prices[][]
 * Format C: widthColumns[], dropRows[], prices{"width_drop": price}
 */
export interface PricingGridContract {
  // Format A/C style
  widthColumns?: number[];
  dropRows?: number[] | { drop: number; prices: number[] }[];
  
  // Format B style
  widthRanges?: { min: number; max: number }[];
  dropRanges?: { min: number; max: number }[];
  
  // Prices - either 2D array or object with "width_drop" keys
  prices?: number[][] | Record<string, number>;
  
  // Metadata
  unit?: 'cm' | 'mm';
  currency?: string;
}

/**
 * Calculation result from the engine
 */
export interface CalculationResultContract {
  // Dimensions used (in display units for transparency)
  width_cm: number;
  drop_cm: number;
  
  // For curtains/romans
  linear_meters?: number;
  widths_required?: number;
  drops_per_width?: number;
  
  // For blinds
  sqm?: number;
  
  // Pricing breakdown
  fabric_cost: number;
  material_cost: number;
  options_cost: number;
  base_cost: number;
  
  // Totals
  subtotal: number;
  waste_amount: number;
  total: number;
  
  // Formula transparency
  formula_breakdown: FormulaBreakdown;
}

export interface FormulaBreakdown {
  // Human-readable formula steps
  steps: string[];
  
  // Values used
  values: Record<string, number | string>;
  
  // Final formula as string
  formula_string: string;
}

/**
 * Complete treatment data contract - aligned with windows_summary
 */
export interface TreatmentDataContract {
  // Identity
  id?: string;
  surface_id: string;
  project_id: string;
  
  // Classification
  treatment_category: TreatmentCategoryDbValue;
  
  // Core data
  measurements: MeasurementsContract;
  template: TemplateContract;
  
  // Optional based on type
  fabric?: FabricContract;
  material?: MaterialContract;
  
  // Selected options
  selected_options: SelectedOptionContract[];
  
  // Calculation results
  calculation_result?: CalculationResultContract;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Type guard to check if a category is valid
 */
export function isValidTreatmentCategory(value: unknown): value is TreatmentCategoryDbValue {
  return typeof value === 'string' && ALL_DB_VALUES.includes(value as TreatmentCategoryDbValue);
}

/**
 * Type guard to check if category uses linear meter calculation
 */
export function isLinearType(category: TreatmentCategoryDbValue): boolean {
  return LINEAR_TYPES.includes(category);
}

/**
 * Type guard to check if category uses area (sqm) calculation
 */
export function isAreaType(category: TreatmentCategoryDbValue): boolean {
  return AREA_TYPES.includes(category);
}

/**
 * Type guard to check if category typically uses grid pricing
 */
export function isGridType(category: TreatmentCategoryDbValue): boolean {
  return GRID_TYPES.includes(category);
}

/**
 * Type guard to check if category is not yet supported
 */
export function isUnsupportedType(category: TreatmentCategoryDbValue): boolean {
  return UNSUPPORTED_TYPES.includes(category);
}
