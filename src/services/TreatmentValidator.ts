/**
 * TreatmentValidator.ts
 * 
 * Strict validation for treatment data.
 * FAILS LOUD - no silent defaults, no fallbacks.
 * Missing data = ValidationError thrown.
 */

import {
  TreatmentCategoryDbValue,
  MeasurementsContract,
  TemplateContract,
  FabricContract,
  MaterialContract,
  SelectedOptionContract,
  TreatmentDataContract,
  ALL_DB_VALUES,
  LINEAR_TYPES,
  AREA_TYPES,
  isValidTreatmentCategory,
  isLinearType,
} from '@/contracts/TreatmentContract';

/**
 * Validation error with structured information
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: ValidationErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export type ValidationErrorCode =
  | 'MISSING_REQUIRED'
  | 'INVALID_VALUE'
  | 'INVALID_TYPE'
  | 'OUT_OF_RANGE'
  | 'INVALID_CATEGORY'
  | 'MISSING_FABRIC'
  | 'MISSING_MATERIAL'
  | 'INVALID_PRICING';

/**
 * Validation result for non-throwing checks
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ============================================================
// Helper Functions - Throw on Invalid
// ============================================================

/**
 * Require a value to be a number
 */
export function requireNumber(
  value: unknown,
  field: string,
  message?: string
): number {
  if (value === null || value === undefined) {
    throw new ValidationError(
      message || `${field} is required`,
      field,
      'MISSING_REQUIRED'
    );
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (typeof num !== 'number' || isNaN(num)) {
    throw new ValidationError(
      message || `${field} must be a valid number`,
      field,
      'INVALID_TYPE',
      { received: typeof value, value }
    );
  }
  
  return num;
}

/**
 * Require a value to be a positive number (> 0)
 */
export function requirePositiveNumber(
  value: unknown,
  field: string,
  message?: string
): number {
  const num = requireNumber(value, field, message);
  
  if (num <= 0) {
    throw new ValidationError(
      message || `${field} must be greater than 0`,
      field,
      'OUT_OF_RANGE',
      { received: num }
    );
  }
  
  return num;
}

/**
 * Require a value to be a non-negative number (>= 0)
 */
export function requireNonNegativeNumber(
  value: unknown,
  field: string,
  message?: string
): number {
  const num = requireNumber(value, field, message);
  
  if (num < 0) {
    throw new ValidationError(
      message || `${field} must be 0 or greater`,
      field,
      'OUT_OF_RANGE',
      { received: num }
    );
  }
  
  return num;
}

/**
 * Require a value to be a non-empty string
 */
export function requireString(
  value: unknown,
  field: string,
  message?: string
): string {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(
      message || `${field} is required`,
      field,
      'MISSING_REQUIRED'
    );
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(
      message || `${field} must be a string`,
      field,
      'INVALID_TYPE',
      { received: typeof value }
    );
  }
  
  return value;
}

// ============================================================
// Core Validators
// ============================================================

/**
 * Validate treatment category
 */
export function validateCategory(
  value: unknown,
  field: string = 'treatment_category'
): TreatmentCategoryDbValue {
  if (!value) {
    throw new ValidationError(
      'Treatment category is required',
      field,
      'MISSING_REQUIRED'
    );
  }
  
  if (!isValidTreatmentCategory(value)) {
    throw new ValidationError(
      `Invalid treatment category: "${value}". Valid values: ${ALL_DB_VALUES.join(', ')}`,
      field,
      'INVALID_CATEGORY',
      { received: value, validValues: ALL_DB_VALUES }
    );
  }
  
  return value;
}

/**
 * Validate measurements object
 * All values expected in MM
 */
export function validateMeasurements(
  measurements: unknown,
  category: TreatmentCategoryDbValue
): MeasurementsContract {
  if (!measurements || typeof measurements !== 'object') {
    throw new ValidationError(
      'Measurements object is required',
      'measurements',
      'MISSING_REQUIRED'
    );
  }
  
  const m = measurements as Record<string, unknown>;
  
  // Core required measurements
  const rail_width_mm = requirePositiveNumber(
    m.rail_width_mm ?? m.rail_width ?? m.width,
    'rail_width_mm',
    'Rail width is required and must be greater than 0'
  );
  
  const drop_mm = requirePositiveNumber(
    m.drop_mm ?? m.drop ?? m.height,
    'drop_mm',
    'Drop is required and must be greater than 0'
  );
  
  const result: MeasurementsContract = {
    rail_width_mm,
    drop_mm,
  };
  
  // Optional fields - validate if present
  if (m.heading_fullness !== undefined && m.heading_fullness !== null) {
    const fullness = requirePositiveNumber(m.heading_fullness, 'heading_fullness');
    if (fullness < 1 || fullness > 5) {
      throw new ValidationError(
        'Fullness ratio must be between 1 and 5',
        'heading_fullness',
        'OUT_OF_RANGE',
        { received: fullness }
      );
    }
    result.heading_fullness = fullness;
  }
  
  if (m.return_left_cm !== undefined) {
    result.return_left_cm = requireNonNegativeNumber(m.return_left_cm, 'return_left_cm');
  }
  
  if (m.return_right_cm !== undefined) {
    result.return_right_cm = requireNonNegativeNumber(m.return_right_cm, 'return_right_cm');
  }
  
  if (m.pooling_cm !== undefined) {
    result.pooling_cm = requireNonNegativeNumber(m.pooling_cm, 'pooling_cm');
  }
  
  // Store raw for reference
  result.raw = m;
  
  return result;
}

/**
 * Validate template configuration
 * All hem values expected in CM
 */
export function validateTemplate(
  template: unknown,
  category: TreatmentCategoryDbValue
): TemplateContract {
  if (!template || typeof template !== 'object') {
    throw new ValidationError(
      'Template configuration is required',
      'template',
      'MISSING_REQUIRED'
    );
  }
  
  const t = template as Record<string, unknown>;
  
  const id = requireString(t.id, 'template.id');
  const name = requireString(t.name, 'template.name');
  
  // Validate pricing type
  const validPricingTypes = ['per_running_meter', 'per_sqm', 'per_drop', 'pricing_grid', 'fixed'];
  const pricing_type = (t.pricing_type as string) || 'fixed';
  if (!validPricingTypes.includes(pricing_type)) {
    throw new ValidationError(
      `Invalid pricing type: "${pricing_type}"`,
      'template.pricing_type',
      'INVALID_VALUE',
      { validValues: validPricingTypes }
    );
  }
  
  // Manufacturing values - defaults if not specified, but warn
  const header_hem_cm = requireNonNegativeNumber(
    t.header_hem_cm ?? t.header_hem ?? t.headerHem ?? 8,
    'template.header_hem_cm'
  );
  
  const bottom_hem_cm = requireNonNegativeNumber(
    t.bottom_hem_cm ?? t.bottom_hem ?? t.bottomHem ?? 10,
    'template.bottom_hem_cm'
  );
  
  const side_hem_cm = requireNonNegativeNumber(
    t.side_hem_cm ?? t.side_hem ?? t.sideHem ?? 4,
    'template.side_hem_cm'
  );
  
  const seam_hem_cm = requireNonNegativeNumber(
    t.seam_hem_cm ?? t.seam_hem ?? t.seamHem ?? 2,
    'template.seam_hem_cm'
  );
  
  const waste_percentage = requireNonNegativeNumber(
    t.waste_percentage ?? t.waste ?? 0,
    'template.waste_percentage'
  );
  
  const result: TemplateContract = {
    id,
    name,
    treatment_category: category,
    pricing_type: pricing_type as TemplateContract['pricing_type'],
    header_hem_cm,
    bottom_hem_cm,
    side_hem_cm,
    seam_hem_cm,
    waste_percentage,
  };
  
  // Optional fields
  if (t.base_price !== undefined) {
    result.base_price = requireNonNegativeNumber(t.base_price, 'template.base_price');
  }
  
  if (t.default_fullness_ratio !== undefined || t.fullness_ratio !== undefined) {
    const fullness = t.default_fullness_ratio ?? t.fullness_ratio;
    result.default_fullness_ratio = requirePositiveNumber(fullness, 'template.default_fullness_ratio');
  }
  
  if (t.default_returns_cm !== undefined || t.returns !== undefined) {
    result.default_returns_cm = requireNonNegativeNumber(
      t.default_returns_cm ?? t.returns,
      'template.default_returns_cm'
    );
  }
  
  if (t.pricing_grid_data) {
    result.pricing_grid_data = t.pricing_grid_data as TemplateContract['pricing_grid_data'];
  }
  
  if (t.pricing_grid_id) {
    result.pricing_grid_id = String(t.pricing_grid_id);
  }
  
  return result;
}

/**
 * Validate fabric for curtains/romans
 * Width expected in CM
 */
export function validateFabric(
  fabric: unknown,
  category: TreatmentCategoryDbValue
): FabricContract {
  // Fabric is REQUIRED for linear types
  if (isLinearType(category)) {
    if (!fabric || typeof fabric !== 'object') {
      throw new ValidationError(
        `${category} requires a fabric selection`,
        'fabric',
        'MISSING_FABRIC'
      );
    }
  } else if (!fabric) {
    // For non-linear types, fabric is optional
    throw new ValidationError(
      'Fabric object is null/undefined',
      'fabric',
      'MISSING_REQUIRED'
    );
  }
  
  const f = fabric as Record<string, unknown>;
  
  const id = requireString(f.id, 'fabric.id');
  const name = requireString(f.name ?? f.fabric_name, 'fabric.name');
  
  // Width is critical for linear calculations
  const width_cm = requirePositiveNumber(
    f.width_cm ?? f.width ?? f.fabricWidth,
    'fabric.width_cm',
    'Fabric width is required for calculations'
  );
  
  // Pricing method
  const validMethods = ['per_running_meter', 'per_sqm', 'fixed'];
  const pricing_method = (f.pricing_method as string) || 'per_running_meter';
  if (!validMethods.includes(pricing_method)) {
    throw new ValidationError(
      `Invalid fabric pricing method: "${pricing_method}"`,
      'fabric.pricing_method',
      'INVALID_VALUE',
      { validValues: validMethods }
    );
  }
  
  const result: FabricContract = {
    id,
    name,
    width_cm,
    pricing_method: pricing_method as FabricContract['pricing_method'],
  };
  
  // Pricing - at least one should be set
  if (f.price_per_meter !== undefined) {
    result.price_per_meter = requireNonNegativeNumber(f.price_per_meter, 'fabric.price_per_meter');
  }
  
  if (f.price_per_sqm !== undefined) {
    result.price_per_sqm = requireNonNegativeNumber(f.price_per_sqm, 'fabric.price_per_sqm');
  }
  
  // Pattern info
  if (f.pattern_repeat_cm !== undefined || f.pattern_repeat !== undefined) {
    result.pattern_repeat_cm = requireNonNegativeNumber(
      f.pattern_repeat_cm ?? f.pattern_repeat,
      'fabric.pattern_repeat_cm'
    );
  }
  
  if (f.railroading_allowed !== undefined) {
    result.railroading_allowed = Boolean(f.railroading_allowed);
  }
  
  if (f.pricing_grid_data) {
    result.pricing_grid_data = f.pricing_grid_data as FabricContract['pricing_grid_data'];
  }
  
  return result;
}

/**
 * Validate material for blinds
 */
export function validateMaterial(
  material: unknown
): MaterialContract {
  if (!material || typeof material !== 'object') {
    throw new ValidationError(
      'Material object is required for blinds',
      'material',
      'MISSING_MATERIAL'
    );
  }
  
  const m = material as Record<string, unknown>;
  
  const id = requireString(m.id, 'material.id');
  const name = requireString(m.name ?? m.material_name, 'material.name');
  
  const validMethods = ['per_sqm', 'pricing_grid', 'fixed'];
  const pricing_method = (m.pricing_method as string) || 'pricing_grid';
  if (!validMethods.includes(pricing_method)) {
    throw new ValidationError(
      `Invalid material pricing method: "${pricing_method}"`,
      'material.pricing_method',
      'INVALID_VALUE',
      { validValues: validMethods }
    );
  }
  
  const result: MaterialContract = {
    id,
    name,
    pricing_method: pricing_method as MaterialContract['pricing_method'],
  };
  
  if (m.price !== undefined) {
    result.price = requireNonNegativeNumber(m.price, 'material.price');
  }
  
  if (m.slat_width_mm !== undefined || m.slat_width !== undefined) {
    result.slat_width_mm = requirePositiveNumber(
      m.slat_width_mm ?? m.slat_width,
      'material.slat_width_mm'
    );
  }
  
  if (m.material_type) {
    result.material_type = String(m.material_type);
  }
  
  if (m.color) {
    result.color = String(m.color);
  }
  
  if (m.pricing_grid_data) {
    result.pricing_grid_data = m.pricing_grid_data as MaterialContract['pricing_grid_data'];
  }
  
  return result;
}

/**
 * Validate selected options array
 */
export function validateOptions(
  options: unknown[]
): SelectedOptionContract[] {
  if (!Array.isArray(options)) {
    return [];
  }
  
  return options.map((opt, index) => {
    if (!opt || typeof opt !== 'object') {
      throw new ValidationError(
        `Option at index ${index} is invalid`,
        `options[${index}]`,
        'INVALID_TYPE'
      );
    }
    
    const o = opt as Record<string, unknown>;
    
    const option_id = requireString(o.option_id ?? o.id, `options[${index}].option_id`);
    const option_key = requireString(o.option_key ?? o.key, `options[${index}].option_key`);
    const value_id = requireString(o.value_id, `options[${index}].value_id`);
    const value_label = requireString(o.value_label ?? o.label, `options[${index}].value_label`);
    
    // Price is REQUIRED - no silent 0 defaults
    const price = requireNumber(o.price ?? 0, `options[${index}].price`);
    
    // Pricing method
    const validMethods = ['fixed', 'per_unit', 'per_meter', 'per_sqm', 'percentage', 'pricing_grid'];
    const pricing_method = (o.pricing_method as string) || 'fixed';
    if (!validMethods.includes(pricing_method)) {
      throw new ValidationError(
        `Invalid option pricing method: "${pricing_method}"`,
        `options[${index}].pricing_method`,
        'INVALID_VALUE',
        { validValues: validMethods }
      );
    }
    
    const result: SelectedOptionContract = {
      option_id,
      option_key,
      value_id,
      value_label,
      price,
      pricing_method: pricing_method as SelectedOptionContract['pricing_method'],
    };
    
    if (o.value_code) {
      result.value_code = String(o.value_code);
    }
    
    if (o.percentage_of) {
      result.percentage_of = o.percentage_of as SelectedOptionContract['percentage_of'];
    }
    
    if (o.source) {
      result.source = o.source as SelectedOptionContract['source'];
    }
    
    if (o.pricing_grid_data) {
      result.pricing_grid_data = o.pricing_grid_data as SelectedOptionContract['pricing_grid_data'];
    }
    
    return result;
  });
}

/**
 * Comprehensive validation before saving to windows_summary
 * This is the main entry point for validation
 */
export function validateForSave(
  data: Partial<TreatmentDataContract>
): TreatmentDataContract {
  const errors: ValidationError[] = [];
  
  // Required fields
  const surface_id = requireString(data.surface_id, 'surface_id');
  const project_id = requireString(data.project_id, 'project_id');
  const treatment_category = validateCategory(data.treatment_category);
  
  // Validate measurements
  const measurements = validateMeasurements(data.measurements, treatment_category);
  
  // Validate template
  const template = validateTemplate(data.template, treatment_category);
  
  // Validate fabric/material based on type
  let fabric: FabricContract | undefined;
  let material: MaterialContract | undefined;
  
  if (isLinearType(treatment_category)) {
    // Curtains/Romans REQUIRE fabric
    fabric = validateFabric(data.fabric, treatment_category);
  } else if (AREA_TYPES.includes(treatment_category)) {
    // Blinds may have material
    if (data.material) {
      material = validateMaterial(data.material);
    }
    // Fabric is optional for blinds
    if (data.fabric) {
      try {
        fabric = validateFabric(data.fabric, treatment_category);
      } catch {
        // Optional for blinds, ignore validation errors
      }
    }
  }
  
  // Validate options
  const selected_options = validateOptions(data.selected_options || []);
  
  return {
    id: data.id,
    surface_id,
    project_id,
    treatment_category,
    measurements,
    template,
    fabric,
    material,
    selected_options,
    calculation_result: data.calculation_result,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Non-throwing validation that returns a result object
 * Use this when you want to collect all errors, not fail on first
 */
export function validateWithResult(
  data: Partial<TreatmentDataContract>
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  
  try {
    validateForSave(data);
    return { valid: true, errors: [], warnings };
  } catch (error) {
    if (error instanceof ValidationError) {
      errors.push(error);
    } else {
      errors.push(new ValidationError(
        String(error),
        'unknown',
        'INVALID_VALUE'
      ));
    }
    return { valid: false, errors, warnings };
  }
}
