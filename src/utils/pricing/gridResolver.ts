/**
 * Grid Resolution Logic for Blind Pricing
 * 
 * Determines which pricing grid to use based on:
 * - Product type (roller, venetian, vertical, etc.)
 * - System type (open, cassette, heavy_duty, etc.)
 * - Fabric price group (A, B, C, D, etc.)
 * - Optional additional conditions
 */

import { supabase } from "@/integrations/supabase/client";

export interface GridResolutionParams {
  productType: string;           // 'roller_blinds', 'venetian_blinds', etc.
  systemType?: string;            // 'open', 'cassette', etc.
  fabricPriceGroup?: string;      // 'A', 'B', 'C', 'D'
  selectedOptions?: Record<string, any>; // Additional option filters
  userId: string;
}

export interface GridResolutionResult {
  gridId: string | null;
  gridCode?: string;
  gridName?: string;
  gridData?: any;
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
  const { productType, systemType, fabricPriceGroup, selectedOptions, userId } = params;

  // Return null if no price group specified
  if (!fabricPriceGroup) {
    return { gridId: null };
  }

  try {
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
      console.warn(`No pricing grid rule found for: ${productType} + ${systemType} + Group ${fabricPriceGroup}`);
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
