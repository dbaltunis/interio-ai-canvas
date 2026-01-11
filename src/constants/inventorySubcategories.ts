/**
 * Centralized Inventory Subcategory Configuration
 * 
 * This file defines the accepted subcategories for each treatment type.
 * When filtering inventory, the system checks if a product's subcategory
 * matches one of these values.
 * 
 * IMPORTANT: Keep this file in sync with:
 * - src/hooks/useTreatmentSpecificFabrics.ts (fabric filtering)
 * - src/components/inventory/InventorySelectionPanel.tsx (material filtering)
 * - INVENTORY_CATEGORY_GUIDE.md (documentation)
 */

import { TreatmentCategory } from "@/utils/treatmentTypeDetection";

/**
 * Maps treatment categories to their accepted inventory subcategories
 */
export const TREATMENT_SUBCATEGORIES: Record<TreatmentCategory, {
  category: 'fabric' | 'material' | 'hardware' | 'both';
  subcategories: string[];
  fabricSubcategories?: string[]; // For 'both' category: fabric-specific subcategories
  materialSubcategories?: string[]; // For 'both' category: material-specific subcategories
  description: string;
}> = {
  curtains: {
    category: 'fabric',
    subcategories: ['curtain_fabric', 'curtain'],
    description: 'Standard curtain fabrics'
  },
  
  roman_blinds: {
    category: 'fabric',
    subcategories: ['curtain_fabric', 'curtain'],
    description: 'Roman blinds use the same fabrics as curtains'
  },
  
  roller_blinds: {
    category: 'both', // Supports both fabric AND material (for TWC materials)
    subcategories: ['roller_fabric', 'roller_blind_fabric', 'roller', 'blind_material'],
    fabricSubcategories: ['roller_fabric', 'roller_blind_fabric', 'roller'],
    materialSubcategories: ['blind_material', 'roller_fabric'],
    description: 'Roller blind fabrics and materials'
  },
  
  zebra_blinds: {
    category: 'both',
    subcategories: ['zebra_fabric', 'roller_fabric', 'blind_material'],
    fabricSubcategories: ['zebra_fabric', 'roller_fabric'],
    materialSubcategories: ['blind_material', 'zebra_fabric'],
    description: 'Zebra/Day-Night blind fabrics with alternating sheer and opaque bands'
  },
  
  blinds: {
    category: 'fabric',
    subcategories: ['roller_fabric', 'roller_blind_fabric', 'roller', 'blind_material'],
    description: 'Generic blind fabrics (defaults to roller)'
  },
  
  cellular_blinds: {
    category: 'fabric',
    subcategories: ['cellular', 'cellular_fabric', 'honeycomb', 'honeycomb_fabric'],
    description: 'Cellular/honeycomb blind fabrics (all naming variations)'
  },
  
  panel_glide: {
    category: 'fabric',
    subcategories: ['panel_glide_fabric', 'panel_fabric', 'curtain_fabric', 'panel'],
    description: 'Panel track fabrics (can use curtain fabrics)'
  },
  
  venetian_blinds: {
    category: 'material',
    subcategories: ['venetian_slats', 'wood_slats', 'aluminum_slats', 'venetian', 'blind_material'],
    description: 'Venetian blind slats (wood, aluminum, etc.)'
  },
  
  vertical_blinds: {
    category: 'both', // Supports both fabric vanes and material slats
    subcategories: ['vertical_fabric', 'vertical_slats', 'vertical_vanes', 'vertical', 'blind_material'], // All combined (for backward compatibility)
    fabricSubcategories: ['vertical_fabric'], // Fabric vanes only
    materialSubcategories: ['vertical_slats', 'vertical_vanes', 'vertical', 'blind_material'], // Material slats/vanes only
    description: 'Vertical blind vanes (fabric or material)'
  },
  
  shutters: {
    category: 'material',
    subcategories: ['shutter_material', 'shutter_panels', 'shutter', 'blind_material'],
    description: 'Shutter panel materials'
  },
  
  shutter: {
    category: 'material',
    subcategories: ['shutter_material', 'shutter_panels', 'shutter', 'blind_material'],
    description: 'Shutter panel materials (singular alias)'
  },
  
  plantation_shutters: {
    category: 'material',
    subcategories: ['shutter_material', 'shutter_panels', 'shutter', 'blind_material'],
    description: 'Plantation shutter materials (same as shutters)'
  },
  
  awning: {
    category: 'fabric',
    subcategories: ['awning_fabric', 'awning'],
    description: 'Outdoor awning fabrics'
  },
  
  wallpaper: {
    category: 'fabric',
    subcategories: ['wallcovering', 'wallpaper'],
    description: 'Wallcovering materials'
  }
};

/**
 * Get accepted subcategories for a treatment type
 */
export const getAcceptedSubcategories = (treatmentCategory: TreatmentCategory): string[] => {
  return TREATMENT_SUBCATEGORIES[treatmentCategory]?.subcategories || [];
};

/**
 * Get the primary category (fabric/material) for a treatment type
 */
export const getTreatmentPrimaryCategory = (treatmentCategory: TreatmentCategory): 'fabric' | 'material' | 'hardware' | 'both' => {
  return TREATMENT_SUBCATEGORIES[treatmentCategory]?.category || 'fabric';
};

/**
 * Check if a subcategory is valid for a treatment type
 */
export const isValidSubcategory = (treatmentCategory: TreatmentCategory, subcategory: string): boolean => {
  const accepted = getAcceptedSubcategories(treatmentCategory);
  return accepted.some(s => s.toLowerCase() === subcategory.toLowerCase());
};

/**
 * Get recommended subcategory (first in list = preferred naming)
 */
export const getRecommendedSubcategory = (treatmentCategory: TreatmentCategory): string => {
  const subcategories = getAcceptedSubcategories(treatmentCategory);
  return subcategories[0] || 'fabric';
};
