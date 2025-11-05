import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PricingGrid } from "@/types/database";

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
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const usePricingGrid = (gridId: string) => {
  return useQuery({
    queryKey: ["pricing-grid", gridId],
    queryFn: async (): Promise<PricingGrid | null> => {
      // Mock data since table doesn't exist yet
      return null;
    },
    enabled: !!gridId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCreatePricingGrid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gridData: { name: string; grid_data: any; grid_code?: string }): Promise<PricingGrid> => {
      // Mock creation since we're not using this for actual creation anymore
      const mockGrid: PricingGrid = {
        id: 'mock-id',
        user_id: 'mock-user',
        grid_code: gridData.grid_code || 'MOCK',
        name: gridData.name,
        grid_data: gridData.grid_data,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockGrid;
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
      // Mock deletion since table doesn't exist yet
      console.log('Mock deleting pricing grid:', gridId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-grids"] });
      queryClient.refetchQueries({ queryKey: ["pricing-grids"] });
    },
  });
};

// Helper function to parse CSV data and find price based on width and drop
export const getPriceFromGrid = (gridData: any, width: number, drop: number): number => {
  if (!gridData) {
    console.log("❌ getPriceFromGrid: No grid data provided");
    return 0;
  }
  
  try {
    console.log("🔍 === PRICING GRID LOOKUP ===");
    console.log("📊 Looking for:", { width: width + "cm", drop: drop + "cm" });
    console.log("📁 Grid data structure:", gridData);
    
    // Handle the data structure with dropRanges and widthRanges (from pricing grid)
    if (gridData.dropRanges && gridData.widthRanges && gridData.prices) {
      const dropRanges = gridData.dropRanges;
      const widthRanges = gridData.widthRanges;
      const prices = gridData.prices;
      
      console.log("📋 Available drops:", dropRanges.map((d: string) => d + "cm"));
      console.log("📋 Available widths:", widthRanges.map((w: string) => w + "cm"));
      
      // Find the closest drop index
      const dropValues = dropRanges.map((d: string) => parseInt(d));
      const closestDrop = dropValues.reduce((prev, curr) => {
        return Math.abs(curr - drop) < Math.abs(prev - drop) ? curr : prev;
      });
      const dropIndex = dropValues.indexOf(closestDrop);
      
      console.log("✅ Found closest drop:", closestDrop + "cm at index", dropIndex, "(looking for " + drop + "cm)");
      
      // Find the closest width index
      const widthValues = widthRanges.map((w: string) => parseInt(w));
      const closestWidth = widthValues.reduce((prev, curr) => {
        return Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev;
      });
      const widthIndex = widthValues.indexOf(closestWidth);
      
      console.log("✅ Found closest width:", closestWidth + "cm at index", widthIndex, "(looking for " + width + "cm)");
      
      // Get the price from the 2D array
      const price = parseFloat(prices[dropIndex]?.[widthIndex]?.toString() || "0");
      
      console.log("✅ GRID MATCH FOUND:");
      console.log("  📏 Requested Width:", width + "cm", "→ Using:", closestWidth + "cm");
      console.log("  📏 Requested Drop:", drop + "cm", "→ Using:", closestDrop + "cm");
      console.log("  💰 Manufacturing Price:", "£" + price);
      console.log("🔍 === END PRICING GRID LOOKUP ===");
      
      return price;
    }
    
    // Handle the actual data structure with dropRows (from uploaded CSV)
    if (gridData.dropRows && gridData.widthColumns) {
      const dropRows = gridData.dropRows;
      const widthColumns = gridData.widthColumns;
      
      console.log("📋 Available drops:", dropRows.map((r: any) => r.drop + "cm"));
      console.log("📋 Available widths:", widthColumns.map((w: string) => w + "cm"));
      
      // Find the closest drop row (rounds to nearest grid value)
      const dropValues = dropRows.map((r: any) => parseInt(r.drop));
      const closestDrop = dropValues.reduce((prev, curr) => {
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
      
      console.log("✅ Found closest drop row:", matchingDropRow.drop + "cm", "(looking for " + drop + "cm)");
      
      // Find the closest width column (rounds to nearest grid value)
      const widthValues = widthColumns.map((w: string) => parseInt(w.toString()));
      const closestWidth = widthValues.reduce((prev, curr) => {
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
      
      console.log("✅ Found closest width at index:", widthIndex, "=", closestWidth + "cm", "(looking for " + width + "cm)");
      
      // Get the price from the matching row and column
      const price = parseFloat(matchingDropRow.prices[widthIndex]?.toString() || "0");
      
      console.log("✅ GRID MATCH FOUND:");
      console.log("  📏 Requested Width:", width + "cm", "→ Using:", closestWidth + "cm");
      console.log("  📏 Requested Drop:", drop + "cm", "→ Using:", closestDrop + "cm");
      console.log("  💰 Manufacturing Price:", "£" + price);
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
    
    console.log("📊 Legacy pricing calculation result:", "£" + matchingPrice);
    return parseFloat(matchingPrice.toString()) || 0;
  } catch (error) {
    console.error("❌ Error parsing pricing grid:", error);
    return 0;
  }
};
