/**
 * CalculationEngine.ts
 * 
 * SINGLE SOURCE OF TRUTH for all treatment calculations.
 * Pure functions - no Supabase, no hooks, no window/document access.
 * 
 * Unit standards:
 * - Input measurements: MM (from database)
 * - Template values: CM (from template records)
 * - Fabric widths: CM (industry standard)
 * - Output: appropriate units with formula transparency
 * 
 * CRITICAL: No hidden defaults. All values must come from validated inputs.
 */

import {
  TreatmentCategoryDbValue,
  MeasurementsContract,
  TemplateContract,
  FabricContract,
  MaterialContract,
  SelectedOptionContract,
  CalculationResultContract,
  FormulaBreakdown,
  PricingGridContract,
  isLinearType,
  isAreaType,
  isUnsupportedType,
  LINEAR_TYPES,
} from '@/contracts/TreatmentContract';

import { mmToCm, cmToM, roundTo } from '@/utils/lengthUnits';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';
import { 
  CalculationError, 
  ConfigurationError, 
  ValidationError,
  assertRequired,
  assertPositive 
} from '@/utils/errorHandling';

// ============================================================
// Types
// ============================================================

export interface CalculationInput {
  category: TreatmentCategoryDbValue;
  measurements: MeasurementsContract;
  template: TemplateContract;
  fabric?: FabricContract;
  material?: MaterialContract;
  options?: SelectedOptionContract[];
}

export interface LinearCalculationResult {
  linear_meters: number;
  linear_meters_raw: number;
  widths_required: number;
  drops_per_width: number;
  total_drop_cm: number;
  total_width_cm: number;
  seams_count: number;
  formula: FormulaBreakdown;
}

export interface AreaCalculationResult {
  sqm: number;
  sqm_raw: number;
  effective_width_cm: number;
  effective_height_cm: number;
  formula: FormulaBreakdown;
}

// ============================================================
// Main Calculation Engine
// ============================================================

export class CalculationEngine {
  /**
   * Main entry point for all calculations
   */
  static calculate(input: CalculationInput): CalculationResultContract {
    const { category, measurements, template, fabric, material, options } = input;
    
    if (isUnsupportedType(category)) {
      throw new CalculationError(
        `Calculation not yet supported for category: ${category}`,
        'unsupported_category',
        { category }
      );
    }
    
    const width_cm = mmToCm(measurements.rail_width_mm);
    const drop_cm = mmToCm(measurements.drop_mm);
    
    let fabric_cost = 0;
    let material_cost = 0;
    let linear_meters: number | undefined;
    let widths_required: number | undefined;
    let drops_per_width: number | undefined;
    let sqm: number | undefined;
    let formula_breakdown: FormulaBreakdown;
    
    if (isLinearType(category)) {
      if (!fabric) {
        throw new ConfigurationError(
          `${category} requires fabric for calculation`,
          'fabric',
          ['fabric_id', 'fabric_width', 'price_per_meter']
        );
      }
      
      const linearResult = this.calculateLinear(measurements, template, fabric);
      
      linear_meters = linearResult.linear_meters;
      widths_required = linearResult.widths_required;
      drops_per_width = linearResult.drops_per_width;
      formula_breakdown = linearResult.formula;
      
      fabric_cost = this.calculateFabricCost(fabric, linear_meters, width_cm, drop_cm);
      
    } else if (isAreaType(category)) {
      const areaResult = this.calculateArea(measurements, template);
      
      sqm = areaResult.sqm;
      formula_breakdown = areaResult.formula;
      
      if (material) {
        material_cost = this.calculateMaterialCost(material, sqm, width_cm, drop_cm);
      } else if (fabric) {
        fabric_cost = this.calculateFabricCost(fabric, undefined, width_cm, drop_cm);
      }
      
    } else {
      throw new CalculationError(
        `Unknown category type: ${category}`,
        'unknown_category',
        { category }
      );
    }
    
    const options_cost = this.calculateOptionsCost(
      options || [],
      category,
      linear_meters,
      sqm,
      fabric_cost + material_cost,
      width_cm,
      drop_cm
    );
    
    const base_cost = template.base_price || 0;
    const subtotal = fabric_cost + material_cost + options_cost + base_cost;
    
    const waste_percentage = template.waste_percentage;
    const waste_amount = roundTo(subtotal * (waste_percentage / 100), 2);
    const total = roundTo(subtotal + waste_amount, 2);
    
    return {
      width_cm,
      drop_cm,
      linear_meters,
      widths_required,
      drops_per_width,
      sqm,
      fabric_cost: roundTo(fabric_cost, 2),
      material_cost: roundTo(material_cost, 2),
      options_cost: roundTo(options_cost, 2),
      base_cost: roundTo(base_cost, 2),
      subtotal: roundTo(subtotal, 2),
      waste_amount,
      total,
      formula_breakdown,
    };
  }
  
  // ============================================================
  // Linear Calculation (Curtains / Romans)
  // ============================================================
  
  static calculateLinear(
    measurements: MeasurementsContract,
    template: TemplateContract,
    fabric: FabricContract
  ): LinearCalculationResult {
    const steps: string[] = [];
    const values: Record<string, number | string> = {};
    
    const rail_width_cm = mmToCm(measurements.rail_width_mm);
    const drop_cm = mmToCm(measurements.drop_mm);
    
    values['rail_width_cm'] = rail_width_cm;
    values['drop_cm'] = drop_cm;
    
    // Fullness: user override > template default > error
    const fullness = measurements.heading_fullness ?? template.default_fullness_ratio;
    if (!fullness) {
      throw new ConfigurationError(
        'Fullness ratio is required for linear calculation (no default allowed)',
        'template',
        ['fullness_ratio', 'default_fullness_ratio']
      );
    }
    values['fullness'] = fullness;
    steps.push(`Fullness ratio: ${fullness}`);
    
    // Template values (already validated, no defaults here)
    const header_hem_cm = template.header_hem_cm;
    const bottom_hem_cm = template.bottom_hem_cm;
    const side_hem_cm = template.side_hem_cm;
    const seam_hem_cm = template.seam_hem_cm; // Total per join, NOT per side
    
    values['header_hem_cm'] = header_hem_cm;
    values['bottom_hem_cm'] = bottom_hem_cm;
    values['side_hem_cm'] = side_hem_cm;
    values['seam_hem_cm'] = seam_hem_cm;
    
    // Returns (convert from mm if provided)
    const return_left_cm = measurements.return_left_mm 
      ? mmToCm(measurements.return_left_mm) 
      : (template.default_returns_cm ?? 0);
    const return_right_cm = measurements.return_right_mm 
      ? mmToCm(measurements.return_right_mm) 
      : (template.default_returns_cm ?? 0);
    const total_returns_cm = return_left_cm + return_right_cm;
    values['total_returns_cm'] = total_returns_cm;
    
    // Pooling
    const pooling_cm = measurements.pooling_mm ? mmToCm(measurements.pooling_mm) : 0;
    values['pooling_cm'] = pooling_cm;
    
    // Fabric width
    const fabric_width_cm = fabric.width_cm;
    values['fabric_width_cm'] = fabric_width_cm;
    
    // Total drop with hems and pooling
    const total_drop_cm = drop_cm + header_hem_cm + bottom_hem_cm + pooling_cm;
    values['total_drop_cm'] = total_drop_cm;
    steps.push(`Total drop: ${drop_cm} + ${header_hem_cm} + ${bottom_hem_cm} + ${pooling_cm} = ${total_drop_cm}cm`);
    
    // Finished width with fullness
    const finished_width_cm = rail_width_cm * fullness;
    values['finished_width_cm'] = finished_width_cm;
    steps.push(`Finished width: ${rail_width_cm} × ${fullness} = ${finished_width_cm}cm`);
    
    // Total width with returns and side hems
    const total_width_cm = finished_width_cm + total_returns_cm + (side_hem_cm * 2);
    values['total_width_cm'] = total_width_cm;
    steps.push(`Total width: ${finished_width_cm} + ${total_returns_cm} + ${side_hem_cm * 2} = ${total_width_cm}cm`);
    
    // Number of widths (fabric drops needed)
    const widths_required = Math.ceil(total_width_cm / fabric_width_cm);
    values['widths_required'] = widths_required;
    steps.push(`Widths required: ceil(${total_width_cm} / ${fabric_width_cm}) = ${widths_required}`);
    
    // Seam allowance: seam_hem_cm is TOTAL per join (not per side)
    const seams_count = Math.max(0, widths_required - 1);
    const seam_allowance_cm = seams_count * seam_hem_cm;
    values['seams_count'] = seams_count;
    values['seam_allowance_cm'] = seam_allowance_cm;
    steps.push(`Seam allowance: ${seams_count} seams × ${seam_hem_cm}cm = ${seam_allowance_cm}cm`);
    
    // Total fabric length
    const total_fabric_cm = (widths_required * total_drop_cm) + seam_allowance_cm;
    values['total_fabric_cm'] = total_fabric_cm;
    steps.push(`Total fabric: (${widths_required} × ${total_drop_cm}) + ${seam_allowance_cm} = ${total_fabric_cm}cm`);
    
    // Convert to linear meters
    const linear_meters_raw = cmToM(total_fabric_cm);
    const linear_meters = roundTo(linear_meters_raw, 2);
    values['linear_meters'] = linear_meters;
    steps.push(`Linear meters: ${total_fabric_cm} / 100 = ${linear_meters}m`);
    
    return {
      linear_meters,
      linear_meters_raw,
      widths_required,
      drops_per_width: 1,
      total_drop_cm,
      total_width_cm,
      seams_count,
      formula: {
        steps,
        values,
        formula_string: `(${widths_required} widths × ${total_drop_cm}cm drop) + ${seam_allowance_cm}cm seams = ${linear_meters}m`,
      },
    };
  }
  
  // ============================================================
  // Area Calculation (Blinds)
  // ============================================================
  
  static calculateArea(
    measurements: MeasurementsContract,
    template: TemplateContract
  ): AreaCalculationResult {
    const steps: string[] = [];
    const values: Record<string, number | string> = {};
    
    const rail_width_cm = mmToCm(measurements.rail_width_mm);
    const drop_cm = mmToCm(measurements.drop_mm);
    
    values['rail_width_cm'] = rail_width_cm;
    values['drop_cm'] = drop_cm;
    
    // Template values (already validated)
    const header_hem_cm = template.header_hem_cm;
    const bottom_hem_cm = template.bottom_hem_cm;
    const side_hem_cm = template.side_hem_cm;
    
    values['header_hem_cm'] = header_hem_cm;
    values['bottom_hem_cm'] = bottom_hem_cm;
    values['side_hem_cm'] = side_hem_cm;
    
    // Effective dimensions
    const effective_width_cm = rail_width_cm + (side_hem_cm * 2);
    const effective_height_cm = drop_cm + header_hem_cm + bottom_hem_cm;
    
    values['effective_width_cm'] = effective_width_cm;
    values['effective_height_cm'] = effective_height_cm;
    steps.push(`Effective width: ${rail_width_cm} + (${side_hem_cm} × 2) = ${effective_width_cm}cm`);
    steps.push(`Effective height: ${drop_cm} + ${header_hem_cm} + ${bottom_hem_cm} = ${effective_height_cm}cm`);
    
    // Square meters
    const sqm_raw = (effective_width_cm / 100) * (effective_height_cm / 100);
    const sqm = roundTo(sqm_raw, 2);
    
    values['sqm'] = sqm;
    steps.push(`Area: (${effective_width_cm}/100) × (${effective_height_cm}/100) = ${sqm}m²`);
    
    return {
      sqm,
      sqm_raw,
      effective_width_cm,
      effective_height_cm,
      formula: {
        steps,
        values,
        formula_string: `(${effective_width_cm}cm × ${effective_height_cm}cm) / 10000 = ${sqm}m²`,
      },
    };
  }
  
  // ============================================================
  // Pricing Calculations with Grid Support
  // ============================================================
  
  /**
   * Calculate fabric cost - supports grid, per-meter, per-sqm, and fixed
   */
  static calculateFabricCost(
    fabric: FabricContract, 
    linear_meters?: number,
    width_cm?: number,
    drop_cm?: number
  ): number {
    // PRIORITY 1: Grid pricing
    if (fabric.pricing_method === 'pricing_grid' && fabric.pricing_grid_data) {
      if (width_cm && drop_cm) {
        const gridPrice = this.lookupGridPrice(fabric.pricing_grid_data, width_cm, drop_cm);
        if (gridPrice !== null && gridPrice > 0) {
          return roundTo(gridPrice, 2);
        }
      }
    }
    
    // PRIORITY 2: Per running meter
    if (fabric.pricing_method === 'per_running_meter' && fabric.price_per_meter && linear_meters) {
      return roundTo(fabric.price_per_meter * linear_meters, 2);
    }
    
    // PRIORITY 3: Per sqm
    if (fabric.pricing_method === 'per_sqm' && fabric.price_per_sqm && width_cm && drop_cm) {
      const sqm = (width_cm / 100) * (drop_cm / 100);
      return roundTo(fabric.price_per_sqm * sqm, 2);
    }
    
    // PRIORITY 4: Fixed price
    if (fabric.pricing_method === 'fixed' && fabric.price_per_meter) {
      return fabric.price_per_meter;
    }
    
    // Fallback: try available prices
    if (fabric.price_per_meter && linear_meters) {
      return roundTo(fabric.price_per_meter * linear_meters, 2);
    }
    
    return 0;
  }
  
  /**
   * Calculate material cost - supports grid, per-sqm, and fixed
   */
  static calculateMaterialCost(
    material: MaterialContract,
    sqm: number,
    width_cm: number,
    drop_cm: number
  ): number {
    // PRIORITY 1: Grid pricing
    if (material.pricing_method === 'pricing_grid' && material.pricing_grid_data) {
      const gridPrice = this.lookupGridPrice(material.pricing_grid_data, width_cm, drop_cm);
      if (gridPrice !== null && gridPrice > 0) {
        return roundTo(gridPrice, 2);
      }
    }
    
    // PRIORITY 2: Per sqm
    if (material.pricing_method === 'per_sqm' && material.price) {
      return roundTo(material.price * sqm, 2);
    }
    
    // PRIORITY 3: Fixed
    if (material.pricing_method === 'fixed' && material.price) {
      return material.price;
    }
    
    return 0;
  }
  
  /**
   * Calculate total options cost
   */
  static calculateOptionsCost(
    options: SelectedOptionContract[],
    category: TreatmentCategoryDbValue,
    linear_meters?: number,
    sqm?: number,
    base_amount?: number,
    width_cm?: number,
    drop_cm?: number
  ): number {
    let total = 0;
    
    for (const option of options) {
      const cost = this.calculateSingleOptionCost(
        option,
        category,
        linear_meters,
        sqm,
        base_amount,
        width_cm,
        drop_cm
      );
      total += cost;
    }
    
    return roundTo(total, 2);
  }
  
  /**
   * Calculate cost for a single option
   */
  static calculateSingleOptionCost(
    option: SelectedOptionContract,
    category: TreatmentCategoryDbValue,
    linear_meters?: number,
    sqm?: number,
    base_amount?: number,
    width_cm?: number,
    drop_cm?: number
  ): number {
    const { price, pricing_method } = option;
    
    switch (pricing_method) {
      case 'fixed':
      case 'per_unit':
        return price;
        
      case 'per_meter':
        if (!isLinearType(category)) {
          throw new CalculationError(
            `Option "${option.option_key}" uses per_meter pricing but category "${category}" is not a linear type`,
            'option_pricing',
            { option_key: option.option_key, category, valid_types: LINEAR_TYPES }
          );
        }
        if (!linear_meters) {
          throw new CalculationError(
            `Option "${option.option_key}" requires linear_meters but calculation did not produce it`,
            'option_pricing',
            { option_key: option.option_key }
          );
        }
        return roundTo(price * linear_meters, 2);
        
      case 'per_sqm':
        if (!sqm) {
          throw new CalculationError(
            `Option "${option.option_key}" requires sqm but calculation did not produce it`,
            'option_pricing',
            { option_key: option.option_key }
          );
        }
        return roundTo(price * sqm, 2);
        
      case 'percentage':
        if (!base_amount) {
          return 0;
        }
        return roundTo(base_amount * (price / 100), 2);
        
      case 'pricing_grid':
        if (option.pricing_grid_data && width_cm && drop_cm) {
          const gridPrice = this.lookupGridPrice(option.pricing_grid_data, width_cm, drop_cm);
          if (gridPrice !== null && gridPrice > 0) {
            return roundTo(gridPrice, 2);
          }
        }
        return price;
        
      default:
        return price;
    }
  }
  
  // ============================================================
  // Grid Pricing - Uses existing getPriceFromGrid
  // ============================================================
  
  /**
   * Lookup price from a pricing grid
   * Uses the existing getPriceFromGrid function from usePricingGrids
   * 
   * @param grid - The pricing grid data (supports all 3 formats)
   * @param width_cm - Width in centimeters
   * @param drop_cm - Drop/height in centimeters
   * @returns The price from the grid, or null if not found
   */
  static lookupGridPrice(
    grid: PricingGridContract | unknown,
    width_cm: number,
    drop_cm: number
  ): number | null {
    if (!grid) {
      return null;
    }
    
    try {
      // Use the existing getPriceFromGrid function
      // It expects width and drop in CM
      const price = getPriceFromGrid(grid, width_cm, drop_cm);
      return price > 0 ? price : null;
    } catch (error) {
      console.error('Grid price lookup failed:', error);
      return null;
    }
  }
}

// ============================================================
// Convenience Functions for Testing
// ============================================================

/**
 * Quick calculation for curtains (for testing only)
 * In production, use full CalculationEngine.calculate with validated inputs
 */
export function calculateCurtain(
  rail_width_mm: number,
  drop_mm: number,
  fabric_width_cm: number,
  fullness: number,
  template: {
    header_hem_cm: number;
    bottom_hem_cm: number;
    side_hem_cm: number;
    seam_hem_cm: number;
    waste_percentage: number;
    default_returns_cm?: number;
  }
): LinearCalculationResult {
  return CalculationEngine.calculateLinear(
    { 
      rail_width_mm, 
      drop_mm, 
      heading_fullness: fullness 
    },
    {
      id: 'test',
      name: 'Test Curtain',
      treatment_category: 'curtains',
      pricing_type: 'per_running_meter',
      header_hem_cm: template.header_hem_cm,
      bottom_hem_cm: template.bottom_hem_cm,
      side_hem_cm: template.side_hem_cm,
      seam_hem_cm: template.seam_hem_cm,
      waste_percentage: template.waste_percentage,
      default_fullness_ratio: fullness,
      default_returns_cm: template.default_returns_cm,
    },
    {
      id: 'test',
      name: 'Test Fabric',
      width_cm: fabric_width_cm,
      pricing_method: 'per_running_meter',
    }
  );
}

/**
 * Quick calculation for blinds (for testing only)
 */
export function calculateBlind(
  rail_width_mm: number,
  drop_mm: number,
  template: {
    header_hem_cm: number;
    bottom_hem_cm: number;
    side_hem_cm: number;
    waste_percentage: number;
  }
): AreaCalculationResult {
  return CalculationEngine.calculateArea(
    { rail_width_mm, drop_mm },
    {
      id: 'test',
      name: 'Test Blind',
      treatment_category: 'roller_blinds',
      pricing_type: 'per_sqm',
      header_hem_cm: template.header_hem_cm,
      bottom_hem_cm: template.bottom_hem_cm,
      side_hem_cm: template.side_hem_cm,
      seam_hem_cm: 0,
      waste_percentage: template.waste_percentage,
    }
  );
}
