/**
 * Grid Resolution Logic for Blind Pricing
 * 
 * NEW AUTO-MATCHING SYSTEM:
 * Determines which pricing grid to use based on:
 * - Supplier (vendor_id from selected fabric/material)
 * - Product type (roller_blinds, venetian_blinds, etc. from template)
 * - Price group (A, B, C from fabric/material)
 * 
 * LEGACY SUPPORT:
 * Still supports old pricing_grid_rules table for backwards compatibility
 */

import { supabase } from "@/integrations/supabase/client";
import { autoMatchPricingGrid, AutoMatchResult } from "./gridAutoMatcher";

export interface GridResolutionParams {
  productType: string;           // 'roller_blinds', 'venetian_blinds', etc.
  systemType?: string;            // 'open', 'cassette', etc. (legacy)
  fabricPriceGroup?: string;      // 'A', 'B', 'C', 'D'
  fabricSupplierId?: string;      // Fabric's vendor_id for auto-matching
  selectedOptions?: Record<string, any>; // Additional option filters
  userId: string;
}

export interface GridResolutionResult {
  gridId: string | null;
  gridCode?: string;
  gridName?: string;
  gridData?: any;
  markupPercentage?: number;
  discountPercentage?: number;    // Trade/supplier discount applied to grid list prices before markup
  includesFabricPrice?: boolean;  // When TRUE, grid includes fabric cost; when FALSE, add fabric separately
  matchedRule?: {
    id: string;
    product_type: string;
    system_type?: string;
    price_group: string;
    priority: number;
  };
}

/**
 * Resolves which pricing grid should be used for a product configuration
 * 
 * @example
 * const result = await resolveGridForProduct({
 *   productType: 'roller_blinds',
 *   systemType: 'cassette',
 *   fabricPriceGroup: 'B',
 *   userId: user.id
 * });
 */
export const resolveGridForProduct = async (
  params: GridResolutionParams
): Promise<GridResolutionResult> => {
  const { productType, systemType, fabricPriceGroup, fabricSupplierId, selectedOptions, userId } = params;

  // Return null if no price group specified
  if (!fabricPriceGroup) {
    return { gridId: null };
  }

  try {
    // NEW: Try auto-matching first (supplier + product_type + price_group)
    const autoMatchResult = await autoMatchPricingGrid({
      supplierId: fabricSupplierId,
      productType,
      priceGroup: fabricPriceGroup,
      userId
    });

    if (autoMatchResult.gridId) {
      console.log('📊 Grid resolved via auto-match:', autoMatchResult.matchDetails, 'markup:', autoMatchResult.markupPercentage, 'discount:', autoMatchResult.discountPercentage, 'includesFabric:', autoMatchResult.includesFabricPrice);
      return {
        gridId: autoMatchResult.gridId,
        gridCode: autoMatchResult.gridCode,
        gridName: autoMatchResult.gridName,
        gridData: autoMatchResult.gridData,
        markupPercentage: autoMatchResult.markupPercentage,
        discountPercentage: autoMatchResult.discountPercentage || 0,
        includesFabricPrice: autoMatchResult.includesFabricPrice ?? true,
        matchedRule: {
          id: 'auto-match',
          product_type: productType,
          system_type: systemType,
          price_group: fabricPriceGroup,
          priority: 100 // Auto-match has highest priority
        }
      };
    }

    // LEGACY: Fall back to pricing_grid_rules table for backwards compatibility
    console.log('📊 No auto-match found, falling back to legacy rules...');
    
    // Fetch all matching rules with their grids, ordered by priority
    const { data: rules, error } = await supabase
      .from('pricing_grid_rules')
      .select(`
        *,
        pricing_grids:grid_id (
          id,
          grid_code,
          name,
          grid_data,
          markup_percentage,
          discount_percentage,
          includes_fabric_price,
          active
        )
      `)
      .eq('user_id', userId)
      .eq('product_type', productType)
      .eq('price_group', fabricPriceGroup)
      .eq('active', true)
      .order('priority', { ascending: false }); // Higher priority first

    if (error) {
      console.error('Error fetching pricing grid rules:', error);
      return { gridId: null };
    }

    if (!rules || rules.length === 0) {
      console.warn(`No pricing grid found for: ${productType} + Group ${fabricPriceGroup}`);
      return { gridId: null };
    }

    // Find the first matching rule
    for (const rule of rules) {
      // Check system_type match (if specified)
      if (systemType && rule.system_type && rule.system_type !== systemType) {
        continue;
      }

      // Check optional conditions match (if specified)
      if (rule.option_conditions && selectedOptions) {
        const conditionsMatch = Object.entries(rule.option_conditions).every(
          ([key, value]) => selectedOptions[key] === value
        );
        if (!conditionsMatch) {
          continue;
        }
      }

      // Found matching rule - extract grid data
      const grid = Array.isArray(rule.pricing_grids) 
        ? rule.pricing_grids[0] 
        : rule.pricing_grids;

      if (!grid || !grid.active) {
        continue;
      }

      return {
        gridId: grid.id,
        gridCode: grid.grid_code,
        gridName: grid.name,
        gridData: grid.grid_data,
        markupPercentage: grid.markup_percentage,
        discountPercentage: grid.discount_percentage || 0,
        includesFabricPrice: grid.includes_fabric_price ?? true,
        matchedRule: {
          id: rule.id,
          product_type: rule.product_type,
          system_type: rule.system_type,
          price_group: rule.price_group,
          priority: rule.priority
        }
      };
    }

    // No matching rule found
    console.warn(`No matching grid rule found for: ${productType} + ${systemType} + Group ${fabricPriceGroup}`);
    return { gridId: null };

  } catch (error) {
    console.error('Error resolving pricing grid:', error);
    return { gridId: null };
  }
};

/**
 * Fetches a pricing grid by its ID
 */
export const fetchPricingGridById = async (gridId: string) => {
  const { data, error } = await supabase
    .from('pricing_grids')
    .select('*')
    .eq('id', gridId)
    .eq('active', true)
    .single();

  if (error) {
    console.error('Error fetching pricing grid:', error);
    return null;
  }

  return data;
};

/**
 * Validates if a product configuration has a pricing grid
 * Returns true if grid exists, false otherwise
 */
export const hasValidPricingGrid = async (
  params: GridResolutionParams
): Promise<boolean> => {
  const result = await resolveGridForProduct(params);
  return result.gridId !== null;
};
