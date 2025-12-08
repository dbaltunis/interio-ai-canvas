/**
 * Centralized validation schemas using Zod
 * 
 * SaaS Best Practice: All input validation should be:
 * 1. Schema-based for consistency
 * 2. Reusable across client and server
 * 3. Type-safe with TypeScript inference
 * 4. Fail-loud with clear error messages
 */

import { z } from 'zod';
import { ALL_DB_VALUES, TreatmentCategoryDbValue } from './TreatmentContract';

// ============================================
// Measurement Validation
// ============================================

/**
 * Validates measurement values (must be positive numbers in MM)
 */
export const measurementValueSchema = z.number()
  .positive('Measurement must be a positive number')
  .max(100000, 'Measurement exceeds maximum allowed (100m)');

/**
 * Validates optional measurement values
 */
export const optionalMeasurementSchema = measurementValueSchema.optional();

/**
 * Complete measurements contract validation
 */
export const measurementsContractSchema = z.object({
  rail_width_mm: measurementValueSchema,
  drop_mm: measurementValueSchema,
  heading_fullness: z.number().min(1).max(5).optional(),
  return_left_mm: optionalMeasurementSchema,
  return_right_mm: optionalMeasurementSchema,
  pooling_mm: optionalMeasurementSchema,
  stack_position: z.enum(['left', 'right', 'center', 'split']).optional(),
  control_side: z.enum(['left', 'right']).optional(),
});

// ============================================
// Template Validation
// ============================================

/**
 * Validates treatment category
 */
export const treatmentCategorySchema = z.enum(ALL_DB_VALUES as [TreatmentCategoryDbValue, ...TreatmentCategoryDbValue[]], {
  errorMap: () => ({ message: `Invalid treatment category. Must be one of: ${ALL_DB_VALUES.join(', ')}` })
});

/**
 * Validates pricing type
 */
export const pricingTypeSchema = z.enum([
  'per_running_meter', 
  'per_sqm', 
  'per_drop', 
  'pricing_grid', 
  'fixed'
]);

/**
 * Validates hem values (must be non-negative numbers in CM)
 */
export const hemValueSchema = z.number()
  .nonnegative('Hem value cannot be negative')
  .max(100, 'Hem value exceeds maximum (100cm)');

/**
 * Complete template contract validation
 */
export const templateContractSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Template name is required').max(100),
  treatment_category: treatmentCategorySchema,
  pricing_type: pricingTypeSchema,
  base_price: z.number().nonnegative().optional(),
  header_hem_cm: hemValueSchema,
  bottom_hem_cm: hemValueSchema,
  side_hem_cm: hemValueSchema,
  seam_hem_cm: hemValueSchema,
  default_fullness_ratio: z.number().min(1).max(5).optional(),
  default_returns_cm: z.number().nonnegative().max(100).optional(),
  waste_percentage: z.number().min(0).max(50),
  pricing_grid_data: z.any().optional(),
  pricing_grid_id: z.string().uuid().optional(),
});

// ============================================
// Fabric Validation
// ============================================

/**
 * Validates fabric pricing method
 */
export const fabricPricingMethodSchema = z.enum([
  'per_running_meter',
  'per_sqm',
  'pricing_grid',
  'fixed'
]);

/**
 * Complete fabric contract validation
 */
export const fabricContractSchema = z.object({
  id: z.string().min(1, 'Fabric ID is required'),
  name: z.string().min(1, 'Fabric name is required').max(200),
  width_cm: z.number()
    .positive('Fabric width must be positive')
    .min(50, 'Fabric width must be at least 50cm')
    .max(400, 'Fabric width exceeds maximum (400cm)'),
  price_per_meter: z.number().nonnegative().optional(),
  price_per_sqm: z.number().nonnegative().optional(),
  pricing_method: fabricPricingMethodSchema,
  pattern_repeat_cm: z.number().nonnegative().optional(),
  railroading_allowed: z.boolean().optional(),
  pricing_grid_data: z.any().optional(),
});

// ============================================
// Option Validation
// ============================================

/**
 * Validates option pricing method
 */
export const optionPricingMethodSchema = z.enum([
  'fixed',
  'per_unit',
  'per_meter',
  'per_sqm',
  'percentage',
  'pricing_grid'
]);

/**
 * Complete selected option validation
 */
export const selectedOptionSchema = z.object({
  option_id: z.string().min(1),
  option_key: z.string().min(1),
  value_id: z.string().min(1),
  value_label: z.string().min(1),
  value_code: z.string().optional(),
  price: z.number().nonnegative(),
  pricing_method: optionPricingMethodSchema,
  percentage_of: z.enum(['base', 'fabric', 'total']).optional(),
  pricing_grid_data: z.any().optional(),
  source: z.enum(['manual', 'twc', 'template_default']).optional(),
});

// ============================================
// Calculation Input Validation
// ============================================

/**
 * Validates complete calculation input
 */
export const calculationInputSchema = z.object({
  category: treatmentCategorySchema,
  measurements: measurementsContractSchema,
  template: templateContractSchema,
  fabric: fabricContractSchema.optional(),
  material: z.any().optional(), // Material schema can be added later
  options: z.array(selectedOptionSchema).default([]),
});

// ============================================
// Validation Helper Functions
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validates data against a schema with detailed error messages
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(err => {
    const path = err.path.join('.');
    const prefix = context ? `[${context}] ` : '';
    return `${prefix}${path}: ${err.message}`;
  });
  
  // Log validation failures in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('[VALIDATION_FAILED]', { context, errors, data });
  }
  
  return { success: false, errors };
}

/**
 * Validates measurements and returns typed result or throws
 */
export function validateMeasurements(data: unknown): z.infer<typeof measurementsContractSchema> {
  const result = measurementsContractSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid measurements: ${errors}`);
  }
  return result.data;
}

/**
 * Validates template and returns typed result or throws
 */
export function validateTemplate(data: unknown): z.infer<typeof templateContractSchema> {
  const result = templateContractSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid template: ${errors}`);
  }
  return result.data;
}

/**
 * Validates fabric and returns typed result or throws
 */
export function validateFabric(data: unknown): z.infer<typeof fabricContractSchema> {
  const result = fabricContractSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid fabric: ${errors}`);
  }
  return result.data;
}

/**
 * Type exports for schema inference
 */
export type MeasurementsInput = z.infer<typeof measurementsContractSchema>;
export type TemplateInput = z.infer<typeof templateContractSchema>;
export type FabricInput = z.infer<typeof fabricContractSchema>;
export type SelectedOptionInput = z.infer<typeof selectedOptionSchema>;
export type CalculationInput = z.infer<typeof calculationInputSchema>;
