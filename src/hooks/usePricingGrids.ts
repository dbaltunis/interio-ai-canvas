import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PricingGrid } from "@/types/database";
import { inferGridUnit, convertToGridUnit, type GridUnit } from "@/utils/gridUnitUtils";
import {
  normalizeGridData,
  getPriceFromStandardGrid,
  isStandardFormat,
  type StandardPricingGridData
} from "@/types/pricingGrid";

interface GridData {
  rows?: Array<{
    drop_min: number;
    drop_max: number;
    [key: string]: any;
  }>;
  columns?: Array<{
    width_min: number;
    width_max: number;
    key: string;
  }>;
  dropRows?: Array<{
    drop: string;
    prices: number[];
  }>;
  widthColumns?: string[];
  unit?: GridUnit;
}

export const usePricingGrids = () => {
  return useQuery({
    queryKey: ["pricing-grids"],
    queryFn: async (): Promise<PricingGrid[]> => {
      const { data, error } = await supabase
        .from('pricing_grids')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return (data || []) as unknown as PricingGrid[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const usePricingGrid = (gridId: string) => {
  return useQuery({
    queryKey: ["pricing-grid", gridId],
    queryFn: async (): Promise<PricingGrid | null> => {
      if (!gridId) return null;

      const { data, error } = await supabase
        .from('pricing_grids')
        .select('*')
        .eq('id', gridId)
        .single();

      if (error) {
        console.error('Error fetching pricing grid:', error);
        return null;
      }
      return data as unknown as PricingGrid;
    },
    enabled: !!gridId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreatePricingGrid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gridData: {
      name: string;
      grid_data: any;
      grid_code?: string;
      supplier_id?: string | null;
      product_type?: string | null;
      price_group?: string | null;
    }): Promise<PricingGrid> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate grid code from name if not provided
      const gridCode = gridData.grid_code || gridData.name.trim().replace(/\s+/g, '_').toUpperCase();

      const { data, error } = await supabase
        .from('pricing_grids')
        .insert([{
          user_id: user.id,
          name: gridData.name,
          grid_code: gridCode,
          grid_data: gridData.grid_data as any,
          supplier_id: gridData.supplier_id || null,
          product_type: gridData.product_type || null,
          price_group: gridData.price_group || null,
          active: true,
        } as any])
        .select()
        .single();

      if (error) {
        console.error('Error creating pricing grid:', error);
        throw error;
      }

      return data as unknown as PricingGrid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-grids"] });
      queryClient.refetchQueries({ queryKey: ["pricing-grids"] });
    },
  });
};

export const useDeletePricingGrid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gridId: string): Promise<void> => {
      const { error } = await supabase
        .from('pricing_grids')
        .delete()
        .eq('id', gridId);

      if (error) {
        console.error('Error deleting pricing grid:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-grids"] });
      queryClient.refetchQueries({ queryKey: ["pricing-grids"] });
    },
  });
};

// Helper function to parse CSV data and find price based on width and drop
// IMPORTANT: Input width and drop should be in CM (the app's standard)
// The function will convert to match the grid's stored unit
export const getPriceFromGrid = (gridData: any, widthCm: number, dropCm: number): number => {
  // Enhanced null/empty check - handle null, undefined, empty objects, and invalid data
  if (!gridData || typeof gridData !== 'object') {
    console.log("❌ getPriceFromGrid: No grid data provided");
    return 0;
  }

  // Check if gridData is an empty object or has no meaningful pricing data
  const hasValidData = (
    (gridData.widthColumns && Array.isArray(gridData.widthColumns) && gridData.widthColumns.length > 0) ||
    (gridData.widths && Array.isArray(gridData.widths) && gridData.widths.length > 0) ||
    (gridData.dropRanges && Array.isArray(gridData.dropRanges) && gridData.dropRanges.length > 0) ||
    (gridData.prices && Array.isArray(gridData.prices) && gridData.prices.length > 0)
  );

  if (!hasValidData) {
    console.log("❌ getPriceFromGrid: Grid data is empty or invalid:", gridData);
    return 0;
  }

  try {
    // PREFERRED PATH: Use unified grid normalization
    // This converts any known format to the standard format first
    const normalizedGrid = normalizeGridData(gridData);
    if (normalizedGrid) {
      console.log("🔍 === PRICING GRID LOOKUP (Normalized) ===");
      console.log("📊 Input (CM):", { widthCm, dropCm });
      console.log("📊 Grid unit:", normalizedGrid.unit);
      console.log("📋 Available widths:", normalizedGrid.widthColumns.map(w => w + normalizedGrid.unit));
      console.log("📋 Available drops:", normalizedGrid.dropRows.map(r => r.drop + normalizedGrid.unit));

      const price = getPriceFromStandardGrid(normalizedGrid, widthCm, dropCm, 'cm');

      if (price !== null) {
        console.log("✅ GRID MATCH FOUND (normalized):");
        console.log("  📏 Requested Width:", widthCm + "cm");
        console.log("  📏 Requested Drop:", dropCm + "cm");
        console.log("  💰 Manufacturing Price:", price);
        console.log("🔍 === END PRICING GRID LOOKUP ===");
        return price;
      }
    }

    // FALLBACK: Legacy code paths for edge cases
    console.log("⚠️ Using legacy grid lookup (normalization returned null)");

    // Infer the grid's unit from values if not explicitly set
    const gridUnit = inferGridUnit(gridData);

    // Convert input CM values to match the grid's unit
    const width = convertToGridUnit(widthCm, gridUnit);
    const drop = convertToGridUnit(dropCm, gridUnit);

    console.log("🔍 === PRICING GRID LOOKUP (Legacy) ===");
    console.log("📊 Input (CM):", { widthCm, dropCm });
    console.log("📊 Grid unit:", gridUnit);
    console.log("📊 Converted for lookup:", { width: width + gridUnit, drop: drop + gridUnit });
    console.log("📁 Grid data structure:", gridData);
    
    // Handle widths/heights/prices format (from Gustin Decor grid imports)
    if (gridData.widths && gridData.heights && gridData.prices) {
      const widths = gridData.widths as number[];
      const heights = gridData.heights as number[];
      const prices = gridData.prices as number[][];
      
      console.log("📋 Grid format: widths/heights/prices (numeric arrays)");
      console.log("📋 Available widths:", widths.map(w => w + gridUnit));
      console.log("📋 Available heights:", heights.map(h => h + gridUnit));
      
      // Find the closest width index (rounds to nearest grid value)
      const closestWidth = widths.reduce((prev: number, curr: number) => 
        Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev
      );
      const widthIndex = widths.indexOf(closestWidth);
      
      // Find the closest height index (rounds to nearest grid value)
      const closestHeight = heights.reduce((prev: number, curr: number) => 
        Math.abs(curr - drop) < Math.abs(prev - drop) ? curr : prev
      );
      const heightIndex = heights.indexOf(closestHeight);
      
      console.log("✅ Found closest width:", closestWidth + gridUnit, "at index", widthIndex);
      console.log("✅ Found closest height:", closestHeight + gridUnit, "at index", heightIndex);
      
      // Get the price from the 2D array [height][width]
      const price = parseFloat(prices[heightIndex]?.[widthIndex]?.toString() || "0");
      
      console.log("✅ GRID MATCH FOUND (widths/heights format):");
      console.log("  📏 Width:", widthCm + "cm →", width + gridUnit, "→ Using:", closestWidth + gridUnit);
      console.log("  📏 Height:", dropCm + "cm →", drop + gridUnit, "→ Using:", closestHeight + gridUnit);
      console.log("  💰 Manufacturing Price:", price);
      console.log("🔍 === END PRICING GRID LOOKUP ===");
      
      return price;
    }
    
    // Handle the data structure with dropRanges and widthRanges (from pricing grid)
    if (gridData.dropRanges && gridData.widthRanges && gridData.prices) {
      const dropRanges = gridData.dropRanges;
      const widthRanges = gridData.widthRanges;
      const prices = gridData.prices;
      
      console.log("📋 Available drops:", dropRanges.map((d: string) => d + gridUnit));
      console.log("📋 Available widths:", widthRanges.map((w: string) => w + gridUnit));
      
      // Find the closest drop index
      const dropValues = dropRanges.map((d: string) => parseInt(d));
      const closestDrop = dropValues.reduce((prev: number, curr: number) => {
        return Math.abs(curr - drop) < Math.abs(prev - drop) ? curr : prev;
      });
      const dropIndex = dropValues.indexOf(closestDrop);
      
      console.log("✅ Found closest drop:", closestDrop + gridUnit, "at index", dropIndex, "(looking for " + drop + gridUnit + ")");
      
      // Find the closest width index
      const widthValues = widthRanges.map((w: string) => parseInt(w));
      const closestWidth = widthValues.reduce((prev: number, curr: number) => {
        return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
      });
      const widthIndex = widthValues.indexOf(closestWidth);
      
      console.log("✅ Found closest width:", closestWidth + gridUnit, "at index", widthIndex, "(looking for " + width + gridUnit + ")");
      
      // Get the price from the 2D array
      const price = parseFloat(prices[dropIndex]?.[widthIndex]?.toString() || "0");
      
      console.log("✅ GRID MATCH FOUND:");
      console.log("  📏 Requested Width:", widthCm + "cm →", width + gridUnit, "→ Using:", closestWidth + gridUnit);
      console.log("  📏 Requested Drop:", dropCm + "cm →", drop + gridUnit, "→ Using:", closestDrop + gridUnit);
      console.log("  💰 Manufacturing Price:", price);
      console.log("🔍 === END PRICING GRID LOOKUP ===");
      
      return price;
    }
    
    // Handle the actual data structure with dropRows (from uploaded CSV)
    if (gridData.dropRows && gridData.widthColumns) {
      const dropRows = gridData.dropRows;
      const widthColumns = gridData.widthColumns;
      
      console.log("📋 Available drops:", dropRows.map((r: any) => r.drop + gridUnit));
      console.log("📋 Available widths:", widthColumns.map((w: string) => w + gridUnit));
      
      // Find the closest drop row (rounds to nearest grid value)
      const dropValues = dropRows.map((r: any) => parseInt(r.drop));
      const closestDrop = dropValues.reduce((prev: number, curr: number) => {
        return Math.abs(curr - drop) < Math.abs(prev - drop) ? curr : prev;
      });
      
      const matchingDropRow = dropRows.find((row: any) => {
        const rowDrop = parseInt(row.drop);
        return rowDrop === closestDrop;
      });
      
      if (!matchingDropRow) {
        console.log("❌ No drop row found");
        return 0;
      }
      
      console.log("✅ Found closest drop row:", matchingDropRow.drop + gridUnit, "(looking for " + drop + gridUnit + ")");
      
      // Find the closest width column (rounds to nearest grid value)
      const widthValues = widthColumns.map((w: string) => parseInt(w.toString()));
      const closestWidth = widthValues.reduce((prev: number, curr: number) => {
        return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
      });
      
      const widthIndex = widthColumns.findIndex((col: string) => {
        const colWidth = parseInt(col.toString());
        return colWidth === closestWidth;
      });
      
      if (widthIndex === -1) {
        console.log("❌ No width column found");
        return 0;
      }
      
      console.log("✅ Found closest width at index:", widthIndex, "=", closestWidth + gridUnit, "(looking for " + width + gridUnit + ")");
      
      // Get the price from the matching row and column
      const price = parseFloat(matchingDropRow.prices[widthIndex]?.toString() || "0");
      
      console.log("✅ GRID MATCH FOUND:");
      console.log("  📏 Requested Width:", widthCm + "cm →", width + gridUnit, "→ Using:", closestWidth + gridUnit);
      console.log("  📏 Requested Drop:", dropCm + "cm →", drop + gridUnit, "→ Using:", closestDrop + gridUnit);
      console.log("  💰 Manufacturing Price:", price);
      console.log("🔍 === END PRICING GRID LOOKUP ===");
      
      return price;
    }
    
    // Handle the old structure with rows and columns (fallback for legacy data)
    const rows = gridData.rows;
    if (!rows) {
      console.log("❌ No rows data found in grid structure");
      return 0;
    }
    
    // Find the appropriate row based on drop ranges
    let matchingRow = null;
    for (const row of rows) {
      if (row.drop_min <= drop && drop <= row.drop_max) {
        matchingRow = row;
        break;
      }
    }
    
    if (!matchingRow) {
      console.log("❌ No matching row found for drop ranges");
      return 0;
    }
    
    // Find the appropriate column based on width ranges
    const columns = gridData.columns || [];
    let matchingPrice = 0;
    
    for (const col of columns) {
      if (col.width_min <= width && width <= col.width_max) {
        matchingPrice = matchingRow[col.key] || 0;
        break;
      }
    }
    
    console.log("📊 Legacy pricing calculation result:", matchingPrice);
    return parseFloat(matchingPrice.toString()) || 0;
  } catch (error) {
    console.error("❌ Error parsing pricing grid:", error);
    return 0;
  }
};
