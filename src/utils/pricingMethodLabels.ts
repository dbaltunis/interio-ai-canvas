/**
 * Centralized pricing method label formatting
 * Maps pricing method codes to user-friendly display labels
 * Supports unit-aware labels based on user's measurement system (metric/imperial)
 * 
 * @deprecated Use imports from @/constants/pricingMethods instead
 */

import { 
  getPricingMethodLabel as getLabel,
  getPricingMethodSuffix as getSuffix,
  PRICING_METHOD_LABELS
} from '@/constants/pricingMethods';

/**
 * Get unit-aware pricing method labels
 * @deprecated Use PRICING_METHOD_LABELS from @/constants/pricingMethods
 */
export const getPricingMethodLabels = (isMetric: boolean = true): Record<string, string> => {
  const lengthUnit = isMetric ? 'Meter' : 'Yard';
  const areaUnit = isMetric ? 'Square Meter' : 'Square Foot';
  
  return {
    'per-unit': 'Per Unit',
    'per-piece': 'Per Piece',
    'per-meter': `Per ${lengthUnit}`,
    'per-metre': `Per ${lengthUnit}`,
    'per-linear-meter': `Per Linear ${lengthUnit}`,
    'per-running-meter': `Per Running ${lengthUnit}`,
    'per-sqm': `Per ${areaUnit}`,
    'per-square-meter': `Per ${areaUnit}`,
    'per-drop': 'Per Drop',
    'per-width': 'Per Width',
    'per-panel': 'Per Panel',
    'per-roll': 'Per Roll',
    'fixed': 'Fixed Price',
    'flat': 'Flat Rate',
    'pricing-grid': 'Grid Pricing',
    'grid': 'Grid Pricing',
    'percentage': 'Percentage',
  };
};

/**
 * Get display label for a pricing method
 */
export const getPricingMethodLabel = (method: string | undefined | null, isMetric: boolean = true): string => {
  if (!method) return '';
  
  const normalizedMethod = method.toLowerCase().trim();
  const labels = getPricingMethodLabels(isMetric);
  return labels[normalizedMethod] || method.replace(/-/g, ' ').replace(/_/g, ' ');
};

/**
 * Get short suffix label for pricing method (for inline display)
 * Now unit-aware based on user's measurement system
 */
export const getPricingMethodSuffix = (method: string | undefined | null, isMetric: boolean = true): string => {
  if (!method) return '';
  
  const normalizedMethod = method.toLowerCase().trim();
  const lengthSuffix = isMetric ? '/m' : '/yd';
  const areaSuffix = isMetric ? '/m²' : '/sq ft';
  
  switch (normalizedMethod) {
    case 'per-meter':
    case 'per-metre':
    case 'per-linear-meter':
    case 'per-running-meter':
      return lengthSuffix;
    case 'per-sqm':
    case 'per-square-meter':
      return areaSuffix;
    case 'per-drop':
      return '/drop';
    case 'per-width':
      return '/width';
    case 'per-panel':
      return '/panel';
    case 'per-unit':
    case 'per-piece':
      return '/unit';
    case 'per-roll':
      return '/roll';
    case 'percentage':
      return '%';
    default:
      return '';
  }
};

/**
 * Get unit label for length (m or yd)
 */
export const getLengthUnitLabel = (isMetric: boolean = true): string => {
  return isMetric ? 'm' : 'yd';
};

/**
 * Get unit label for area (m² or sq ft)
 */
export const getAreaUnitLabel = (isMetric: boolean = true): string => {
  return isMetric ? 'm²' : 'sq ft';
};

// Re-export from centralized constants for backward compatibility
export { PRICING_METHOD_LABELS } from '@/constants/pricingMethods';
