// Single source of truth for treatment categories
// This ensures consistent naming across the entire application

export const TREATMENT_CATEGORIES = {
  ROLLER_BLINDS: {
    db_value: 'roller_blinds',
    display_name: 'Roller Blinds',
    singular: 'roller_blind'
  },
  ROMAN_BLINDS: {
    db_value: 'roman_blinds',
    display_name: 'Roman Blinds',
    singular: 'roman_blind'
  },
  VENETIAN_BLINDS: {
    db_value: 'venetian_blinds',
    display_name: 'Venetian Blinds',
    singular: 'venetian_blind'
  },
  VERTICAL_BLINDS: {
    db_value: 'vertical_blinds',
    display_name: 'Vertical Blinds',
    singular: 'vertical_blind'
  },
  CELLULAR_BLINDS: {
    db_value: 'cellular_blinds',
    display_name: 'Cellular Shades',
    singular: 'cellular_shade'
  },
  PLANTATION_SHUTTERS: {
    db_value: 'plantation_shutters',
    display_name: 'Plantation Shutters',
    singular: 'plantation_shutter'
  },
  SHUTTERS: {
    db_value: 'shutters',
    display_name: 'Shutters',
    singular: 'shutter'
  },
  PANEL_GLIDE: {
    db_value: 'panel_glide',
    display_name: 'Panel Glides',
    singular: 'panel_glide'
  },
  CURTAINS: {
    db_value: 'curtains',
    display_name: 'Curtains',
    singular: 'curtain'
  },
  AWNING: {
    db_value: 'awning',
    display_name: 'Awnings',
    singular: 'awning'
  },
  WALLPAPER: {
    db_value: 'wallpaper',
    display_name: 'Wallpaper',
    singular: 'wallpaper'
  }
} as const;

// Type for database values (plural, used in treatment_options)
export type TreatmentCategoryDbValue = typeof TREATMENT_CATEGORIES[keyof typeof TREATMENT_CATEGORIES]['db_value'];

// Type for singular values (used in curtain_templates.curtain_type)
export type TreatmentCategorySingular = typeof TREATMENT_CATEGORIES[keyof typeof TREATMENT_CATEGORIES]['singular'];

// Helper function to convert singular curtain_type to plural treatment_category
export function singularToDbValue(singular: string): TreatmentCategoryDbValue {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.singular === singular
  );
  return entry?.db_value || 'curtains';
}

// Helper function to convert plural treatment_category to singular curtain_type
export function dbValueToSingular(dbValue: string): TreatmentCategorySingular {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.db_value === dbValue
  );
  return entry?.singular || 'curtain';
}

// Helper function to get display name from db_value
export function getDisplayName(dbValue: string): string {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.db_value === dbValue
  );
  return entry?.display_name || dbValue;
}

// Helper function to get display name from singular
export function getDisplayNameFromSingular(singular: string): string {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.singular === singular
  );
  return entry?.display_name || singular;
}

// All valid db_values as array
export const ALL_DB_VALUES = Object.values(TREATMENT_CATEGORIES).map(cat => cat.db_value);

// All valid singular values as array
export const ALL_SINGULAR_VALUES = Object.values(TREATMENT_CATEGORIES).map(cat => cat.singular);

// =============================================================================
// UNIFIED CATEGORIES - Single source of truth for entire app
// =============================================================================

export type ProductType = 'fabric' | 'hard_material' | 'hardware' | 'service';
export type PricingMethod = 'linear_meter' | 'grid' | 'fixed' | 'per_sqm';

export interface UnifiedCategoryConfig {
  db_value: string;
  display_name: string;
  product_type: ProductType;
  pricing_method: PricingMethod;
  inventory_subcategories: string[];  // What inventory subcategories this treatment uses
  description: string;
}

/**
 * UNIFIED_CATEGORIES - The single source of truth for treatment organization
 * 
 * This maps treatment types to:
 * - display_name: What users see in UI
 * - product_type: What kind of product it uses (fabric, hard_material, etc.)
 * - pricing_method: How it's priced (linear meter for fabrics, grid for blinds)
 * - inventory_subcategories: Which inventory items are compatible
 */
export const UNIFIED_CATEGORIES: Record<string, UnifiedCategoryConfig> = {
  // Soft Furnishings (Fabrics - priced per linear meter/yard)
  curtains: {
    db_value: 'curtains',
    display_name: 'Curtains',
    product_type: 'fabric',
    pricing_method: 'linear_meter',
    inventory_subcategories: ['curtain_fabric', 'lining_fabric', 'sheer_fabric'],
    description: 'Standard curtains with various headings'
  },
  roman_blinds: {
    db_value: 'roman_blinds',
    display_name: 'Roman Blinds',
    product_type: 'fabric',
    pricing_method: 'linear_meter',
    inventory_subcategories: ['curtain_fabric', 'roman_fabric', 'lining_fabric'],
    description: 'Fabric roman blinds'
  },
  
  // Hard Coverings (Materials - priced via pricing grids)
  roller_blinds: {
    db_value: 'roller_blinds',
    display_name: 'Roller Blinds',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['roller_fabric', 'blind_material'],
    description: 'Roller blinds with various fabrics'
  },
  venetian_blinds: {
    db_value: 'venetian_blinds',
    display_name: 'Venetian Blinds',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['venetian_slats', 'blind_material'],
    description: 'Venetian blinds - wood, aluminum, or PVC'
  },
  vertical_blinds: {
    db_value: 'vertical_blinds',
    display_name: 'Vertical Blinds',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['vertical_fabric', 'vertical_slats', 'blind_material'],
    description: 'Vertical blinds with fabric or PVC vanes'
  },
  cellular_blinds: {
    db_value: 'cellular_blinds',
    display_name: 'Cellular Shades',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['cellular', 'cellular_fabric', 'blind_material'],
    description: 'Honeycomb/cellular shades'
  },
  panel_glide: {
    db_value: 'panel_glide',
    display_name: 'Panel Glides',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['panel_glide_fabric', 'curtain_fabric', 'blind_material'],
    description: 'Panel track/glide systems'
  },
  
  // Shutters (Hard materials - grid pricing)
  shutters: {
    db_value: 'shutters',
    display_name: 'Shutters',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['shutter_material', 'blind_material'],
    description: 'Interior shutters'
  },
  plantation_shutters: {
    db_value: 'plantation_shutters',
    display_name: 'Plantation Shutters',
    product_type: 'hard_material',
    pricing_method: 'grid',
    inventory_subcategories: ['shutter_material', 'blind_material'],
    description: 'Plantation style shutters'
  },
  
  // Outdoor (Fabrics - can use linear or grid)
  awning: {
    db_value: 'awning',
    display_name: 'Awnings',
    product_type: 'fabric',
    pricing_method: 'grid',
    inventory_subcategories: ['awning_fabric'],
    description: 'Outdoor awnings'
  },
  
  // Wallcoverings
  wallpaper: {
    db_value: 'wallpaper',
    display_name: 'Wallpaper',
    product_type: 'fabric',
    pricing_method: 'fixed',
    inventory_subcategories: ['wallpaper', 'wallcovering'],
    description: 'Wallpaper and wall coverings'
  }
};

// Helper functions for unified categories

/**
 * Get all treatment types as options for dropdowns
 */
export function getTreatmentOptions(): Array<{ value: string; label: string }> {
  return Object.entries(UNIFIED_CATEGORIES).map(([key, config]) => ({
    value: key,
    label: config.display_name
  }));
}

/**
 * Get treatments filtered by product type
 */
export function getTreatmentsByProductType(productType: ProductType): Array<{ value: string; label: string }> {
  return Object.entries(UNIFIED_CATEGORIES)
    .filter(([_, config]) => config.product_type === productType)
    .map(([key, config]) => ({
      value: key,
      label: config.display_name
    }));
}

/**
 * Get the unified config for a treatment type
 */
export function getUnifiedConfig(treatmentType: string): UnifiedCategoryConfig | null {
  return UNIFIED_CATEGORIES[treatmentType] || null;
}

/**
 * Check if a treatment uses pricing grids
 */
export function usesGridPricing(treatmentType: string): boolean {
  const config = UNIFIED_CATEGORIES[treatmentType];
  return config?.pricing_method === 'grid';
}

/**
 * Get compatible inventory subcategories for a treatment
 */
export function getCompatibleSubcategories(treatmentType: string): string[] {
  const config = UNIFIED_CATEGORIES[treatmentType];
  return config?.inventory_subcategories || [];
}

/**
 * Find which treatments an inventory subcategory is compatible with
 */
export function getTreatmentsForSubcategory(subcategory: string): string[] {
  return Object.entries(UNIFIED_CATEGORIES)
    .filter(([_, config]) => config.inventory_subcategories.includes(subcategory))
    .map(([key]) => key);
}

/**
 * Auto-suggest compatible treatments based on product type
 */
export function suggestCompatibleTreatments(productType: ProductType): string[] {
  return Object.entries(UNIFIED_CATEGORIES)
    .filter(([_, config]) => config.product_type === productType)
    .map(([key]) => key);
}
