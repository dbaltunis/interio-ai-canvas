/**
 * CalculationEngine.ts
 * 
 * SINGLE SOURCE OF TRUTH for all treatment calculations.
 * Pure functions - no Supabase, no hooks, no window/document access.
 * 
 * Unit standards:
 * - Input measurements: MM (from database)
 * - Template values: CM
 * - Fabric widths: CM
 * - Output: appropriate units with formula transparency
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
  isLinearType,
  isAreaType,
  isUnsupportedType,
  LINEAR_TYPES,
} from '@/contracts/TreatmentContract';

import { mmToCm, cmToM, roundTo } from '@/utils/lengthUnits';

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
    
    // Check for unsupported types
    if (isUnsupportedType(category)) {
      throw new Error(`Calculation not yet supported for category: ${category}`);
    }
    
    // Convert measurements from MM to CM for calculations
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
      // Curtains / Roman Blinds - linear meter calculation
      if (!fabric) {
        throw new Error(`${category} requires fabric for calculation`);
      }
      
      const linearResult = this.calculateLinear(
        measurements,
        template,
        fabric
      );
      
      linear_meters = linearResult.linear_meters;
      widths_required = linearResult.widths_required;
      drops_per_width = linearResult.drops_per_width;
      formula_breakdown = linearResult.formula;
      
      // Calculate fabric cost
      fabric_cost = this.calculateFabricCost(fabric, linear_meters);
      
    } else if (isAreaType(category)) {
      // Blinds - SQM calculation
      const areaResult = this.calculateArea(measurements, template);
      
      sqm = areaResult.sqm;
      formula_breakdown = areaResult.formula;
      
      // Calculate material/fabric cost
      if (material) {
        material_cost = this.calculateMaterialCost(material, sqm, width_cm, drop_cm);
      } else if (fabric) {
        fabric_cost = this.calculateFabricCostSqm(fabric, sqm);
      }
      
    } else {
      throw new Error(`Unknown category type: ${category}`);
    }
    
    // Calculate options cost
    const options_cost = this.calculateOptionsCost(
      options || [],
      category,
      linear_meters,
      sqm,
      fabric_cost + material_cost
    );
    
    // Calculate base cost from template
    const base_cost = template.base_price || 0;
    
    // Subtotal before waste
    const subtotal = fabric_cost + material_cost + options_cost + base_cost;
    
    // Apply waste factor
    const waste_percentage = template.waste_percentage || 0;
    const waste_amount = roundTo(subtotal * (waste_percentage / 100), 2);
    
    // Final total
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
  
  /**
   * Calculate linear meters for curtains/roman blinds
   * Uses the centralized formula from calculationFormulas.ts concepts
   */
  static calculateLinear(
    measurements: MeasurementsContract,
    template: TemplateContract,
    fabric: FabricContract
  ): LinearCalculationResult {
    const steps: string[] = [];
    const values: Record<string, number | string> = {};
    
    // Convert measurements to CM
    const rail_width_cm = mmToCm(measurements.rail_width_mm);
    const drop_cm = mmToCm(measurements.drop_mm);
    
    values['rail_width_cm'] = rail_width_cm;
    values['drop_cm'] = drop_cm;
    
    // Get fullness - user override takes priority
    const fullness = measurements.heading_fullness || template.default_fullness_ratio || 2.5;
    values['fullness'] = fullness;
    steps.push(`Fullness ratio: ${fullness}`);
    
    // Get hem allowances from template (already in CM)
    const header_hem_cm = template.header_hem_cm;
    const bottom_hem_cm = template.bottom_hem_cm;
    const side_hem_cm = template.side_hem_cm;
    const seam_hem_cm = template.seam_hem_cm;
    
    values['header_hem_cm'] = header_hem_cm;
    values['bottom_hem_cm'] = bottom_hem_cm;
    values['side_hem_cm'] = side_hem_cm;
    values['seam_hem_cm'] = seam_hem_cm;
    
    // Returns (in CM)
    const return_left_cm = measurements.return_left_cm || template.default_returns_cm || 0;
    const return_right_cm = measurements.return_right_cm || template.default_returns_cm || 0;
    const total_returns_cm = return_left_cm + return_right_cm;
    values['total_returns_cm'] = total_returns_cm;
    
    // Pooling
    const pooling_cm = measurements.pooling_cm || 0;
    values['pooling_cm'] = pooling_cm;
    
    // Fabric width
    const fabric_width_cm = fabric.width_cm;
    values['fabric_width_cm'] = fabric_width_cm;
    
    // Calculate total drop with hems and pooling
    const total_drop_cm = drop_cm + header_hem_cm + bottom_hem_cm + pooling_cm;
    values['total_drop_cm'] = total_drop_cm;
    steps.push(`Total drop: ${drop_cm} + ${header_hem_cm} + ${bottom_hem_cm} + ${pooling_cm} = ${total_drop_cm}cm`);
    
    // Calculate finished width with fullness
    const finished_width_cm = rail_width_cm * fullness;
    values['finished_width_cm'] = finished_width_cm;
    steps.push(`Finished width: ${rail_width_cm} × ${fullness} = ${finished_width_cm}cm`);
    
    // Add returns and side hems
    const total_width_cm = finished_width_cm + total_returns_cm + (side_hem_cm * 2);
    values['total_width_cm'] = total_width_cm;
    steps.push(`Total width: ${finished_width_cm} + ${total_returns_cm} + ${side_hem_cm * 2} = ${total_width_cm}cm`);
    
    // Calculate number of widths (drops of fabric needed)
    const widths_required = Math.ceil(total_width_cm / fabric_width_cm);
    values['widths_required'] = widths_required;
    steps.push(`Widths required: ceil(${total_width_cm} / ${fabric_width_cm}) = ${widths_required}`);
    
    // Calculate seams
    const seams_count = Math.max(0, widths_required - 1);
    const seam_allowance_cm = seams_count * seam_hem_cm * 2;
    values['seams_count'] = seams_count;
    values['seam_allowance_cm'] = seam_allowance_cm;
    steps.push(`Seam allowance: ${seams_count} seams × ${seam_hem_cm * 2}cm = ${seam_allowance_cm}cm`);
    
    // Total fabric length in CM
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
      drops_per_width: 1, // Standard calculation
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
  
  /**
   * Calculate square meters for blinds
   */
  static calculateArea(
    measurements: MeasurementsContract,
    template: TemplateContract
  ): AreaCalculationResult {
    const steps: string[] = [];
    const values: Record<string, number | string> = {};
    
    // Convert measurements to CM
    const rail_width_cm = mmToCm(measurements.rail_width_mm);
    const drop_cm = mmToCm(measurements.drop_mm);
    
    values['rail_width_cm'] = rail_width_cm;
    values['drop_cm'] = drop_cm;
    
    // Get hem allowances (for blinds, typically smaller or zero)
    const header_hem_cm = template.header_hem_cm || 8;
    const bottom_hem_cm = template.bottom_hem_cm || 10;
    const side_hem_cm = template.side_hem_cm || 4;
    
    values['header_hem_cm'] = header_hem_cm;
    values['bottom_hem_cm'] = bottom_hem_cm;
    values['side_hem_cm'] = side_hem_cm;
    
    // Calculate effective dimensions
    const effective_width_cm = rail_width_cm + (side_hem_cm * 2);
    const effective_height_cm = drop_cm + header_hem_cm + bottom_hem_cm;
    
    values['effective_width_cm'] = effective_width_cm;
    values['effective_height_cm'] = effective_height_cm;
    steps.push(`Effective width: ${rail_width_cm} + (${side_hem_cm} × 2) = ${effective_width_cm}cm`);
    steps.push(`Effective height: ${drop_cm} + ${header_hem_cm} + ${bottom_hem_cm} = ${effective_height_cm}cm`);
    
    // Calculate square meters
    // Convert CM to M: divide by 100 for each dimension
    const sqm_raw = (effective_width_cm / 100) * (effective_height_cm / 100);
    const sqm = roundTo(sqm_raw, 2);
    
    values['sqm'] = sqm;
    steps.push(`Area: (${effective_width_cm}/100) × (${effective_height_cm}/100) = ${sqm}m²`);
    
    // Apply waste factor
    const waste = template.waste_percentage || 0;
    if (waste > 0) {
      const sqm_with_waste = roundTo(sqm_raw * (1 + waste / 100), 2);
      values['sqm_with_waste'] = sqm_with_waste;
      steps.push(`With ${waste}% waste: ${sqm} × ${1 + waste / 100} = ${sqm_with_waste}m²`);
    }
    
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
  // Pricing Calculations
  // ============================================================
  
  /**
   * Calculate fabric cost for linear meter pricing
   */
  static calculateFabricCost(fabric: FabricContract, linear_meters: number): number {
    if (fabric.pricing_method === 'per_running_meter' && fabric.price_per_meter) {
      return roundTo(fabric.price_per_meter * linear_meters, 2);
    }
    
    if (fabric.pricing_method === 'fixed' && fabric.price_per_meter) {
      return fabric.price_per_meter;
    }
    
    // Fallback to price_per_meter if available
    if (fabric.price_per_meter) {
      return roundTo(fabric.price_per_meter * linear_meters, 2);
    }
    
    return 0;
  }
  
  /**
   * Calculate fabric cost for SQM pricing
   */
  static calculateFabricCostSqm(fabric: FabricContract, sqm: number): number {
    if (fabric.pricing_method === 'per_sqm' && fabric.price_per_sqm) {
      return roundTo(fabric.price_per_sqm * sqm, 2);
    }
    
    if (fabric.price_per_sqm) {
      return roundTo(fabric.price_per_sqm * sqm, 2);
    }
    
    return 0;
  }
  
  /**
   * Calculate material cost for blinds
   */
  static calculateMaterialCost(
    material: MaterialContract,
    sqm: number,
    width_cm: number,
    drop_cm: number
  ): number {
    if (material.pricing_method === 'per_sqm' && material.price) {
      return roundTo(material.price * sqm, 2);
    }
    
    if (material.pricing_method === 'pricing_grid' && material.pricing_grid_data) {
      // Grid lookup would happen here
      // For now, return 0 - grid lookup will be integrated later
      return 0;
    }
    
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
    base_amount?: number
  ): number {
    let total = 0;
    
    for (const option of options) {
      const cost = this.calculateSingleOptionCost(
        option,
        category,
        linear_meters,
        sqm,
        base_amount
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
    base_amount?: number
  ): number {
    const { price, pricing_method } = option;
    
    switch (pricing_method) {
      case 'fixed':
      case 'per_unit':
        return price;
        
      case 'per_meter':
        // per_meter only valid for linear types
        if (!isLinearType(category)) {
          throw new Error(
            `Option "${option.option_key}" uses per_meter pricing but category "${category}" is not a linear type. ` +
            `per_meter pricing is only valid for: ${LINEAR_TYPES.join(', ')}`
          );
        }
        if (!linear_meters) {
          throw new Error(
            `Option "${option.option_key}" requires linear_meters but calculation did not produce it`
          );
        }
        return roundTo(price * linear_meters, 2);
        
      case 'per_sqm':
        if (!sqm) {
          throw new Error(
            `Option "${option.option_key}" requires sqm but calculation did not produce it`
          );
        }
        return roundTo(price * sqm, 2);
        
      case 'percentage':
        if (!base_amount) {
          return 0;
        }
        return roundTo(base_amount * (price / 100), 2);
        
      case 'pricing_grid':
        // Grid lookup would happen here
        // For now, return the base price
        return price;
        
      default:
        // Unknown pricing method - return base price
        return price;
    }
  }
  
  // ============================================================
  // Grid Pricing Integration Point
  // ============================================================
  
  /**
   * Lookup price from a pricing grid
   * This will integrate with existing getPriceFromGrid
   */
  static lookupGridPrice(
    grid: unknown,
    width_cm: number,
    drop_cm: number
  ): number | null {
    // This will be implemented when we integrate with usePricingGrids
    // For now, return null to indicate grid lookup not available
    return null;
  }
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Quick calculation for curtains
 */
export function calculateCurtain(
  rail_width_mm: number,
  drop_mm: number,
  fabric_width_cm: number,
  fullness: number = 2.5,
  template?: Partial<TemplateContract>
): LinearCalculationResult {
  return CalculationEngine.calculateLinear(
    { rail_width_mm, drop_mm, heading_fullness: fullness },
    {
      id: 'temp',
      name: 'Curtain',
      treatment_category: 'curtains',
      pricing_type: 'per_running_meter',
      header_hem_cm: template?.header_hem_cm ?? 8,
      bottom_hem_cm: template?.bottom_hem_cm ?? 10,
      side_hem_cm: template?.side_hem_cm ?? 4,
      seam_hem_cm: template?.seam_hem_cm ?? 2,
      waste_percentage: template?.waste_percentage ?? 0,
      default_fullness_ratio: fullness,
    },
    {
      id: 'temp',
      name: 'Fabric',
      width_cm: fabric_width_cm,
      pricing_method: 'per_running_meter',
    }
  );
}

/**
 * Quick calculation for blinds
 */
export function calculateBlind(
  rail_width_mm: number,
  drop_mm: number,
  template?: Partial<TemplateContract>
): AreaCalculationResult {
  return CalculationEngine.calculateArea(
    { rail_width_mm, drop_mm },
    {
      id: 'temp',
      name: 'Blind',
      treatment_category: 'roller_blinds',
      pricing_type: 'per_sqm',
      header_hem_cm: template?.header_hem_cm ?? 8,
      bottom_hem_cm: template?.bottom_hem_cm ?? 10,
      side_hem_cm: template?.side_hem_cm ?? 4,
      seam_hem_cm: template?.seam_hem_cm ?? 0,
      waste_percentage: template?.waste_percentage ?? 0,
    }
  );
}
