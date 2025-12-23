/**
 * PRICING METHODS - Single Source of Truth
 * 
 * All pricing method constants centralized here.
 * Use these constants throughout the app instead of hardcoded strings.
 * 
 * INDUSTRY STANDARD ALIGNMENT:
 * - Fabric: per linear meter/yard (NEVER per sqm - fabric is sold by length)
 * - Blinds: pricing grid (width × drop lookup) or per sqm for manufacturing
 * - Curtains/Romans: per running meter, per drop, per panel
 * - Wallpaper: per roll or per linear meter
 * - Hardware: fixed price or per width (actual rail width)
 * - Options: fixed, per linear meter (for tapes/trims), percentage
 */

// ============= CORE PRICING METHOD CODES =============
// These are the ONLY valid pricing method strings in the system

export const PRICING_METHODS = {
  // Fixed/Unit pricing
  FIXED: 'fixed',
  PER_UNIT: 'per-unit',
  PER_ROLL: 'per-roll',
  PER_PIECE: 'per-piece',
  
  // Linear pricing (per length)
  PER_LINEAR_METER: 'per-linear-meter',  // PRIMARY for fabric, options - use this
  PER_METRE: 'per-metre',                // Alias for backward compatibility
  PER_METER: 'per-meter',                // Alias for backward compatibility
  PER_DROP: 'per-drop',                  // Curtain manufacturing - per width drop
  PER_WIDTH: 'per-width',                // Hardware - actual rail width
  PER_PANEL: 'per-panel',                // Curtain manufacturing - per finished panel
  
  // Imperial linear (for yards-based users)
  PER_LINEAR_YARD: 'per-linear-yard',
  PER_YARD: 'per-yard',
  
  // Area pricing (for blinds/shutters manufacturing ONLY, not fabric)
  PER_SQM: 'per-sqm',                    // Blind manufacturing only
  PER_SQUARE_METER: 'per-square-meter',  // Alias
  
  // Grid-based pricing
  PRICING_GRID: 'pricing-grid',          // Width × drop lookup table
  
  // Percentage-based
  PERCENTAGE: 'percentage',
  
  // Inheritance
  INHERIT: 'inherit',
} as const;

export type PricingMethodCode = typeof PRICING_METHODS[keyof typeof PRICING_METHODS];

// ============= PRICING METHOD GROUPS =============
// Used for validation and UI filtering

export const FABRIC_PRICING_METHODS: PricingMethodCode[] = [
  PRICING_METHODS.PER_LINEAR_METER,
  PRICING_METHODS.PRICING_GRID,
  PRICING_METHODS.FIXED,
];

export const BLIND_MANUFACTURING_METHODS: PricingMethodCode[] = [
  PRICING_METHODS.PRICING_GRID,
  PRICING_METHODS.PER_SQM,
];

export const CURTAIN_MANUFACTURING_METHODS: PricingMethodCode[] = [
  PRICING_METHODS.PER_LINEAR_METER,
  PRICING_METHODS.PER_METRE,
  PRICING_METHODS.PER_DROP,
  PRICING_METHODS.PER_PANEL,
  PRICING_METHODS.PRICING_GRID,
];

export const WALLPAPER_PRICING_METHODS: PricingMethodCode[] = [
  PRICING_METHODS.PER_ROLL,
  PRICING_METHODS.PER_UNIT,
  PRICING_METHODS.PER_LINEAR_METER,
];

export const HARDWARE_PRICING_METHODS: PricingMethodCode[] = [
  PRICING_METHODS.FIXED,
  PRICING_METHODS.PER_WIDTH,
  PRICING_METHODS.PRICING_GRID,
];

export const OPTION_PRICING_METHODS: PricingMethodCode[] = [
  PRICING_METHODS.FIXED,
  PRICING_METHODS.PER_UNIT,
  PRICING_METHODS.PER_LINEAR_METER,
  PRICING_METHODS.PER_WIDTH,
  PRICING_METHODS.PRICING_GRID,
  PRICING_METHODS.PERCENTAGE,
];

// ============= DISPLAY LABELS =============
// Unit-aware labels for UI display

export interface PricingMethodLabelConfig {
  label: string;
  metricSuffix: string;
  imperialSuffix: string;
  description: string;
}

export const PRICING_METHOD_LABELS: Record<string, PricingMethodLabelConfig> = {
  [PRICING_METHODS.FIXED]: {
    label: 'Fixed Price',
    metricSuffix: '',
    imperialSuffix: '',
    description: 'Flat price per item',
  },
  [PRICING_METHODS.PER_UNIT]: {
    label: 'Per Unit',
    metricSuffix: '/unit',
    imperialSuffix: '/unit',
    description: 'Price per piece/unit',
  },
  [PRICING_METHODS.PER_ROLL]: {
    label: 'Per Roll',
    metricSuffix: '/roll',
    imperialSuffix: '/roll',
    description: 'Price per roll (wallpaper)',
  },
  [PRICING_METHODS.PER_PIECE]: {
    label: 'Per Piece',
    metricSuffix: '/piece',
    imperialSuffix: '/piece',
    description: 'Price per individual piece',
  },
  [PRICING_METHODS.PER_LINEAR_METER]: {
    label: 'Per Running Metre',
    metricSuffix: '/m',
    imperialSuffix: '/yd',
    description: 'Price per linear meter/yard of fabric',
  },
  [PRICING_METHODS.PER_METRE]: {
    label: 'Per Metre',
    metricSuffix: '/m',
    imperialSuffix: '/yd',
    description: 'Price per meter (alias for per-linear-meter)',
  },
  [PRICING_METHODS.PER_METER]: {
    label: 'Per Meter',
    metricSuffix: '/m',
    imperialSuffix: '/yd',
    description: 'Price per meter (alias for per-linear-meter)',
  },
  [PRICING_METHODS.PER_DROP]: {
    label: 'Per Drop',
    metricSuffix: '/drop',
    imperialSuffix: '/drop',
    description: 'Price per fabric width (drop)',
  },
  [PRICING_METHODS.PER_WIDTH]: {
    label: 'Per Width',
    metricSuffix: '/m width',
    imperialSuffix: '/yd width',
    description: 'Price per actual rail/track width',
  },
  [PRICING_METHODS.PER_PANEL]: {
    label: 'Per Panel',
    metricSuffix: '/panel',
    imperialSuffix: '/panel',
    description: 'Price per finished curtain panel',
  },
  [PRICING_METHODS.PER_LINEAR_YARD]: {
    label: 'Per Yard',
    metricSuffix: '/yd',
    imperialSuffix: '/yd',
    description: 'Price per linear yard',
  },
  [PRICING_METHODS.PER_YARD]: {
    label: 'Per Yard',
    metricSuffix: '/yd',
    imperialSuffix: '/yd',
    description: 'Price per yard (alias)',
  },
  [PRICING_METHODS.PER_SQM]: {
    label: 'Per m²',
    metricSuffix: '/m²',
    imperialSuffix: '/sq ft',
    description: 'Price per square meter (blinds manufacturing)',
  },
  [PRICING_METHODS.PER_SQUARE_METER]: {
    label: 'Per Square Meter',
    metricSuffix: '/m²',
    imperialSuffix: '/sq ft',
    description: 'Price per square meter (alias)',
  },
  [PRICING_METHODS.PRICING_GRID]: {
    label: 'Pricing Grid',
    metricSuffix: '',
    imperialSuffix: '',
    description: 'Lookup price from width × drop grid',
  },
  [PRICING_METHODS.PERCENTAGE]: {
    label: 'Percentage',
    metricSuffix: '%',
    imperialSuffix: '%',
    description: 'Percentage of fabric cost',
  },
  [PRICING_METHODS.INHERIT]: {
    label: 'Inherit',
    metricSuffix: '',
    imperialSuffix: '',
    description: 'Use parent pricing method',
  },
};

// ============= HELPER FUNCTIONS =============

/**
 * Get display label for a pricing method with unit awareness
 */
export const getPricingMethodLabel = (
  method: string | undefined | null,
  isMetric: boolean = true
): string => {
  if (!method) return '';
  
  const normalizedMethod = normalizePricingMethod(method);
  const config = PRICING_METHOD_LABELS[normalizedMethod];
  
  if (!config) {
    // Fallback: convert kebab-case to title case
    return method.replace(/-/g, ' ').replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return config.label;
};

/**
 * Get price suffix for display (e.g., "/m", "/yd", "/m²")
 */
export const getPricingMethodSuffix = (
  method: string | undefined | null,
  isMetric: boolean = true
): string => {
  if (!method) return '';
  
  const normalizedMethod = normalizePricingMethod(method);
  const config = PRICING_METHOD_LABELS[normalizedMethod];
  
  if (!config) return '';
  
  return isMetric ? config.metricSuffix : config.imperialSuffix;
};

/**
 * Normalize pricing method codes to canonical form
 * Handles legacy variations and converts to standard format
 */
export const normalizePricingMethod = (method: string): PricingMethodCode => {
  if (!method) return PRICING_METHODS.FIXED;
  
  const normalized = method.toLowerCase().trim()
    .replace(/_/g, '-'); // Convert underscores to hyphens
  
  // Map legacy/variant codes to canonical codes
  const mappings: Record<string, PricingMethodCode> = {
    // Linear meter variations
    'per-meter': PRICING_METHODS.PER_LINEAR_METER,
    'per-metre': PRICING_METHODS.PER_LINEAR_METER,
    'per-linear-meter': PRICING_METHODS.PER_LINEAR_METER,
    'per-running-meter': PRICING_METHODS.PER_LINEAR_METER,
    'per-running-metre': PRICING_METHODS.PER_LINEAR_METER,
    'linear-meter': PRICING_METHODS.PER_LINEAR_METER,
    'linear-metre': PRICING_METHODS.PER_LINEAR_METER,
    'per-m': PRICING_METHODS.PER_LINEAR_METER,
    
    // Linear yard variations
    'per-yard': PRICING_METHODS.PER_LINEAR_YARD,
    'per-linear-yard': PRICING_METHODS.PER_LINEAR_YARD,
    'per-running-yard': PRICING_METHODS.PER_LINEAR_YARD,
    
    // Square meter variations
    'per-sqm': PRICING_METHODS.PER_SQM,
    'per-square-meter': PRICING_METHODS.PER_SQM,
    'per-square-metre': PRICING_METHODS.PER_SQM,
    'per-m2': PRICING_METHODS.PER_SQM,
    
    // Grid variations
    'pricing-grid': PRICING_METHODS.PRICING_GRID,
    'grid': PRICING_METHODS.PRICING_GRID,
    
    // Fixed variations
    'fixed': PRICING_METHODS.FIXED,
    'fixed-price': PRICING_METHODS.FIXED,
    'flat': PRICING_METHODS.FIXED,
    'flat-rate': PRICING_METHODS.FIXED,
    
    // Unit variations
    'per-unit': PRICING_METHODS.PER_UNIT,
    'per-piece': PRICING_METHODS.PER_PIECE,
    'per-item': PRICING_METHODS.PER_UNIT,
    
    // Roll variations
    'per-roll': PRICING_METHODS.PER_ROLL,
    
    // Panel/drop/width
    'per-panel': PRICING_METHODS.PER_PANEL,
    'per-drop': PRICING_METHODS.PER_DROP,
    'per-width': PRICING_METHODS.PER_WIDTH,
    
    // Percentage
    'percentage': PRICING_METHODS.PERCENTAGE,
    'percent': PRICING_METHODS.PERCENTAGE,
    
    // Inherit
    'inherit': PRICING_METHODS.INHERIT,
  };
  
  return mappings[normalized] || (normalized as PricingMethodCode);
};

/**
 * Check if a pricing method requires area calculation (sqm)
 */
export const isAreaBasedPricing = (method: string): boolean => {
  const normalized = normalizePricingMethod(method);
  return normalized === PRICING_METHODS.PER_SQM || 
         normalized === PRICING_METHODS.PER_SQUARE_METER;
};

/**
 * Check if a pricing method requires linear calculation
 */
export const isLinearPricing = (method: string): boolean => {
  const normalized = normalizePricingMethod(method);
  const linearMethods: string[] = [
    PRICING_METHODS.PER_LINEAR_METER,
    PRICING_METHODS.PER_METRE,
    PRICING_METHODS.PER_METER,
    PRICING_METHODS.PER_LINEAR_YARD,
    PRICING_METHODS.PER_YARD,
    PRICING_METHODS.PER_WIDTH,
  ];
  return linearMethods.includes(normalized);
};

/**
 * Check if a pricing method uses grid lookup
 */
export const isGridPricing = (method: string): boolean => {
  const normalized = normalizePricingMethod(method);
  return normalized === PRICING_METHODS.PRICING_GRID;
};

/**
 * Check if a pricing method is fixed/unit-based
 */
export const isFixedPricing = (method: string): boolean => {
  const normalized = normalizePricingMethod(method);
  // NOTE: per-panel and per-drop are NOT fixed - they scale with quantity
  const fixedMethods: string[] = [
    PRICING_METHODS.FIXED,
    PRICING_METHODS.PER_UNIT,
    PRICING_METHODS.PER_PIECE,
    PRICING_METHODS.PER_ROLL,
  ];
  return fixedMethods.includes(normalized);
};

/**
 * Get valid pricing methods for a product type
 */
export const getValidPricingMethods = (
  productType: 'fabric' | 'blind' | 'curtain' | 'wallpaper' | 'hardware' | 'option'
): PricingMethodCode[] => {
  switch (productType) {
    case 'fabric':
      return FABRIC_PRICING_METHODS;
    case 'blind':
      return BLIND_MANUFACTURING_METHODS;
    case 'curtain':
      return CURTAIN_MANUFACTURING_METHODS;
    case 'wallpaper':
      return WALLPAPER_PRICING_METHODS;
    case 'hardware':
      return HARDWARE_PRICING_METHODS;
    case 'option':
      return OPTION_PRICING_METHODS;
    default:
      return [PRICING_METHODS.FIXED, PRICING_METHODS.PER_LINEAR_METER, PRICING_METHODS.PRICING_GRID];
  }
};
