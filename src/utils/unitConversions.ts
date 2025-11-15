/**
 * Centralized Unit Conversion Utilities
 * 
 * ALL pricing and measurement calculations in the app MUST use these utilities
 * to ensure consistent, accurate conversions across the entire application.
 * 
 * IMPORTANT: These functions handle:
 * - Length unit conversions (mm, cm, m, inches, feet, yards)
 * - Price calculations with proper unit conversion
 * - Safe number parsing with fallbacks
 * - Consistent rounding
 */

// ============================================================================
// TYPES
// ============================================================================

export type LengthUnit = 'mm' | 'cm' | 'm' | 'inches' | 'feet' | 'yards';
export type PricingUnit = 'meter' | 'foot' | 'yard' | 'sqm' | 'unit';

export interface ConversionResult {
  value: number;
  unit: LengthUnit;
  originalValue: number;
  originalUnit: LengthUnit;
}

export interface PriceCalculation {
  totalPrice: number;
  pricePerUnit: number;
  quantity: number;
  unit: PricingUnit;
  formula: string; // Human-readable formula for debugging/display
}

// ============================================================================
// SAFE NUMBER PARSING
// ============================================================================

/**
 * Safely parse a number from any input, with fallback
 * Prevents NaN and Infinity issues
 */
export function safeParseNumber(value: any, fallback: number = 0): number {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed;
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// ============================================================================
// LENGTH CONVERSIONS - BASE CONVERSION TO METERS
// ============================================================================

/**
 * Convert any length unit to meters
 * This is the BASE conversion all other conversions use
 */
export function toMeters(value: number, fromUnit: LengthUnit): number {
  const val = safeParseNumber(value);
  
  switch (fromUnit) {
    case 'mm':
      return val / 1000;
    case 'cm':
      return val / 100;
    case 'm':
      return val;
    case 'inches':
      return val * 0.0254; // 1 inch = 2.54 cm
    case 'feet':
      return val * 0.3048; // 1 foot = 30.48 cm
    case 'yards':
      return val * 0.9144; // 1 yard = 91.44 cm
    default:
      console.warn(`Unknown unit: ${fromUnit}, defaulting to meters`);
      return val;
  }
}

/**
 * Convert meters to any length unit
 */
export function fromMeters(meters: number, toUnit: LengthUnit): number {
  const val = safeParseNumber(meters);
  
  switch (toUnit) {
    case 'mm':
      return val * 1000;
    case 'cm':
      return val * 100;
    case 'm':
      return val;
    case 'inches':
      return val / 0.0254;
    case 'feet':
      return val / 0.3048;
    case 'yards':
      return val / 0.9144;
    default:
      console.warn(`Unknown unit: ${toUnit}, defaulting to meters`);
      return val;
  }
}

/**
 * Convert between any two length units
 */
export function convertLength(
  value: number,
  fromUnit: LengthUnit,
  toUnit: LengthUnit
): ConversionResult {
  const meters = toMeters(value, fromUnit);
  const converted = fromMeters(meters, toUnit);
  
  return {
    value: roundTo(converted, 2),
    unit: toUnit,
    originalValue: value,
    originalUnit: fromUnit
  };
}

// ============================================================================
// PRICING UNIT CONVERSIONS
// ============================================================================

/**
 * Get the standard pricing unit for a given length unit
 * e.g., cm -> meter, inches -> foot
 */
export function getPricingUnit(lengthUnit: LengthUnit): { unit: PricingUnit; label: string } {
  switch (lengthUnit) {
    case 'mm':
    case 'cm':
    case 'm':
      return { unit: 'meter', label: 'meter' };
    case 'inches':
    case 'feet':
      return { unit: 'foot', label: 'foot' };
    case 'yards':
      return { unit: 'yard', label: 'yard' };
    default:
      return { unit: 'meter', label: 'meter' };
  }
}

/**
 * Get descriptive pricing unit label with length unit context
 * e.g., "meter (100cm)", "foot (12in)"
 */
export function getPricingUnitLabel(lengthUnit: LengthUnit): string {
  switch (lengthUnit) {
    case 'mm':
      return 'meter (1000mm)';
    case 'cm':
      return 'meter (100cm)';
    case 'm':
      return 'meter';
    case 'inches':
      return 'foot (12in)';
    case 'feet':
      return 'foot';
    case 'yards':
      return 'yard';
    default:
      return 'meter';
  }
}

// ============================================================================
// PRICE CALCULATIONS
// ============================================================================

/**
 * Calculate total price for a length-based product
 * Handles unit conversion automatically
 * 
 * Example: 
 * - pricePerMeter = €25
 * - length = 300cm
 * - Result: 300cm → 3m → 3m × €25 = €75
 */
export function calculateLengthPrice(
  length: number,
  lengthUnit: LengthUnit,
  pricePerPricingUnit: number,
  pricingUnit: PricingUnit = 'meter'
): PriceCalculation {
  const lengthValue = safeParseNumber(length);
  const priceValue = safeParseNumber(pricePerPricingUnit);
  
  // Convert length to the pricing unit
  let convertedLength: number;
  
  if (pricingUnit === 'meter') {
    convertedLength = toMeters(lengthValue, lengthUnit);
  } else if (pricingUnit === 'foot') {
    // Convert to meters first, then to feet
    const meters = toMeters(lengthValue, lengthUnit);
    convertedLength = fromMeters(meters, 'feet');
  } else if (pricingUnit === 'yard') {
    const meters = toMeters(lengthValue, lengthUnit);
    convertedLength = fromMeters(meters, 'yards');
  } else {
    // For 'unit' or 'sqm', no conversion
    convertedLength = lengthValue;
  }
  
  const totalPrice = convertedLength * priceValue;
  
  return {
    totalPrice: roundTo(totalPrice, 2),
    pricePerUnit: priceValue,
    quantity: roundTo(convertedLength, 2),
    unit: pricingUnit,
    formula: `${length}${lengthUnit} → ${roundTo(convertedLength, 2)}${pricingUnit} × ${priceValue} = ${roundTo(totalPrice, 2)}`
  };
}

/**
 * Calculate price from a pricing grid
 * Finds the closest match or interpolates if needed
 */
export function calculateGridPrice(
  requestedLength: number,
  lengthUnit: LengthUnit,
  pricingGrid: Array<{ length: number; price: number }>,
  exactMatch: boolean = false
): number {
  const lengthValue = safeParseNumber(requestedLength);
  
  if (!pricingGrid || pricingGrid.length === 0) {
    console.warn('Empty pricing grid provided');
    return 0;
  }
  
  // Sort grid by length
  const sortedGrid = [...pricingGrid].sort((a, b) => a.length - b.length);
  
  // Exact match
  const exactRow = sortedGrid.find(row => row.length === lengthValue);
  if (exactRow) {
    return safeParseNumber(exactRow.price);
  }
  
  if (exactMatch) {
    console.warn(`No exact match found for length ${lengthValue}`);
    return 0;
  }
  
  // Find closest match (round up to nearest available length)
  for (const row of sortedGrid) {
    if (row.length >= lengthValue) {
      return safeParseNumber(row.price);
    }
  }
  
  // If requested length exceeds all grid values, return highest price
  return safeParseNumber(sortedGrid[sortedGrid.length - 1].price);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a price calculation is reasonable
 */
export function validatePriceCalculation(calc: PriceCalculation): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (calc.totalPrice < 0) {
    errors.push('Price cannot be negative');
  }
  
  if (calc.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }
  
  if (calc.pricePerUnit <= 0) {
    warnings.push('Price per unit is 0 or negative');
  }
  
  if (calc.totalPrice > 100000) {
    warnings.push('Unusually high price - please verify calculation');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format a price for display with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
    'NZD': 'NZ$',
    'ZAR': 'R'
  };
  
  const symbol = symbols[currency] || currency;
  const amount = roundTo(safeParseNumber(price), 2).toFixed(2);
  
  return `${symbol}${amount}`;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage for testing and documentation
 */
export const examples = {
  simpleConversion: () => {
    // Convert 300cm to meters
    const result = convertLength(300, 'cm', 'm');
    console.log(result); // { value: 3, unit: 'm', originalValue: 300, originalUnit: 'cm' }
  },
  
  priceCalculation: () => {
    // Calculate price: 300cm at €25 per meter
    const calc = calculateLengthPrice(300, 'cm', 25, 'meter');
    console.log(calc);
    // { totalPrice: 75, pricePerUnit: 25, quantity: 3, unit: 'meter', formula: '300cm → 3meter × 25 = 75' }
  },
  
  gridPricing: () => {
    // Calculate from pricing grid
    const grid = [
      { length: 100, price: 17 },
      { length: 200, price: 34 },
      { length: 300, price: 51 }
    ];
    const price = calculateGridPrice(250, 'cm', grid);
    console.log(price); // 51 (rounds up to 300cm tier)
  }
};
