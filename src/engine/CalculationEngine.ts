/**
 * CalculationEngine.ts
 *
 * Treatment calculation orchestrator.
 * Delegates all math to src/engine/formulas/ (the single source of truth).
 * Pure functions - no Supabase, no hooks, no window/document access.
 *
 * Unit standards:
 * - Input measurements: MM (from database)
 * - Template values: CM (from template records)
 * - Fabric widths: CM (industry standard)
 * - Output: appropriate units with formula transparency
 *
 * CRITICAL: No hidden defaults. All values must come from validated inputs.
 * CRITICAL: All calculation math lives in src/engine/formulas/. Do NOT add
 *           inline formulas here - import from formulas/ instead.
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

// Import calculations from the SINGLE SOURCE OF TRUTH
import {
  calculateCurtainVertical,
  calculateCurtainHorizontal,
  calculateBlindSqm as formulaBlindSqm,
  type CurtainInput,
  type CurtainResult,
  type BlindInput,
} from '@/engine/formulas';

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
      
      // CRITICAL: For curtains with pricing grid, use EFFECTIVE width (with fullness, hems, returns)
      // NOT raw input width. Grid lookup uses the total fabric width that will be ordered.
      const effectiveWidthForGrid = linearResult.total_width_cm;
      const effectiveDropForGrid = drop_cm; // Drop is raw (hems are for fabric usage, not grid lookup)
      
      fabric_cost = this.calculateFabricCost(fabric, linear_meters, effectiveWidthForGrid, effectiveDropForGrid);
      
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
      // Graceful fallback for unknown/new treatment types (e.g. future TWC-synced categories)
      // Use area calculation as a safe default since most non-curtain treatments are area-based
      console.warn(`⚠️ [CalculationEngine] Unknown category "${category}" - falling back to area calculation`);
      const areaResult = this.calculateArea(measurements, template);

      sqm = areaResult.sqm;
      formula_breakdown = areaResult.formula;

      if (material) {
        material_cost = this.calculateMaterialCost(material, sqm, width_cm, drop_cm);
      } else if (fabric) {
        fabric_cost = this.calculateFabricCost(fabric, undefined, width_cm, drop_cm);
      }
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

    // NOTE: Waste percentage is now applied to LINEAR_METERS in calculateLinear()
    // This ensures the fabric_cost already reflects the waste for ordering purposes
    // No additional waste is applied to the cost subtotal
    const waste_amount = 0;  // Waste is in meters, not cost
    const total = roundTo(subtotal, 2);
    
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
    // Fullness: user override > template default > error
    const fullness = measurements.heading_fullness ?? template.default_fullness_ratio;
    if (!fullness) {
      throw new ConfigurationError(
        'Fullness ratio is required for linear calculation (no default allowed)',
        'template',
        ['fullness_ratio', 'default_fullness_ratio']
      );
    }

    // Returns (convert from mm if provided)
    const return_left_cm = measurements.return_left_mm
      ? mmToCm(measurements.return_left_mm)
      : (template.default_returns_cm ?? 0);
    const return_right_cm = measurements.return_right_mm
      ? mmToCm(measurements.return_right_mm)
      : (template.default_returns_cm ?? 0);

    // Overlap (center meeting point)
    const overlap_cm = measurements.overlap_mm
      ? mmToCm(measurements.overlap_mm)
      : (template.default_overlap_cm ?? 0);

    // Panel count
    const panel_count = measurements.panel_configuration === 'pair' ? 2 : 1;

    // Orientation
    const is_railroaded = measurements.fabric_rotated === true;

    // Build input for formulas (SINGLE SOURCE OF TRUTH)
    const curtainInput: CurtainInput = {
      railWidthCm: mmToCm(measurements.rail_width_mm),
      dropCm: mmToCm(measurements.drop_mm),
      fullness,
      fabricWidthCm: fabric.width_cm,
      panelCount: panel_count,
      headerHemCm: template.header_hem_cm,
      bottomHemCm: template.bottom_hem_cm,
      sideHemCm: template.side_hem_cm,
      seamHemCm: template.seam_hem_cm,
      returnLeftCm: return_left_cm,
      returnRightCm: return_right_cm,
      overlapCm: overlap_cm,
      poolingCm: measurements.pooling_mm ? mmToCm(measurements.pooling_mm) : 0,
      wastePercent: template.waste_percentage || 0,
    };

    // Delegate to formulas/
    const result = is_railroaded
      ? calculateCurtainHorizontal(curtainInput)
      : calculateCurtainVertical(curtainInput);

    // Convert formula breakdown format for backward compatibility
    const steps: string[] = result.breakdown.steps.map(
      s => `${s.label}: ${s.formula} = ${s.result}${s.unit}`
    );
    const values: Record<string, number | string> = {};
    for (const [k, v] of Object.entries(result.breakdown.values)) {
      values[k] = v;
    }
    values['is_railroaded'] = is_railroaded ? 'yes' : 'no';

    return {
      linear_meters: result.linearMeters,
      linear_meters_raw: result.linearMetersRaw / 100, // cm to m for raw
      widths_required: result.widthsRequired,
      drops_per_width: 1,
      total_drop_cm: result.totalDropCm,
      total_width_cm: result.totalWidthCm,
      seams_count: result.seamsCount,
      formula: {
        steps,
        values,
        formula_string: result.breakdown.summary,
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
    // Build input for formulas (SINGLE SOURCE OF TRUTH)
    const blindInput: BlindInput = {
      railWidthCm: mmToCm(measurements.rail_width_mm),
      dropCm: mmToCm(measurements.drop_mm),
      headerHemCm: template.header_hem_cm,
      bottomHemCm: template.bottom_hem_cm,
      sideHemCm: template.side_hem_cm,
      wastePercent: template.waste_percentage || 0,
    };

    // Delegate to formulas/
    const result = formulaBlindSqm(blindInput);

    // Convert formula breakdown format for backward compatibility
    const steps: string[] = result.breakdown.steps.map(
      s => `${s.label}: ${s.formula} = ${s.result}${s.unit}`
    );
    const values: Record<string, number | string> = {};
    for (const [k, v] of Object.entries(result.breakdown.values)) {
      values[k] = v;
    }

    return {
      sqm: result.sqm,
      sqm_raw: result.sqmRaw,
      effective_width_cm: result.effectiveWidthCm,
      effective_height_cm: result.effectiveHeightCm,
      formula: {
        steps,
        values,
        formula_string: result.breakdown.summary,
      },
    };
  }
  // ============================================================
  // Pricing Calculations with Grid Support
  // ============================================================
  
  /**
   * Calculate fabric cost - supports grid, per-meter, per-sqm, and fixed
   * CRITICAL: For linear types (curtains), width_cm should be EFFECTIVE width (with fullness)
   * ✅ FIX: Apply pricing_grid_markup when using grid pricing
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
        const gridMarkup = (fabric as any).pricing_grid_markup ?? 0;
        console.log('📊 FABRIC GRID LOOKUP (CalculationEngine):', {
          widthCm: width_cm,
          dropCm: drop_cm,
          pricingMethod: fabric.pricing_method,
          gridMarkup,
          gridName: (fabric as any).name || 'unknown'
        });
        const gridPrice = this.lookupGridPrice(fabric.pricing_grid_data, width_cm, drop_cm);
        if (gridPrice !== null && gridPrice > 0) {
          // ✅ FIX: Apply markup percentage
          const markupMultiplier = gridMarkup > 0 ? (1 + gridMarkup / 100) : 1;
          const priceWithMarkup = gridPrice * markupMultiplier;
          console.log('✅ FABRIC GRID PRICE:', { base: gridPrice, markup: gridMarkup, final: priceWithMarkup });
          return roundTo(priceWithMarkup, 2);
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
    default_overlap_cm?: number;
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
      default_overlap_cm: template.default_overlap_cm,
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
