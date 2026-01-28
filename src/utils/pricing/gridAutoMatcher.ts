/**
 * Grid Auto-Matching System
 * 
 * Automatically matches pricing grids to fabrics/materials based on:
 * - Supplier (vendor_id)
 * - Product Type (from template: roller_blinds, venetian_blinds, etc.)
 * - Price Group (from fabric/material: A, B, C, etc.)
 * 
 * This eliminates manual grid selection - users just need to:
 * 1. Upload grids with supplier + product_type + price_group
 * 2. Import fabrics with price_group column
 * 3. System auto-matches during quote creation
 */

import { supabase } from "@/integrations/supabase/client";
import { getProductTypesForTreatment } from "./treatmentGridMapping";

export interface AutoMatchParams {
  supplierId?: string | null;    // From fabric's vendor_id
  productType: string;            // From template: roller_blinds, venetian_blinds, etc.
  priceGroup?: string | null;     // From fabric: A, B, C, GROUP-1, etc.
  userId: string;
}

export interface AutoMatchResult {
  gridId: string | null;
  gridCode?: string;
  gridName?: string;
  gridData?: any;
  markupPercentage?: number;
  includesFabricPrice?: boolean;  // When TRUE, grid includes fabric cost; when FALSE, add fabric separately
  matchType: 'exact' | 'fallback' | 'flexible' | 'none';
  matchDetails?: string;
}

/**
 * Auto-match a pricing grid based on supplier, product type, and price group
 * 
 * Match priority:
 * 1. Exact match: supplier_id + product_type + price_group
 * 2. Product type match: product_type + price_group (any supplier)
 * 3. Flexible match: any compatible product_type + price_group
 * 4. No match
 */
export const autoMatchPricingGrid = async (
  params: AutoMatchParams
): Promise<AutoMatchResult> => {
  const { supplierId, productType, priceGroup, userId } = params;

  // If no price group specified, can't auto-match
  if (!priceGroup) {
    console.log('📊 Grid auto-match: No price group specified');
    return { gridId: null, matchType: 'none' };
  }

  const normalizedPriceGroup = priceGroup.toString().toUpperCase().trim();
  // Extract numeric part for flexible matching (e.g., "2" from "GROUP2" or just "2")
  const numericPriceGroup = normalizedPriceGroup.replace(/[^0-9]/g, '');
  
  // Get all compatible product types for this treatment category
  const compatibleProductTypes = getProductTypesForTreatment(productType);

  // Helper function to find matching grid from a list using flexible price_group matching
  const findMatchingGrid = (grids: any[]): any | null => {
    if (!grids || grids.length === 0) return null;
    
    // Priority 1: Exact match (case-insensitive)
    const exactMatch = grids.find(g => 
      g.price_group?.toString().toUpperCase().trim() === normalizedPriceGroup
    );
    if (exactMatch) return exactMatch;
    
    // Priority 2: Match with GROUP prefix stripped (e.g., "2" matches "GROUP2" or "GROUP-2")
    if (numericPriceGroup) {
      const numericMatch = grids.find(g => {
        const gridGroup = g.price_group?.toString().toUpperCase().trim() || '';
        const gridNumeric = gridGroup.replace(/[^0-9]/g, '');
        return gridNumeric === numericPriceGroup;
      });
      if (numericMatch) return numericMatch;
    }
    
    return null;
  };

  try {
    // Try exact match first: supplier + product_type + price_group
    if (supplierId) {
      const { data: supplierGrids, error: exactError } = await supabase
        .from('pricing_grids')
        .select('id, grid_code, name, grid_data, markup_percentage, includes_fabric_price, price_group')
        .eq('user_id', userId)
        .eq('supplier_id', supplierId)
        .eq('product_type', productType)
        .eq('active', true);

      const exactMatch = findMatchingGrid(supplierGrids);
      if (!exactError && exactMatch) {
        console.log('📊 Grid auto-match: EXACT match found', {
          supplier: supplierId,
          productType,
          priceGroup: normalizedPriceGroup,
          matchedGridGroup: exactMatch.price_group,
          grid: exactMatch.name,
          markup: exactMatch.markup_percentage,
          includesFabric: exactMatch.includes_fabric_price
        });
        return {
          gridId: exactMatch.id,
          gridCode: exactMatch.grid_code,
          gridName: exactMatch.name,
          gridData: exactMatch.grid_data,
          markupPercentage: exactMatch.markup_percentage,
          includesFabricPrice: exactMatch.includes_fabric_price ?? true,
          matchType: 'exact',
          matchDetails: `Matched by supplier + ${productType} + Group ${normalizedPriceGroup}`
        };
      }
    }

    // Fallback: exact product_type + price_group (any supplier)
    const { data: fallbackGrids, error: fallbackError } = await supabase
      .from('pricing_grids')
      .select('id, grid_code, name, grid_data, markup_percentage, includes_fabric_price, price_group')
      .eq('user_id', userId)
      .eq('product_type', productType)
      .eq('active', true);

    const fallbackMatch = findMatchingGrid(fallbackGrids);
    if (!fallbackError && fallbackMatch) {
      console.log('📊 Grid auto-match: FALLBACK match found', {
        productType,
        priceGroup: normalizedPriceGroup,
        matchedGridGroup: fallbackMatch.price_group,
        grid: fallbackMatch.name,
        markup: fallbackMatch.markup_percentage,
        includesFabric: fallbackMatch.includes_fabric_price
      });
      return {
        gridId: fallbackMatch.id,
        gridCode: fallbackMatch.grid_code,
        gridName: fallbackMatch.name,
        gridData: fallbackMatch.grid_data,
        markupPercentage: fallbackMatch.markup_percentage,
        includesFabricPrice: fallbackMatch.includes_fabric_price ?? true,
        matchType: 'fallback',
        matchDetails: `Matched by ${productType} + Group ${normalizedPriceGroup} (any supplier)`
      };
    }

    // Flexible match: any compatible product_type + price_group
    if (compatibleProductTypes.length > 1) {
      const { data: flexibleGrids, error: flexibleError } = await supabase
        .from('pricing_grids')
        .select('id, grid_code, name, grid_data, product_type, markup_percentage, includes_fabric_price, price_group')
        .eq('user_id', userId)
        .in('product_type', compatibleProductTypes)
        .eq('active', true);

      const flexMatch = findMatchingGrid(flexibleGrids);
      if (!flexibleError && flexMatch) {
        console.log('📊 Grid auto-match: FLEXIBLE match found', {
          requestedType: productType,
          matchedType: flexMatch.product_type,
          priceGroup: normalizedPriceGroup,
          matchedGridGroup: flexMatch.price_group,
          grid: flexMatch.name,
          markup: flexMatch.markup_percentage,
          includesFabric: flexMatch.includes_fabric_price
        });
        return {
          gridId: flexMatch.id,
          gridCode: flexMatch.grid_code,
          gridName: flexMatch.name,
          gridData: flexMatch.grid_data,
          markupPercentage: flexMatch.markup_percentage,
          includesFabricPrice: flexMatch.includes_fabric_price ?? true,
          matchType: 'flexible',
          matchDetails: `Matched by compatible type (${flexMatch.product_type}) + Group ${normalizedPriceGroup}`
        };
      }
    }

    console.log('📊 Grid auto-match: No match found', {
      supplierId,
      productType,
      compatibleTypes: compatibleProductTypes,
      priceGroup: normalizedPriceGroup
    });
    return { gridId: null, matchType: 'none' };

  } catch (error) {
    console.error('Error auto-matching pricing grid:', error);
    return { gridId: null, matchType: 'none' };
  }
};

/**
 * Get all available price groups for a product type
 * Useful for showing available options in UI
 */
export const getAvailablePriceGroups = async (
  productType: string,
  userId: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('pricing_grids')
    .select('price_group')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .eq('active', true)
    .not('price_group', 'is', null);

  if (error || !data) return [];

  // Get unique price groups
  const groups = [...new Set(data.map(g => g.price_group).filter(Boolean))];
  return groups.sort();
};

/**
 * Check if a fabric/material has a matching grid
 * Returns true if auto-match would find a grid
 */
export const hasMatchingGrid = async (
  params: AutoMatchParams
): Promise<boolean> => {
  const result = await autoMatchPricingGrid(params);
  return result.matchType !== 'none';
};