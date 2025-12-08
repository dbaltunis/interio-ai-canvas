/**
 * Configuration Validation Utilities
 * 
 * These utilities validate that required configuration exists before calculations.
 * The app should "fail loud" with clear errors instead of using hardcoded fallbacks.
 */

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

/**
 * Validates that a curtain/roman template has all required manufacturing fields
 */
export const validateCurtainTemplate = (template: any): ValidationResult => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!template) {
    return {
      isValid: false,
      missingFields: ['template'],
      warnings: ['No template selected']
    };
  }

  // Required fields for curtain calculations
  const requiredFields = [
    { key: 'fullness_ratio', alternatives: ['default_fullness', 'default_fullness_ratio'] },
    { key: 'header_hem', alternatives: ['header_allowance'] },
    { key: 'bottom_hem', alternatives: ['bottom_allowance'] },
    { key: 'side_hem', alternatives: ['side_hems'] },
  ];

  for (const field of requiredFields) {
    const hasValue = template[field.key] != null || 
      field.alternatives?.some(alt => template[alt] != null);
    
    if (!hasValue) {
      missingFields.push(field.key);
    }
  }

  // Warnings for optional but recommended fields
  if (template.waste_percent == null) {
    warnings.push('Waste percentage not configured (calculations may be inaccurate)');
  }

  if (template.seam_allowance == null && template.seam_hem == null) {
    warnings.push('Seam allowance not configured');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
};

/**
 * Validates that a blind template has required fields
 */
export const validateBlindTemplate = (template: any): ValidationResult => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!template) {
    return {
      isValid: false,
      missingFields: ['template'],
      warnings: ['No template selected']
    };
  }

  // Blind templates need pricing method
  if (!template.pricing_type && !template.pricing_method) {
    missingFields.push('pricing_type');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
};

/**
 * Validates that a fabric item has required fields for calculations
 */
export const validateFabricItem = (fabric: any): ValidationResult => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!fabric) {
    return {
      isValid: false,
      missingFields: ['fabric'],
      warnings: ['No fabric selected']
    };
  }

  // Required: fabric width is essential for all fabric calculations
  if (fabric.fabric_width == null) {
    missingFields.push('fabric_width');
  }

  // Required: some form of pricing
  const hasPricing = 
    fabric.price_per_meter != null ||
    fabric.sell_price != null ||
    fabric.pricing_grid_data != null ||
    fabric.resolved_grid_data != null;

  if (!hasPricing) {
    warnings.push('No pricing configured for this fabric');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
};

/**
 * Gets a template field value with explicit source tracking (no hardcoded fallbacks)
 * Returns null if the field is not configured
 */
export const getTemplateValue = <T>(
  template: any,
  primaryKey: string,
  alternativeKeys: string[] = []
): { value: T | null; source: string | null } => {
  if (!template) {
    return { value: null, source: null };
  }

  if (template[primaryKey] != null) {
    return { value: template[primaryKey], source: primaryKey };
  }

  for (const altKey of alternativeKeys) {
    if (template[altKey] != null) {
      return { value: template[altKey], source: altKey };
    }
  }

  return { value: null, source: null };
};

/**
 * Gets fullness ratio from template or measurements - NO HARDCODED FALLBACKS
 * Returns null if not configured (caller must handle missing value)
 */
export const getFullnessRatio = (
  template: any,
  measurements: Record<string, any>
): { value: number | null; source: string } => {
  // Priority 1: User's explicit selection in measurements
  const measurementFullness = measurements?.heading_fullness;
  if (measurementFullness != null && !isNaN(parseFloat(measurementFullness))) {
    const parsed = parseFloat(measurementFullness);
    if (parsed >= 1) {
      return { value: parsed, source: 'measurements.heading_fullness' };
    }
  }

  // Priority 2: Template default
  const templateFullness = template?.fullness_ratio ?? template?.default_fullness ?? template?.default_fullness_ratio;
  if (templateFullness != null && !isNaN(parseFloat(templateFullness))) {
    const parsed = parseFloat(templateFullness);
    if (parsed >= 1) {
      return { value: parsed, source: 'template' };
    }
  }

  // No valid fullness found - DO NOT return hardcoded fallback
  console.warn('[CONFIG_VALIDATION] No valid fullness ratio configured', {
    measurementFullness,
    templateFullness: template?.fullness_ratio,
    templateDefault: template?.default_fullness
  });
  
  return { value: null, source: 'not_configured' };
};

/**
 * Gets hem values from template - NO HARDCODED FALLBACKS
 */
export const getHemValues = (template: any): {
  header: number | null;
  bottom: number | null;
  side: number | null;
  seam: number | null;
  source: string;
} => {
  if (!template) {
    return { header: null, bottom: null, side: null, seam: null, source: 'no_template' };
  }

  return {
    header: template.header_hem ?? template.header_allowance ?? null,
    bottom: template.bottom_hem ?? template.bottom_allowance ?? null,
    side: template.side_hem ?? template.side_hems ?? null,
    seam: template.seam_allowance ?? template.seam_hem ?? null,
    source: 'template'
  };
};

/**
 * Gets fabric width from inventory item - NO HARDCODED FALLBACKS
 */
export const getFabricWidth = (
  fabricItem: any
): { value: number | null; source: string } => {
  if (!fabricItem) {
    return { value: null, source: 'no_fabric' };
  }

  if (fabricItem.fabric_width != null) {
    return { value: fabricItem.fabric_width, source: 'inventory' };
  }

  console.warn('[CONFIG_VALIDATION] Fabric item missing fabric_width', {
    fabricId: fabricItem.id,
    fabricName: fabricItem.name
  });

  return { value: null, source: 'not_configured' };
};

/**
 * Gets waste percentage from template - NO HARDCODED FALLBACKS
 */
export const getWastePercent = (template: any): { value: number; source: string } => {
  if (!template) {
    return { value: 0, source: 'default_zero' };
  }

  if (template.waste_percent != null) {
    return { value: template.waste_percent, source: 'template' };
  }

  // Waste defaults to 0 if not configured (this is acceptable)
  return { value: 0, source: 'default_zero' };
};
