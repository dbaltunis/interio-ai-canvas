/**
 * shadowModeRunner.ts
 * 
 * Shadow mode for CalculationEngine - compares new engine vs old calculations
 * WITHOUT changing any visible prices or save logic.
 * 
 * DEV ONLY: Controlled by import.meta.env.DEV or VITE_ENABLE_ENGINE_SHADOW
 * 
 * NO HIDDEN DEFAULTS: If data is missing, we skip and log - no fake zeros.
 */
import { CalculationEngine, CalculationInput } from './CalculationEngine';
import {
  validateMeasurements,
  validateTemplate,
  validateFabric,
} from '@/services/TreatmentValidator';
import {
  TreatmentCategoryDbValue,
  MeasurementsContract,
  TemplateContract,
  FabricContract,
  SelectedOptionContract,
} from '@/contracts/TreatmentContract';

// ============================================================
// Feature Flag Check
// ============================================================

export function isShadowModeEnabled(): boolean {
  // Only run in dev mode OR when explicitly enabled
  if (import.meta.env.DEV) {
    return true;
  }
  
  if (import.meta.env.VITE_ENABLE_ENGINE_SHADOW === 'true') {
    return true;
  }
  
  return false;
}

// ============================================================
// Data Adapters - Build contracts from existing worksheet data
// NO HIDDEN DEFAULTS - if data is missing, return null and log
// ============================================================

interface WorksheetData {
  surfaceId?: string;
  projectId?: string;
  treatmentCategory: string;
  measurements: Record<string, any>;
  selectedTemplate: any;
  selectedFabric?: any;
  selectedOptions: Array<{ name: string; price: number; pricingMethod?: string; optionKey?: string; [key: string]: any }>;
  fabricCalculation?: any;
  units: { length: string };
}

/**
 * Build MeasurementsContract from worksheet measurements
 * Worksheet stores measurements in MM in the database
 */
function buildMeasurements(
  measurements: Record<string, any>,
  units: { length: string }
): MeasurementsContract | null {
  try {
    // rail_width and drop are stored in MM in the database
    const rail_width_mm = parseFloat(measurements.rail_width);
    const drop_mm = parseFloat(measurements.drop);
    
    if (!rail_width_mm || !drop_mm || isNaN(rail_width_mm) || isNaN(drop_mm)) {
      console.warn('[ENGINE_SHADOW_MEASUREMENTS_MISSING]', { 
        rail_width: measurements.rail_width, 
        drop: measurements.drop 
      });
      return null;
    }
    
    const result: MeasurementsContract = {
      rail_width_mm,
      drop_mm,
    };
    
    // Optional fields - only add if they exist
    if (measurements.heading_fullness != null) {
      const fullness = parseFloat(measurements.heading_fullness);
      if (!isNaN(fullness)) {
        result.heading_fullness = fullness;
      }
    }
    
    // Returns - stored in CM in measurements_details, convert to MM
    if (measurements.return_left != null) {
      const val = parseFloat(measurements.return_left);
      if (!isNaN(val)) {
        result.return_left_mm = val * 10;
      }
    }
    if (measurements.return_right != null) {
      const val = parseFloat(measurements.return_right);
      if (!isNaN(val)) {
        result.return_right_mm = val * 10;
      }
    }
    
    // Pooling - stored in CM, convert to MM
    if (measurements.pooling_amount != null) {
      const val = parseFloat(measurements.pooling_amount);
      if (!isNaN(val)) {
        result.pooling_mm = val * 10;
      }
    }
    
    return result;
  } catch (error) {
    console.warn('[ENGINE_SHADOW] Failed to build measurements:', error);
    return null;
  }
}

/**
 * Build TemplateContract from selected template
 * NO HIDDEN DEFAULTS - all required fields must be present
 */
function buildTemplate(
  template: any,
  category: TreatmentCategoryDbValue
): TemplateContract | null {
  if (!template) return null;
  
  try {
    // Extract raw values - NO defaults
    const headerRaw = template.header_hem_cm ?? template.header_hem ?? template.header_allowance;
    const bottomRaw = template.bottom_hem_cm ?? template.bottom_hem ?? template.bottom_allowance;
    const sideRaw = template.side_hem_cm ?? template.side_hem ?? template.side_hems;
    const seamRaw = template.seam_hem_cm ?? template.seam_hem ?? template.seam_allowance ?? template.seam_hems;
    const wasteRaw = template.waste_percentage ?? template.waste_percent ?? template.waste;
    
    // Check for missing required fields
    if (
      headerRaw == null ||
      bottomRaw == null ||
      sideRaw == null ||
      seamRaw == null ||
      wasteRaw == null ||
      !template.pricing_type
    ) {
      console.warn('[ENGINE_SHADOW_TEMPLATE_MISSING]', {
        templateId: template.id,
        templateName: template.name,
        missing: {
          header_hem: headerRaw == null,
          bottom_hem: bottomRaw == null,
          side_hem: sideRaw == null,
          seam_hem: seamRaw == null,
          waste: wasteRaw == null,
          pricing_type: !template.pricing_type,
        }
      });
      return null;
    }
    
    const header_hem_cm = parseFloat(headerRaw);
    const bottom_hem_cm = parseFloat(bottomRaw);
    const side_hem_cm = parseFloat(sideRaw);
    const seam_hem_cm = parseFloat(seamRaw);
    const waste_percentage = parseFloat(wasteRaw);
    
    // Check for invalid numbers
    if (
      [header_hem_cm, bottom_hem_cm, side_hem_cm, seam_hem_cm, waste_percentage].some(
        v => isNaN(v)
      )
    ) {
      console.warn('[ENGINE_SHADOW_TEMPLATE_INVALID]', {
        templateId: template.id,
        values: { header_hem_cm, bottom_hem_cm, side_hem_cm, seam_hem_cm, waste_percentage }
      });
      return null;
    }
    
    const result: TemplateContract = {
      id: template.id || 'unknown',
      name: template.name || 'Unknown Template',
      treatment_category: category,
      pricing_type: template.pricing_type, // NO default
      header_hem_cm,
      bottom_hem_cm,
      side_hem_cm,
      seam_hem_cm,
      waste_percentage,
    };
    
    if (template.base_price != null) {
      result.base_price = parseFloat(template.base_price);
    }
    
    if (template.fullness_ratio != null || template.default_fullness_ratio != null) {
      result.default_fullness_ratio = parseFloat(
        template.fullness_ratio ?? template.default_fullness_ratio
      );
    }
    
    if (template.default_returns_cm != null) {
      result.default_returns_cm = parseFloat(template.default_returns_cm);
    }
    
    if (template.pricing_grid_data) {
      result.pricing_grid_data = template.pricing_grid_data;
    }
    
    return result;
  } catch (error) {
    console.warn('[ENGINE_SHADOW] Failed to build template:', error);
    return null;
  }
}

/**
 * Build FabricContract from selected fabric item
 * NO HIDDEN DEFAULTS - width and pricing_method are required
 */
function buildFabric(fabric: any): FabricContract | null {
  if (!fabric) return null;
  
  try {
    const widthRaw = fabric.fabric_width ?? fabric.width_cm ?? fabric.width;
    if (widthRaw == null) {
      console.warn('[ENGINE_SHADOW_FABRIC_MISSING_WIDTH]', { 
        fabricId: fabric.id,
        fabricName: fabric.name 
      });
      return null;
    }
    
    const width_cm = parseFloat(widthRaw);
    if (!width_cm || isNaN(width_cm)) {
      console.warn('[ENGINE_SHADOW_FABRIC_INVALID_WIDTH]', { 
        fabricId: fabric.id, 
        widthRaw 
      });
      return null;
    }
    
    if (!fabric.pricing_method) {
      console.warn('[ENGINE_SHADOW_FABRIC_MISSING_PRICING_METHOD]', { 
        fabricId: fabric.id,
        fabricName: fabric.name 
      });
      return null;
    }
    
    const result: FabricContract = {
      id: fabric.id || fabric.fabric_id || 'unknown',
      name: fabric.name || 'Unknown Fabric',
      width_cm,
      pricing_method: fabric.pricing_method, // NO default
    };
    
    if (fabric.price_per_meter != null || fabric.selling_price != null || fabric.unit_price != null) {
      result.price_per_meter = parseFloat(
        fabric.price_per_meter ?? fabric.selling_price ?? fabric.unit_price
      );
    }
    
    if (fabric.price_per_sqm != null) {
      result.price_per_sqm = parseFloat(fabric.price_per_sqm);
    }
    
    if (fabric.pattern_repeat_cm != null || fabric.pattern_repeat_vertical != null) {
      result.pattern_repeat_cm = parseFloat(
        fabric.pattern_repeat_cm ?? fabric.pattern_repeat_vertical
      );
    }
    
    if (fabric.pricing_grid_data || fabric.resolved_grid_data) {
      result.pricing_grid_data = fabric.pricing_grid_data ?? fabric.resolved_grid_data;
    }
    
    return result;
  } catch (error) {
    console.warn('[ENGINE_SHADOW] Failed to build fabric:', error);
    return null;
  }
}

/**
 * Build SelectedOptionContract array from worksheet options
 * Skip options with missing price or pricing_method - log and exclude
 */
function buildOptions(options: any[]): SelectedOptionContract[] {
  if (!options || !Array.isArray(options)) return [];
  
  return options.flatMap((opt, index) => {
    try {
      const rawPrice = opt.price;
      const pricing_method = opt.pricingMethod || opt.pricing_method;
      
      // Skip options with missing required fields
      if (rawPrice == null || pricing_method == null) {
        console.warn('[ENGINE_SHADOW_OPTION_SKIPPED]', { 
          optionName: opt.name,
          optionKey: opt.optionKey || opt.option_key,
          index,
          missingPrice: rawPrice == null,
          missingPricingMethod: pricing_method == null,
        });
        return [];
      }
      
      const price = parseFloat(rawPrice);
      if (isNaN(price)) {
        console.warn('[ENGINE_SHADOW_OPTION_INVALID_PRICE]', { 
          optionName: opt.name,
          rawPrice,
          index 
        });
        return [];
      }
      
      return [{
        option_id: opt.option_id || opt.id || `option_${index}`,
        option_key: opt.optionKey || opt.option_key || opt.name || `key_${index}`,
        value_id: opt.value_id || opt.id || `value_${index}`,
        value_label: opt.value_label || opt.name || 'Unknown',
        price,
        pricing_method: pricing_method as SelectedOptionContract['pricing_method'],
        pricing_grid_data: opt.pricingGridData || opt.pricing_grid_data,
      }];
    } catch (error) {
      console.warn('[ENGINE_SHADOW_OPTION_ERROR]', { opt, index, error });
      return [];
    }
  });
}

// ============================================================
// Shadow Mode Runner
// ============================================================

interface ShadowResult {
  success: boolean;
  oldTotal: number;
  newTotal?: number;
  diff?: number;
  diffPct?: number;
  error?: Error;
  engineResult?: ReturnType<typeof CalculationEngine.calculate>;
}

/**
 * Run shadow mode comparison for curtains/romans
 * 
 * @param worksheetData - Current worksheet state
 * @param oldTotal - The total calculated by the old system
 */
export function runShadowComparison(
  worksheetData: WorksheetData,
  oldTotal: number
): ShadowResult {
  if (!isShadowModeEnabled()) {
    return { success: false, oldTotal, error: new Error('Shadow mode disabled') };
  }
  
  const { surfaceId, projectId, treatmentCategory, measurements, selectedTemplate, selectedFabric, selectedOptions, units } = worksheetData;
  
  // Only process curtains and roman_blinds for now
  if (treatmentCategory !== 'curtains' && treatmentCategory !== 'roman_blinds') {
    return { success: false, oldTotal };
  }
  
  try {
    // Step 1: Build contracts from worksheet data
    const measContract = buildMeasurements(measurements, units);
    if (!measContract) {
      throw new Error('Failed to build measurements contract - missing or invalid data');
    }
    
    const category = treatmentCategory as TreatmentCategoryDbValue;
    const templateContract = buildTemplate(selectedTemplate, category);
    if (!templateContract) {
      throw new Error('Failed to build template contract - missing required fields');
    }
    
    const fabricContract = buildFabric(selectedFabric);
    if (!fabricContract) {
      throw new Error('Fabric is required for curtains/roman_blinds - missing or invalid');
    }
    
    const optionsContract = buildOptions(selectedOptions);
    
    // Step 2: Validate using TreatmentValidator functions
    // Note: We catch validation errors and log them rather than throwing
    // This is shadow mode - we don't want to break the user's flow
    try {
      validateMeasurements(measContract, category);
      validateTemplate(templateContract, category);
      validateFabric(fabricContract, category);
    } catch (validationError) {
      console.warn('[ENGINE_SHADOW_VALIDATION]', {
        windowId: surfaceId,
        projectId,
        category,
        error: validationError,
      });
      // Continue anyway for comparison purposes
    }
    
    // Step 3: Run new calculation engine
    const input: CalculationInput = {
      category,
      measurements: measContract,
      template: templateContract,
      fabric: fabricContract,
      options: optionsContract,
    };
    
    const engineResult = CalculationEngine.calculate(input);
    
    // Step 4: Compare results
    const newTotal = engineResult.total;
    const diff = Math.abs(newTotal - oldTotal);
    const diffPct = diff / (oldTotal || 1);
    
    // Log based on difference threshold
    if (diffPct <= 0.01) {
      // Match within 1% - log at debug level
      console.debug('[ENGINE_SHADOW_MATCH]', {
        windowId: surfaceId,
        projectId,
        category,
        oldTotal,
        newTotal,
        diffPct: `${(diffPct * 100).toFixed(2)}%`,
      });
    } else {
      // Significant difference - log warning
      console.warn('[ENGINE_SHADOW_DIFF]', {
        windowId: surfaceId,
        projectId,
        category,
        oldTotal,
        newTotal,
        diff: diff.toFixed(2),
        diffPct: `${(diffPct * 100).toFixed(2)}%`,
        measurements: measContract,
        templateId: templateContract.id,
        templateName: templateContract.name,
        fabricId: fabricContract.id,
        fabricName: fabricContract.name,
        optionsCount: optionsContract.length,
        formula: engineResult.formula_breakdown,
      });
    }
    
    return {
      success: true,
      oldTotal,
      newTotal,
      diff,
      diffPct,
      engineResult,
    };
    
  } catch (error) {
    console.warn('[ENGINE_SHADOW_ERROR]', {
      windowId: surfaceId,
      projectId,
      category: treatmentCategory,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      success: false,
      oldTotal,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Quick shadow check for curtain calculations
 * Can be called from useFabricCalculator or similar hooks
 */
export function shadowCheckCurtainCalculation(
  surfaceId: string | undefined,
  projectId: string | undefined,
  measurements: Record<string, any>,
  template: any,
  fabric: any,
  options: any[],
  oldLinearMeters: number,
  oldFabricCost: number,
  oldTotalCost: number,
  units: { length: string }
): void {
  if (!isShadowModeEnabled()) return;
  
  // Only for curtains/romans
  const category = template?.treatment_category || template?.curtain_type;
  if (category !== 'curtains' && category !== 'roman_blinds') return;
  
  runShadowComparison(
    {
      surfaceId,
      projectId,
      treatmentCategory: category,
      measurements,
      selectedTemplate: template,
      selectedFabric: fabric,
      selectedOptions: options,
      units,
    },
    oldTotalCost
  );
}
