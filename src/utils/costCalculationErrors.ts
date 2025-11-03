/**
 * Error handling utilities for cost calculations
 */

export interface CostCalculationError {
  code: string;
  message: string;
  field?: string;
  recoverable: boolean;
}

/**
 * Wrap cost calculation functions with error handling
 */
export const withErrorHandling = <T>(
  fn: () => T,
  errorMessage: string = 'Cost calculation failed'
): { result: T | null; error: CostCalculationError | null } => {
  try {
    const result = fn();
    return { result, error: null };
  } catch (error) {
    console.error(errorMessage, error);
    
    const calcError: CostCalculationError = {
      code: 'CALCULATION_ERROR',
      message: error instanceof Error ? error.message : errorMessage,
      recoverable: true
    };
    
    return { result: null, error: calcError };
  }
};

/**
 * Check if required data is present for calculation
 */
export const checkRequiredData = (data: Record<string, any>, requiredFields: string[]): CostCalculationError | null => {
  const missing = requiredFields.filter(field => !data[field] || data[field] <= 0);
  
  if (missing.length > 0) {
    return {
      code: 'MISSING_DATA',
      message: `Missing required data: ${missing.join(', ')}`,
      field: missing[0],
      recoverable: true
    };
  }
  
  return null;
};

/**
 * Safely parse numeric values
 */
export const safeParseFloat = (value: any, defaultValue: number = 0): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
};

/**
 * Validate numeric range
 */
export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): CostCalculationError | null => {
  if (value < min || value > max) {
    return {
      code: 'OUT_OF_RANGE',
      message: `${fieldName} must be between ${min} and ${max}`,
      field: fieldName,
      recoverable: true
    };
  }
  return null;
};
