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
  category: 'fabric' | 'material' | 'hardware';
  subcategories: string[];
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
    category: 'fabric',
    subcategories: ['roller_fabric', 'roller_blind_fabric', 'roller'],
    description: 'Roller blind fabrics'
  },
  
  blinds: {
    category: 'fabric',
    subcategories: ['roller_fabric', 'roller_blind_fabric', 'roller'],
    description: 'Generic blind fabrics (defaults to roller)'
  },
  
  cellular_blinds: {
    category: 'fabric',
    subcategories: ['cellular', 'cellular_fabric', 'honeycomb', 'honeycomb_fabric'],
    description: 'Cellular/honeycomb blind fabrics (all naming variations)'
  },
  
  cellular_shades: {
    category: 'fabric',
    subcategories: ['cellular', 'cellular_fabric', 'honeycomb', 'honeycomb_fabric'],
    description: 'Cellular/honeycomb shade fabrics (same as cellular_blinds)'
  },
  
  panel_glide: {
    category: 'fabric',
    subcategories: ['panel_glide_fabric', 'panel_fabric', 'curtain_fabric', 'panel'],
    description: 'Panel track fabrics (can use curtain fabrics)'
  },
  
  venetian_blinds: {
    category: 'material',
    subcategories: ['venetian_slats', 'wood_slats', 'aluminum_slats', 'venetian'],
    description: 'Venetian blind slats (wood, aluminum, etc.)'
  },
  
  vertical_blinds: {
    category: 'material',
    subcategories: ['vertical_slats', 'vertical_vanes', 'vertical'],
    description: 'Vertical blind vanes/slats'
  },
  
  shutters: {
    category: 'material',
    subcategories: ['shutter_material', 'shutter_panels', 'shutter'],
    description: 'Shutter panel materials'
  },
  
  plantation_shutters: {
    category: 'material',
    subcategories: ['shutter_material', 'shutter_panels', 'shutter'],
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
export const getTreatmentPrimaryCategory = (treatmentCategory: TreatmentCategory): 'fabric' | 'material' | 'hardware' => {
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
