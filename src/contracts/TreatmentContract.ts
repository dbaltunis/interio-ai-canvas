/**
 * TreatmentContract.ts
 * 
 * Single source of truth for treatment data structures.
 * All measurements follow strict unit standards:
 * - Database/API: millimeters (MM)
 * - Templates: centimeters (CM) - from database records
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
  /** Rail/track width in millimeters */
  rail_width_mm: number;
  /** Drop/height in millimeters */
  drop_mm: number;
  
  /** User-selected fullness ratio (e.g., 2.0, 2.5, 3.0) */
  heading_fullness?: number;
  /** Left return in millimeters */
  return_left_mm?: number;
  /** Right return in millimeters */
  return_right_mm?: number;
  /** Pooling/puddle allowance in millimeters */
  pooling_mm?: number;
  
  /** Fabric orientation: true = railroaded/horizontal (width covers drop) */
  fabric_rotated?: boolean;
  
  // Blind-specific
  stack_position?: 'left' | 'right' | 'center' | 'split';
  control_side?: 'left' | 'right';
}

/**
 * Template configuration - ALL VALUES IN CENTIMETERS
 * These values come from curtain_templates/product_templates database records.
 * NO DEFAULTS - if these are missing, the template record is incomplete.
 */
export interface TemplateContract {
  id: string;
  name: string;
  treatment_category: TreatmentCategoryDbValue;
  
  // Pricing configuration - REQUIRED
  pricing_type: 'per_running_meter' | 'per_sqm' | 'per_drop' | 'pricing_grid' | 'fixed';
  base_price?: number;
  
  // Manufacturing values in CM - REQUIRED, no defaults
  header_hem_cm: number;
  bottom_hem_cm: number;
  side_hem_cm: number;
  /** Total seam allowance per join (not per side) */
  seam_hem_cm: number;
  
  // Curtain-specific - REQUIRED for curtains
  default_fullness_ratio?: number;
  default_returns_cm?: number;
  
  // Waste factor as percentage (e.g., 5 = 5%)
  waste_percentage: number;
  
  // Pricing grid if applicable
  pricing_grid_data?: PricingGridContract;
  pricing_grid_id?: string;
  
  // Making/Stitching charge configuration (curtains only)
  making_charge_per_meter?: number;
  making_charge_method?: 'per_meter' | 'per_panel' | 'per_unit';
  /** Heading-specific making charges: { heading_id: price } */
  heading_making_charges?: Record<string, number>;
}

/**
 * Fabric details - width ALWAYS in centimeters (industry standard)
 */
export interface FabricContract {
  id: string;
  name: string;
  /** Fabric width in centimeters - REQUIRED */
  width_cm: number;
  
  // Pricing - REQUIRED
  price_per_meter?: number;
  price_per_sqm?: number;
  pricing_method: 'per_running_meter' | 'per_sqm' | 'pricing_grid' | 'fixed';
  
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
  option_key: string;
  value_id: string;
  value_label: string;
  value_code?: string;
  
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
 */
export interface PricingGridContract {
  // Format A/C style
  widthColumns?: number[] | string[];
  dropRows?: number[] | string[] | { drop: number | string; prices: (number | string)[] }[];
  
  // Format B style
  widthRanges?: (number | string)[];
  dropRanges?: (number | string)[];
  
  // Prices - either 2D array or object with "width_drop" keys
  prices?: (number | string)[][] | Record<string, number | string>;
  
  // Metadata
  unit?: 'cm' | 'mm';
  currency?: string;
}

/**
 * Calculation result from the engine
 */
export interface CalculationResultContract {
  // Dimensions used (in CM for display)
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
  /** Making/stitching charge (curtains only) */
  making_cost: number;
  
  // Totals
  subtotal: number;
  waste_amount: number;
  total: number;
  
  // Formula transparency
  formula_breakdown: FormulaBreakdown;
}

export interface FormulaBreakdown {
  steps: string[];
  values: Record<string, number | string>;
  formula_string: string;
}

/**
 * Complete treatment data contract - aligned with windows_summary
 */
export interface TreatmentDataContract {
  id?: string;
  surface_id: string;
  project_id: string;
  
  treatment_category: TreatmentCategoryDbValue;
  
  measurements: MeasurementsContract;
  template: TemplateContract;
  
  fabric?: FabricContract;
  material?: MaterialContract;
  
  selected_options: SelectedOptionContract[];
  
  calculation_result?: CalculationResultContract;
  
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
