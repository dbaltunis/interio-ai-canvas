/**
 * InterioApp Calculation Algorithms
 * =================================
 *
 * SINGLE ENTRY POINT for all treatment calculations.
 *
 * This module wraps the CalculationEngine and provides a unified interface
 * that should be used by ALL parts of the application:
 * - UI Calculator components
 * - Quotation system
 * - Work orders
 * - Online store (Shopify, React stores)
 * - API endpoints
 *
 * RULES:
 * 1. All calculations go through calculateTreatment()
 * 2. Results are STORED - never recalculate on display
 * 3. Both cost and selling prices are calculated together
 * 4. All units are explicit - no guessing
 *
 * Unit Standards:
 * - Input measurements: MILLIMETERS (from database/UI)
 * - Fabric widths: CENTIMETERS (industry standard)
 * - Template values: CENTIMETERS
 * - Output: includes both raw values and formatted
 */

import { CalculationEngine, CalculationInput, LinearCalculationResult, AreaCalculationResult } from '@/engine/CalculationEngine';
import { resolveMarkup, applyMarkup, MarkupResult } from '@/utils/pricing/markupResolver';
import { mmToCm, roundTo } from '@/utils/lengthUnits';
import { TreatmentCategoryDbValue, CalculationResultContract, FabricContract, MaterialContract } from '@/contracts/TreatmentContract';

// ============================================================
// Types
// ============================================================

export interface TreatmentCalculationInput {
  // Treatment identification
  treatmentCategory: TreatmentCategoryDbValue;
  treatmentType?: string;

  // Measurements (in MILLIMETERS)
  measurements: {
    rail_width_mm: number;
    drop_mm: number;
    // Optional additional measurements
    stack_left_mm?: number;
    stack_right_mm?: number;
  };

  // Template configuration (in CENTIMETERS)
  template: {
    fullness_ratio?: number;
    side_hems?: number;
    bottom_hem?: number;
    header_hem?: number;
    returns?: number;
    seam_allowance?: number;
    fabric_orientation?: 'vertical' | 'railroaded' | 'single_width';
    waste_percentage?: number;
    includes_fabric_price?: boolean;
    machine_price_per_metre?: number;
    hand_price_per_metre?: number;
    heading_type?: string;
  };

  // Fabric (if applicable)
  fabric?: {
    id: string;
    name: string;
    fabric_width_cm: number;
    cost_price?: number;
    selling_price?: number;
    price_per_meter?: number;
    pricing_method?: string;
    pricing_grid_data?: any;
    pricing_grid_markup?: number;
    pattern_repeat_vertical_cm?: number;
    pattern_repeat_horizontal_cm?: number;
  };

  // Material (for blinds/shutters)
  material?: {
    id: string;
    name: string;
    cost_price?: number;
    selling_price?: number;
    pricing_method?: string;
    pricing_grid_data?: any;
  };

  // Selected options
  options?: Array<{
    id: string;
    name: string;
    option_key: string;
    price?: number;
    cost_price?: number;
    pricing_method?: string;
    quantity?: number;
  }>;

  // Markup configuration
  markup?: {
    product_markup?: number;
    category_markup?: number;
    subcategory_markup?: number;
    global_markup?: number;
  };
}

export interface TreatmentCalculationResult {
  // Quantities
  linear_meters?: number;
  widths_required?: number;
  sqm?: number;
  cuts_required?: number;

  // Costs (raw, before markup)
  fabric_cost: number;
  material_cost: number;
  manufacturing_cost: number;
  options_cost: number;
  total_cost: number;

  // Selling prices (with markup applied)
  fabric_selling: number;
  material_selling: number;
  manufacturing_selling: number;
  options_selling: number;
  total_selling: number;

  // Markup info (for transparency)
  markup_percentage: number;
  markup_source: string;
  markup_amount: number;

  // Formula breakdown (for debugging/display)
  formula_breakdown: {
    description: string;
    steps: string[];
  };

  // Metadata
  calculated_at: string;
  algorithm_version: string;
}

// Algorithm version - increment when formulas change
const ALGORITHM_VERSION = '1.0.0';

// ============================================================
// Main Calculation Function
// ============================================================

/**
 * Calculate treatment pricing - SINGLE ENTRY POINT
 *
 * This function:
 * 1. Validates all inputs
 * 2. Performs the calculation using CalculationEngine
 * 3. Applies markup to get selling prices
 * 4. Returns BOTH cost and selling prices
 *
 * The result should be STORED in the database, not recalculated on display.
 */
export function calculateTreatment(input: TreatmentCalculationInput): TreatmentCalculationResult {
  // Convert to CalculationEngine format
  const engineInput: CalculationInput = {
    category: input.treatmentCategory,
    measurements: {
      rail_width_mm: input.measurements.rail_width_mm,
      drop_mm: input.measurements.drop_mm,
    },
    template: {
      fullness_ratio: input.template.fullness_ratio ?? 1,
      side_hem_cm: input.template.side_hems ?? 0,
      bottom_hem_cm: input.template.bottom_hem ?? 0,
      header_hem_cm: input.template.header_hem ?? 0,
      default_returns_cm: input.template.returns ?? 0,
      seam_hem_cm: input.template.seam_allowance ?? 0,
      waste_percentage: input.template.waste_percentage ?? 0,
    } as any,
    fabric: input.fabric ? {
      id: input.fabric.id,
      name: input.fabric.name,
      width_cm: input.fabric.fabric_width_cm,
      fabric_width_cm: input.fabric.fabric_width_cm,
      cost_price: input.fabric.cost_price,
      selling_price: input.fabric.selling_price,
      price_per_meter: input.fabric.price_per_meter,
      pricing_method: input.fabric.pricing_method,
      pricing_grid_data: input.fabric.pricing_grid_data,
      pricing_grid_markup: input.fabric.pricing_grid_markup,
      pattern_repeat_vertical_cm: input.fabric.pattern_repeat_vertical_cm,
      pattern_repeat_horizontal_cm: input.fabric.pattern_repeat_horizontal_cm,
    } as FabricContract : undefined,
    material: input.material ? {
      id: input.material.id,
      name: input.material.name,
      cost_price: input.material.cost_price,
      selling_price: input.material.selling_price,
      pricing_method: input.material.pricing_method as MaterialContract['pricing_method'],
      pricing_grid_data: input.material.pricing_grid_data,
    } : undefined,
    options: input.options?.map(opt => ({
      id: opt.id,
      option_key: opt.option_key,
      name: opt.name,
      price: opt.price ?? 0,
      cost_price: opt.cost_price ?? opt.price ?? 0,
      pricing_method: opt.pricing_method ?? 'fixed',
      quantity: opt.quantity ?? 1,
    })),
  };

  // Run calculation through the engine
  let engineResult: CalculationResultContract;
  try {
    engineResult = CalculationEngine.calculate(engineInput);
  } catch (error) {
    console.error('[Algorithm] Calculation error:', error);
    throw error;
  }

  // Extract costs
  const fabric_cost = engineResult.fabric_cost ?? 0;
  const material_cost = engineResult.material_cost ?? 0;
  const manufacturing_cost = engineResult.manufacturing_cost ?? 0;
  const options_cost = engineResult.options_cost ?? 0;
  const total_cost = fabric_cost + material_cost + manufacturing_cost + options_cost;

  // Resolve markup
  const markupContext = {
    productMarkup: input.markup?.product_markup,
    categoryMarkup: input.markup?.category_markup,
    subcategoryMarkup: input.markup?.subcategory_markup,
    globalMarkup: input.markup?.global_markup,
  };

  // Apply markup to get selling prices
  // Priority: product > subcategory > category > global
  const markupPercentage =
    markupContext.productMarkup ??
    markupContext.subcategoryMarkup ??
    markupContext.categoryMarkup ??
    markupContext.globalMarkup ??
    0;

  const markupMultiplier = 1 + (markupPercentage / 100);

  const fabric_selling = roundTo(fabric_cost * markupMultiplier, 2);
  const material_selling = roundTo(material_cost * markupMultiplier, 2);
  const manufacturing_selling = roundTo(manufacturing_cost * markupMultiplier, 2);
  const options_selling = roundTo(options_cost * markupMultiplier, 2);
  const total_selling = roundTo(total_cost * markupMultiplier, 2);

  const markupSource = markupContext.productMarkup !== undefined ? 'product' :
    markupContext.subcategoryMarkup !== undefined ? 'subcategory' :
    markupContext.categoryMarkup !== undefined ? 'category' :
    markupContext.globalMarkup !== undefined ? 'global' : 'none';

  // Build formula breakdown for transparency
  const formulaSteps: string[] = [];
  const formulaData = engineResult.formula_breakdown || engineResult.formula;
  if (formulaData) {
    formulaSteps.push(...(formulaData.steps || []));
  }
  formulaSteps.push(`Cost total: ${total_cost.toFixed(2)}`);
  formulaSteps.push(`Markup: ${markupPercentage}% (source: ${markupSource})`);
  formulaSteps.push(`Selling total: ${total_selling.toFixed(2)}`);

  return {
    // Quantities
    linear_meters: engineResult.linear_meters,
    widths_required: engineResult.widths_required,
    sqm: engineResult.sqm,
    cuts_required: engineResult.widths_required, // For curtains, cuts = widths

    // Costs
    fabric_cost: roundTo(fabric_cost, 2),
    material_cost: roundTo(material_cost, 2),
    manufacturing_cost: roundTo(manufacturing_cost, 2),
    options_cost: roundTo(options_cost, 2),
    total_cost: roundTo(total_cost, 2),

    // Selling prices
    fabric_selling,
    material_selling,
    manufacturing_selling,
    options_selling,
    total_selling,

    // Markup info
    markup_percentage: markupPercentage,
    markup_source: markupSource,
    markup_amount: roundTo(total_selling - total_cost, 2),

    // Formula breakdown
    formula_breakdown: {
      description: `${input.treatmentCategory} calculation`,
      steps: formulaSteps,
    },

    // Metadata
    calculated_at: new Date().toISOString(),
    algorithm_version: ALGORITHM_VERSION,
  };
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Quick calculation for display purposes (preview only)
 * Returns a simplified result for UI display
 */
export function calculateTreatmentQuick(input: TreatmentCalculationInput): {
  total_cost: number;
  total_selling: number;
  linear_meters?: number;
  sqm?: number;
} {
  const result = calculateTreatment(input);
  return {
    total_cost: result.total_cost,
    total_selling: result.total_selling,
    linear_meters: result.linear_meters,
    sqm: result.sqm,
  };
}

/**
 * Validate calculation inputs before processing
 * Returns array of validation errors (empty if valid)
 */
export function validateCalculationInput(input: TreatmentCalculationInput): string[] {
  const errors: string[] = [];

  if (!input.treatmentCategory) {
    errors.push('Treatment category is required');
  }

  if (!input.measurements.rail_width_mm || input.measurements.rail_width_mm <= 0) {
    errors.push('Valid rail width is required');
  }

  if (!input.measurements.drop_mm || input.measurements.drop_mm <= 0) {
    errors.push('Valid drop is required');
  }

  // Fabric required for curtains
  const curtainTypes = ['curtains', 'curtain', 'sheer_curtains', 'blockout_curtains', 'drapes'];
  if (curtainTypes.includes(input.treatmentCategory) && !input.fabric) {
    errors.push('Fabric is required for curtain calculations');
  }

  return errors;
}

// ============================================================
// Exports
// ============================================================

export { ALGORITHM_VERSION };
