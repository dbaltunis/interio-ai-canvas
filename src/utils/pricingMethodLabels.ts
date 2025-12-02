/**
 * Centralized pricing method label formatting
 * Maps pricing method codes to user-friendly display labels
 */

export const PRICING_METHOD_LABELS: Record<string, string> = {
  'per-unit': 'Per Unit',
  'per-piece': 'Per Piece',
  'per-meter': 'Per Meter',
  'per-metre': 'Per Metre',
  'per-linear-meter': 'Per Linear Meter',
  'per-running-meter': 'Per Running Meter',
  'per-sqm': 'Per Square Meter',
  'per-square-meter': 'Per Square Meter',
  'per-drop': 'Per Drop',
  'per-width': 'Per Width',
  'per-panel': 'Per Panel',
  'fixed': 'Fixed Price',
  'flat': 'Flat Rate',
  'pricing-grid': 'Grid Pricing',
  'grid': 'Grid Pricing',
};

/**
 * Get display label for a pricing method
 */
export const getPricingMethodLabel = (method: string | undefined | null): string => {
  if (!method) return '';
  
  const normalizedMethod = method.toLowerCase().trim();
  return PRICING_METHOD_LABELS[normalizedMethod] || method.replace(/-/g, ' ').replace(/_/g, ' ');
};

/**
 * Get short suffix label for pricing method (for inline display)
 */
export const getPricingMethodSuffix = (method: string | undefined | null): string => {
  if (!method) return '';
  
  const normalizedMethod = method.toLowerCase().trim();
  
  switch (normalizedMethod) {
    case 'per-meter':
    case 'per-metre':
    case 'per-linear-meter':
    case 'per-running-meter':
      return '/m';
    case 'per-sqm':
    case 'per-square-meter':
      return '/sqm';
    case 'per-drop':
      return '/drop';
    case 'per-width':
      return '/width';
    case 'per-panel':
      return '/panel';
    case 'per-unit':
    case 'per-piece':
      return '/unit';
    default:
      return '';
  }
};
