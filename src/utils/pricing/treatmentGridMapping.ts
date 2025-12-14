/**
 * Treatment Category to Product Type Mapping for Pricing Grids
 * 
 * This file provides the mapping between:
 * - treatment_category (from templates): roller_blinds, curtains, etc.
 * - product_type (stored in pricing_grids): roller_blinds, curtains, etc.
 * - subcategory (from inventory items): roller_fabric, curtain_fabric, etc.
 * 
 * The system auto-matches pricing grids based on:
 * 1. Template's treatment_category → maps to product_type in pricing_grids
 * 2. Inventory item's price_group → matches price_group in pricing_grids
 */

// Maps treatment_category to compatible product_type values for pricing grids
// Treatment categories can match multiple product_types (e.g., romans can use roman_blinds OR curtains grids)
export const TREATMENT_TO_PRODUCT_TYPES: Record<string, string[]> = {
  // Blinds
  roller_blinds: ['roller_blinds', 'roller', 'blinds'],
  roman_blinds: ['roman_blinds', 'romans', 'roman'],
  venetian_blinds: ['venetian_blinds', 'venetian', 'blinds'],
  vertical_blinds: ['vertical_blinds', 'vertical', 'blinds'],
  cellular_blinds: ['cellular_blinds', 'cellular', 'honeycomb', 'blinds'],
  panel_glide: ['panel_glide', 'panel', 'blinds'],
  
  // Shutters
  shutters: ['shutters', 'shutter', 'plantation_shutters'],
  plantation_shutters: ['plantation_shutters', 'shutters', 'shutter'],
  
  // Curtains
  curtains: ['curtains', 'curtain'],
  
  // Other
  awning: ['awning', 'awnings'],
  wallpaper: ['wallpaper', 'wallcovering'],
  
  // Generic fallback
  blinds: ['blinds', 'roller_blinds', 'venetian_blinds', 'vertical_blinds'],
};

// Maps inventory subcategories to compatible product_types
// This helps identify which grids apply to which materials
export const SUBCATEGORY_TO_PRODUCT_TYPES: Record<string, string[]> = {
  // Fabric subcategories
  curtain_fabric: ['curtains', 'roman_blinds'],
  curtain: ['curtains', 'roman_blinds'],
  roman_fabric: ['roman_blinds', 'curtains'],
  roman_blind_fabric: ['roman_blinds'],
  roller_fabric: ['roller_blinds'],
  roller_blind_fabric: ['roller_blinds'],
  roller: ['roller_blinds'],
  blind_fabric: ['roller_blinds'],
  // Note: blind_material is too generic - handled specially in components
  cellular: ['cellular_blinds'],
  cellular_fabric: ['cellular_blinds'],
  honeycomb: ['cellular_blinds'],
  honeycomb_fabric: ['cellular_blinds'],
  panel_glide_fabric: ['panel_glide'],
  panel_fabric: ['panel_glide'],
  panel: ['panel_glide'],
  
  // Material subcategories
  venetian_slats: ['venetian_blinds'],
  venetian: ['venetian_blinds'],
  wood_slats: ['venetian_blinds'],
  aluminum_slats: ['venetian_blinds'],
  vertical_fabric: ['vertical_blinds'],
  vertical_slats: ['vertical_blinds'],
  vertical_vanes: ['vertical_blinds'],
  vertical: ['vertical_blinds'],
  shutter_material: ['shutters', 'plantation_shutters'],
  shutter_panels: ['shutters', 'plantation_shutters'],
  shutter: ['shutters', 'plantation_shutters'],
  
  // Other
  awning_fabric: ['awning'],
  awning: ['awning'],
  wallcovering: ['wallpaper'],
  wallpaper: ['wallpaper'],
  
  // InterioApp and other generic categories - excluded from auto-matching
  interioapp: [],
};

/**
 * Get product types that a treatment category should match against
 */
export function getProductTypesForTreatment(treatmentCategory: string): string[] {
  const normalized = treatmentCategory.toLowerCase().trim();
  return TREATMENT_TO_PRODUCT_TYPES[normalized] || [normalized];
}

/**
 * Get product types that an inventory subcategory should match against
 */
export function getProductTypesForSubcategory(subcategory: string): string[] {
  const normalized = subcategory.toLowerCase().trim();
  return SUBCATEGORY_TO_PRODUCT_TYPES[normalized] || [];
}

/**
 * Check if a grid's product_type matches a treatment_category
 */
export function doesGridMatchTreatment(
  gridProductType: string | null | undefined,
  treatmentCategory: string
): boolean {
  // If grid has no product_type, it's a legacy grid - show it but with lower priority
  if (!gridProductType) return true;
  
  const compatibleTypes = getProductTypesForTreatment(treatmentCategory);
  const normalizedGridType = gridProductType.toLowerCase().trim();
  
  return compatibleTypes.some(type => 
    type === normalizedGridType || 
    normalizedGridType.includes(type) ||
    type.includes(normalizedGridType)
  );
}

/**
 * Get display name for a product type
 */
export function getProductTypeDisplayName(productType: string): string {
  const displayNames: Record<string, string> = {
    roller_blinds: 'Roller Blinds',
    roman_blinds: 'Roman Blinds',
    venetian_blinds: 'Venetian Blinds',
    vertical_blinds: 'Vertical Blinds',
    cellular_blinds: 'Cellular/Honeycomb',
    panel_glide: 'Panel Glide',
    shutters: 'Shutters',
    plantation_shutters: 'Plantation Shutters',
    curtains: 'Curtains',
    awning: 'Awnings',
    wallpaper: 'Wallpaper',
  };
  
  return displayNames[productType.toLowerCase()] || productType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Parse a grid name to extract product type and price group
 * Handles formats like:
 * - "Roller Blinds - Group 1"
 * - "Romans Group A"
 * - "Venetian - Budget"
 * - "TWC Roller - 3"
 */
export function parseGridName(name: string): { productType: string | null; priceGroup: string | null } {
  if (!name) return { productType: null, priceGroup: null };
  
  const normalized = name.toLowerCase().trim();
  
  // Try to extract price group (Group X, Group-X, -X, etc.)
  let priceGroup: string | null = null;
  const groupPatterns = [
    /group\s*[-_]?\s*(\w+)/i,      // "Group 1", "Group-A", "Group_B"
    /\s+-\s+(\w+)$/i,              // "- Budget", "- 1"
    /\s+(\d+)$/,                    // trailing number
  ];
  
  for (const pattern of groupPatterns) {
    const match = name.match(pattern);
    if (match) {
      priceGroup = match[1].toUpperCase();
      break;
    }
  }
  
  // Try to extract product type
  let productType: string | null = null;
  const typePatterns: [RegExp, string][] = [
    [/roller\s*(blind)?s?/i, 'roller_blinds'],
    [/roman\s*(blind)?s?/i, 'roman_blinds'],
    [/venetian\s*(blind)?s?/i, 'venetian_blinds'],
    [/vertical\s*(blind)?s?/i, 'vertical_blinds'],
    [/cellular|honeycomb/i, 'cellular_blinds'],
    [/panel\s*(glide|track)?/i, 'panel_glide'],
    [/shutter/i, 'shutters'],
    [/curtain/i, 'curtains'],
    [/awning/i, 'awning'],
    [/wallpaper|wallcovering/i, 'wallpaper'],
  ];
  
  for (const [pattern, type] of typePatterns) {
    if (pattern.test(normalized)) {
      productType = type;
      break;
    }
  }
  
  return { productType, priceGroup };
}
