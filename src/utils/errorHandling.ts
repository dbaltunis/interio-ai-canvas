/**
 * Centralized Error Handling Utilities
 * 
 * SaaS Best Practice: Consistent error handling across the application
 * - Typed error classes for different error categories
 * - User-friendly error messages
 * - Structured logging for debugging
 * - Error boundary integration support
 */

// ============================================
// Error Types
// ============================================

/**
 * Base application error with context
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Validation error - data doesn't meet requirements
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly validationErrors: string[];

  constructor(
    message: string,
    validationErrors: string[],
    field?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
    this.field = field;
    this.validationErrors = validationErrors;
  }
}

/**
 * Calculation error - something went wrong during pricing/measurement calculation
 */
export class CalculationError extends AppError {
  public readonly calculationType: string;
  public readonly inputData?: Record<string, unknown>;

  constructor(
    message: string,
    calculationType: string,
    inputData?: Record<string, unknown>
  ) {
    super(message, 'CALCULATION_ERROR', { calculationType, ...inputData });
    this.name = 'CalculationError';
    this.calculationType = calculationType;
    this.inputData = inputData;
  }
}

/**
 * Configuration error - missing or invalid template/settings
 */
export class ConfigurationError extends AppError {
  public readonly configType: string;
  public readonly missingFields: string[];

  constructor(
    message: string,
    configType: string,
    missingFields: string[]
  ) {
    super(message, 'CONFIGURATION_ERROR', { configType, missingFields });
    this.name = 'ConfigurationError';
    this.configType = configType;
    this.missingFields = missingFields;
  }
}

/**
 * Data integrity error - unexpected data state
 */
export class DataIntegrityError extends AppError {
  public readonly tableName?: string;
  public readonly recordId?: string;

  constructor(
    message: string,
    tableName?: string,
    recordId?: string
  ) {
    super(message, 'DATA_INTEGRITY_ERROR', { tableName, recordId });
    this.name = 'DataIntegrityError';
    this.tableName = tableName;
    this.recordId = recordId;
  }
}

// ============================================
// Error Handling Utilities
// ============================================

/**
 * Extracts user-friendly message from any error type
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Validation failed: ${error.validationErrors.join(', ')}`;
  }
  
  if (error instanceof CalculationError) {
    return `Calculation error: ${error.message}`;
  }
  
  if (error instanceof ConfigurationError) {
    return `Configuration incomplete: ${error.missingFields.join(', ')} are required`;
  }
  
  if (error instanceof DataIntegrityError) {
    return 'Data inconsistency detected. Please refresh and try again.';
  }
  
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Logs error with structured context (development only)
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>,
  severity: 'warn' | 'error' = 'error'
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const logData = {
    timestamp: new Date().toISOString(),
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'UnknownError',
    code: error instanceof AppError ? error.code : undefined,
    context: {
      ...(error instanceof AppError ? error.context : {}),
      ...context,
    },
    stack: error instanceof Error ? error.stack : undefined,
  };
  
  if (severity === 'warn') {
    console.warn('[APP_WARNING]', logData);
  } else {
    console.error('[APP_ERROR]', logData);
  }
}

/**
 * Wraps async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logError(error, { context });
    return { success: false, error: getUserFriendlyMessage(error) };
  }
}

/**
 * Creates a safe wrapper that catches errors and returns null
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T | null = null,
  context?: string
): T | null {
  try {
    return fn();
  } catch (error) {
    logError(error, { context }, 'warn');
    return fallback;
  }
}

/**
 * Asserts a condition and throws ConfigurationError if false
 */
export function assertConfig(
  condition: boolean,
  message: string,
  configType: string,
  missingFields: string[]
): asserts condition {
  if (!condition) {
    throw new ConfigurationError(message, configType, missingFields);
  }
}

/**
 * Asserts a value exists and throws ValidationError if not
 */
export function assertRequired<T>(
  value: T | null | undefined,
  fieldName: string,
  context?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new ValidationError(
      `${fieldName} is required`,
      [`${fieldName} is required`],
      fieldName,
      { context }
    );
  }
}

/**
 * Asserts a numeric value is positive
 */
export function assertPositive(
  value: number | undefined | null,
  fieldName: string
): asserts value is number {
  if (value === null || value === undefined || value <= 0) {
    throw new ValidationError(
      `${fieldName} must be a positive number`,
      [`${fieldName} must be greater than 0, got: ${value}`],
      fieldName
    );
  }
}
