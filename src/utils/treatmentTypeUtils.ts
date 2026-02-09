/**
 * treatmentTypeUtils.ts
 *
 * SINGLE SOURCE OF TRUTH for treatment type detection.
 * Eliminates fragmented string-based checks across the codebase.
 *
 * Uses UNIFIED_CATEGORIES from treatmentCategories.ts as the source of truth.
 */

import {
  UNIFIED_CATEGORIES,
  TreatmentCategoryDbValue
} from '@/types/treatmentCategories';
import {
  isLinearType as contractIsLinearType,
  isAreaType as contractIsAreaType,
  isGridType as contractIsGridType,
  isValidTreatmentCategory,
  LINEAR_TYPES,
  AREA_TYPES,
  GRID_TYPES
} from '@/contracts/TreatmentContract';

// ============================================================
// Core Detection Functions - Use these instead of .includes()
// ============================================================

/**
 * Check if a treatment category is a blind type (any blind)
 * Includes: roller, venetian, vertical, cellular, zebra, panel_glide blinds
 */
export function isBlindType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();

  // Check against known blind categories
  const blindCategories = [
    'roller_blinds',
    'venetian_blinds',
    'vertical_blinds',
    'cellular_blinds',
    'zebra_blinds',
    'panel_glide',
    'roman_blinds' // Note: Romans are hybrid - fabric but calculated like blinds in some contexts
  ];

  return blindCategories.includes(normalized);
}

/**
 * Check if a treatment category is a hard blind (not fabric-based)
 * Excludes roman blinds which use fabric
 */
export function isHardBlindType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();

  const hardBlindCategories = [
    'roller_blinds',
    'venetian_blinds',
    'vertical_blinds',
    'cellular_blinds',
    'zebra_blinds',
    'panel_glide',
  ];

  return hardBlindCategories.includes(normalized);
}

/**
 * Check if a treatment is a shutter type
 */
export function isShutterType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();

  return normalized === 'shutters' || normalized === 'plantation_shutters';
}

/**
 * Check if a treatment is curtains
 */
export function isCurtainType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();

  return normalized === 'curtains';
}

/**
 * Check if a treatment is roman blinds
 */
export function isRomanBlindType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();

  return normalized === 'roman_blinds';
}

/**
 * Check if a treatment is wallpaper
 */
export function isWallpaperType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();

  return normalized === 'wallpaper';
}

/**
 * Check if a treatment uses fabric (soft furnishings)
 * Returns true for: curtains, roman_blinds
 */
export function usesFabric(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();
  const config = UNIFIED_CATEGORIES[normalized];
  return config?.product_type === 'fabric';
}

/**
 * Check if a treatment uses hard materials (blinds, shutters)
 * Returns true for: roller_blinds, venetian_blinds, vertical_blinds, etc.
 */
export function usesHardMaterial(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim();
  const config = UNIFIED_CATEGORIES[normalized];
  return config?.product_type === 'hard_material';
}

// ============================================================
// Calculation Method Detection
// ============================================================

/**
 * Check if treatment uses linear meter calculation (curtains, romans)
 * Re-exports from contracts for consistency
 */
export function isLinearCalculationType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim() as TreatmentCategoryDbValue;
  if (!isValidTreatmentCategory(normalized)) return false;
  return contractIsLinearType(normalized);
}

/**
 * Check if treatment uses area (sqm) calculation (blinds, shutters)
 * Re-exports from contracts for consistency
 */
export function isAreaCalculationType(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim() as TreatmentCategoryDbValue;
  if (!isValidTreatmentCategory(normalized)) return false;
  return contractIsAreaType(normalized);
}

/**
 * Check if treatment uses grid pricing
 * Re-exports from contracts for consistency
 */
export function usesGridPricing(category: string | undefined | null): boolean {
  if (!category) return false;
  const normalized = category.toLowerCase().trim() as TreatmentCategoryDbValue;
  if (!isValidTreatmentCategory(normalized)) return false;
  return contractIsGridType(normalized);
}

// ============================================================
// Work Order / Workshop Detection
// ============================================================

/**
 * Check if treatment should show hem allowances in work orders
 * Returns FALSE for manufactured items (blinds, shutters)
 */
export function shouldShowHemAllowances(category: string | undefined | null): boolean {
  if (!category) return false;

  // Blinds and shutters are manufactured to exact size - no hems
  if (isHardBlindType(category)) return false;
  if (isShutterType(category)) return false;

  // Curtains and romans show hems
  if (isCurtainType(category)) return true;
  if (isRomanBlindType(category)) return true;

  // Default: don't show hems for unknown types
  return false;
}

/**
 * Check if treatment should show fabric requirements
 */
export function shouldShowFabricRequirements(category: string | undefined | null): boolean {
  return usesFabric(category);
}

/**
 * Check if treatment should show seam calculations
 */
export function shouldShowSeamCalculations(category: string | undefined | null): boolean {
  return isCurtainType(category) || isRomanBlindType(category);
}

// ============================================================
// Pricing Category Detection
// ============================================================

/**
 * Get the making charge category for a treatment
 * Used for markup lookups from business_settings
 */
export function getMakingCategory(category: string | undefined | null): string {
  if (!category) return 'general';
  const normalized = category.toLowerCase().trim();

  if (isCurtainType(normalized)) return 'curtain_making';
  if (isRomanBlindType(normalized)) return 'roman_making';
  if (isBlindType(normalized)) return 'blind_making';
  if (isShutterType(normalized)) return 'shutter_making';

  return 'general';
}

/**
 * Get the material label for display
 * "Fabric" for curtains/romans, "Material" for blinds/shutters
 */
export function getMaterialLabel(category: string | undefined | null): string {
  if (usesFabric(category)) return 'Fabric';
  if (usesHardMaterial(category)) return 'Material';
  return 'Material';
}

// ============================================================
// Unified Detection from Multiple Sources
// ============================================================

interface TreatmentDetectionInput {
  treatmentType?: string | null;
  treatmentCategory?: string | null;
  templateName?: string | null;
  summary?: {
    treatment_type?: string | null;
    treatment_category?: string | null;
    template_name?: string | null;
  } | null;
}

/**
 * Detect the treatment category from multiple possible sources
 * Prioritizes: summary.treatment_category > treatmentCategory > treatmentType > templateName
 * Returns the normalized category or null if not detected
 */
export function detectTreatmentCategory(input: TreatmentDetectionInput): string | null {
  // Priority 1: Summary treatment_category (most reliable)
  if (input.summary?.treatment_category) {
    const cat = input.summary.treatment_category.toLowerCase().trim();
    if (isValidTreatmentCategory(cat)) return cat;
  }

  // Priority 2: Summary treatment_type
  if (input.summary?.treatment_type) {
    const cat = input.summary.treatment_type.toLowerCase().trim();
    if (isValidTreatmentCategory(cat)) return cat;
  }

  // Priority 3: Direct treatmentCategory prop
  if (input.treatmentCategory) {
    const cat = input.treatmentCategory.toLowerCase().trim();
    if (isValidTreatmentCategory(cat)) return cat;
  }

  // Priority 4: treatmentType prop
  if (input.treatmentType) {
    const cat = input.treatmentType.toLowerCase().trim();
    if (isValidTreatmentCategory(cat)) return cat;
  }

  // Priority 5: Infer from template name (last resort)
  const templateName = input.summary?.template_name || input.templateName;
  if (templateName) {
    return inferCategoryFromName(templateName);
  }

  return null;
}

/**
 * Infer treatment category from a product/template name
 * Last resort when proper category is not available
 */
export function inferCategoryFromName(name: string | undefined | null): string | null {
  if (!name) return null;
  const lower = name.toLowerCase();

  // Check for specific keywords
  if (lower.includes('curtain')) return 'curtains';
  if (lower.includes('roman') && lower.includes('blind')) return 'roman_blinds';
  if (lower.includes('roller')) return 'roller_blinds';
  if (lower.includes('venetian')) return 'venetian_blinds';
  if (lower.includes('vertical')) return 'vertical_blinds';
  if (lower.includes('cellular') || lower.includes('honeycomb')) return 'cellular_blinds';
  if (lower.includes('zebra') || lower.includes('day') && lower.includes('night')) return 'zebra_blinds';
  if (lower.includes('plantation') && lower.includes('shutter')) return 'plantation_shutters';
  if (lower.includes('shutter')) return 'shutters';
  if (lower.includes('panel') && lower.includes('glide')) return 'panel_glide';
  if (lower.includes('awning')) return 'awning';
  if (lower.includes('wallpaper')) return 'wallpaper';

  // Generic blind detection (after specific types)
  if (lower.includes('blind')) return 'roller_blinds'; // Default blind type

  return null;
}

/**
 * Check if a treatment is a manufactured item (blinds/shutters)
 * These are made to exact specifications, not cut from fabric
 */
export function isManufacturedItem(category: string | undefined | null): boolean {
  return isHardBlindType(category) || isShutterType(category);
}

/**
 * Check if a treatment is a soft furnishing (fabric-based)
 */
export function isSoftFurnishing(category: string | undefined | null): boolean {
  return isCurtainType(category) || isRomanBlindType(category);
}

// ============================================================
// Export Type Constants for External Use
// ============================================================

export { LINEAR_TYPES, AREA_TYPES, GRID_TYPES };
