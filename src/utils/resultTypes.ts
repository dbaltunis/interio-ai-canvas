/**
 * Result Types for SaaS Operations
 * 
 * SaaS Best Practice: Explicit success/failure handling
 * - No exceptions for expected failures
 * - Type-safe error handling
 * - Composable operations
 */

// ============================================
// Core Result Type
// ============================================

export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E; code?: string };

// ============================================
// Result Constructors
// ============================================

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function err<E = string>(error: E, code?: string): Result<never, E> {
  return { success: false, error, code };
}

// ============================================
// Result Utilities
// ============================================

/**
 * Unwraps a result, throwing if it's an error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(String((result as { success: false; error: E }).error));
}

/**
 * Unwraps a result with a default value for errors
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}

/**
 * Maps the success value of a result
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.success) {
    return ok(fn(result.data));
  }
  return result as Result<never, E>;
}

/**
 * Chains results together
 */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result as Result<never, E>;
}

/**
 * Combines multiple results into one
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  for (const result of results) {
    if (!result.success) {
      return result as Result<never, E>;
    }
    values.push(result.data);
  }
  return ok(values);
}

/**
 * Wraps a function that might throw into a Result
 */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Wraps an async function that might throw into a Result
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// ============================================
// Calculation-Specific Results
// ============================================

export interface CalculationResult {
  fabricUsage: number;
  fabricUsageUnit: string;
  totalCost: number;
  breakdown: {
    label: string;
    value: number;
    unit?: string;
  }[];
}

export interface PricingResult {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export type FabricCalculationResult = Result<CalculationResult, string>;
export type PricingCalculationResult = Result<PricingResult, string>;
