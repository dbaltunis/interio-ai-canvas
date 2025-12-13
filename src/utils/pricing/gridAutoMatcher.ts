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
  matchType: 'exact' | 'fallback' | 'none';
  matchDetails?: string;
}

/**
 * Auto-match a pricing grid based on supplier, product type, and price group
 * 
 * Match priority:
 * 1. Exact match: supplier_id + product_type + price_group
 * 2. Fallback: product_type + price_group (any supplier)
 * 3. No match
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

  const normalizedPriceGroup = priceGroup.toUpperCase().trim();

  try {
    // Try exact match first: supplier + product_type + price_group
    if (supplierId) {
      const { data: exactMatch, error: exactError } = await supabase
        .from('pricing_grids')
        .select('id, grid_code, name, grid_data')
        .eq('user_id', userId)
        .eq('supplier_id', supplierId)
        .eq('product_type', productType)
        .ilike('price_group', normalizedPriceGroup)
        .eq('active', true)
        .limit(1)
        .single();

      if (!exactError && exactMatch) {
        console.log('📊 Grid auto-match: EXACT match found', {
          supplier: supplierId,
          productType,
          priceGroup: normalizedPriceGroup,
          grid: exactMatch.name
        });
        return {
          gridId: exactMatch.id,
          gridCode: exactMatch.grid_code,
          gridName: exactMatch.name,
          gridData: exactMatch.grid_data,
          matchType: 'exact',
          matchDetails: `Matched by supplier + ${productType} + Group ${normalizedPriceGroup}`
        };
      }
    }

    // Fallback: product_type + price_group (any supplier)
    const { data: fallbackMatch, error: fallbackError } = await supabase
      .from('pricing_grids')
      .select('id, grid_code, name, grid_data')
      .eq('user_id', userId)
      .eq('product_type', productType)
      .ilike('price_group', normalizedPriceGroup)
      .eq('active', true)
      .limit(1)
      .single();

    if (!fallbackError && fallbackMatch) {
      console.log('📊 Grid auto-match: FALLBACK match found', {
        productType,
        priceGroup: normalizedPriceGroup,
        grid: fallbackMatch.name
      });
      return {
        gridId: fallbackMatch.id,
        gridCode: fallbackMatch.grid_code,
        gridName: fallbackMatch.name,
        gridData: fallbackMatch.grid_data,
        matchType: 'fallback',
        matchDetails: `Matched by ${productType} + Group ${normalizedPriceGroup} (any supplier)`
      };
    }

    console.log('📊 Grid auto-match: No match found', {
      supplierId,
      productType,
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