import { TreatmentOption } from "@/hooks/useTreatmentOptions";

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates that all required treatment options have been selected
 */
export const validateTreatmentOptions = (
  treatmentOptions: TreatmentOption[],
  selections: Record<string, string>
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  treatmentOptions.forEach(option => {
    // Check required options
    if (option.required && option.visible) {
      const selectedValue = selections[option.key];
      
      if (!selectedValue || selectedValue === '') {
        errors.push({
          field: option.key,
          message: `${option.label} is required`,
          severity: 'error'
        });
      }
    }

    // Warn if option has no values to select from
    if (option.visible && (!option.option_values || option.option_values.length === 0)) {
      warnings.push({
        field: option.key,
        message: `${option.label} has no available options configured`,
        severity: 'warning'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates measurement inputs for cost calculation
 */
export const validateMeasurements = (
  measurements: Record<string, any>,
  treatmentCategory: string
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Common validations
  const width = parseFloat(measurements.rail_width || measurements.width);
  const height = parseFloat(measurements.drop || measurements.height);

  if (!width || width <= 0) {
    errors.push({
      field: 'width',
      message: 'Width must be greater than 0',
      severity: 'error'
    });
  }

  if (!height || height <= 0) {
    errors.push({
      field: 'height',
      message: 'Height must be greater than 0',
      severity: 'error'
    });
  }

  // Category-specific validations
  if (treatmentCategory === 'curtains') {
    if (!measurements.selected_heading) {
      warnings.push({
        field: 'heading',
        message: 'No heading type selected - using default',
        severity: 'warning'
      });
    }

    const fullness = parseFloat(measurements.heading_fullness);
    if (fullness && (fullness < 1.5 || fullness > 3.5)) {
      warnings.push({
        field: 'fullness',
        message: 'Fullness ratio is outside typical range (1.5 - 3.5)',
        severity: 'warning'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates that fabric is selected and has valid pricing
 */
export const validateFabricSelection = (
  selectedFabric: any
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!selectedFabric) {
    errors.push({
      field: 'fabric',
      message: 'No fabric selected',
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  const price = selectedFabric.selling_price || selectedFabric.unit_price || 0;
  if (price <= 0) {
    errors.push({
      field: 'fabric_price',
      message: 'Selected fabric has no price configured',
      severity: 'error'
    });
  }

  const fabricWidth = selectedFabric.fabric_width || selectedFabric.fabric_width_cm;
  if (!fabricWidth || fabricWidth <= 0) {
    warnings.push({
      field: 'fabric_width',
      message: 'Fabric width not specified - using default',
      severity: 'warning'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
