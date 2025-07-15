
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_grids")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const usePricingGrid = (gridId: string) => {
  return useQuery({
    queryKey: ["pricing-grid", gridId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_grids")
        .select("*")
        .eq("id", gridId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!gridId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useCreatePricingGrid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gridData: { name: string; grid_data: any }) => {
      const { data, error } = await supabase
        .from("pricing_grids")
        .insert([{
          name: gridData.name,
          grid_data: gridData.grid_data as any
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    mutationFn: async (gridId: string) => {
      const { error } = await supabase
        .from("pricing_grids")
        .delete()
        .eq("id", gridId);
      
      if (error) throw error;
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
    
    // Handle the actual data structure with dropRows (from uploaded CSV)
    if (gridData.dropRows && gridData.widthColumns) {
      const dropRows = gridData.dropRows;
      const widthColumns = gridData.widthColumns;
      
      console.log("📋 Available drops:", dropRows.map((r: any) => r.drop + "cm"));
      console.log("📋 Available widths:", widthColumns.map((w: string) => w + "cm"));
      
      // Find the exact drop row
      const matchingDropRow = dropRows.find((row: any) => {
        const rowDrop = parseInt(row.drop);
        return rowDrop === drop;
      });
      
      if (!matchingDropRow) {
        console.log("❌ No exact drop match found for:", drop + "cm");
        return 0;
      }
      
      console.log("✅ Found matching drop row:", matchingDropRow.drop + "cm");
      
      // Find the exact width column index
      const widthIndex = widthColumns.findIndex((col: string) => {
        const colWidth = parseInt(col.toString());
        return colWidth === width;
      });
      
      if (widthIndex === -1) {
        console.log("❌ No exact width match found for:", width + "cm");
        console.log("Available widths:", widthColumns);
        return 0;
      }
      
      console.log("✅ Found matching width at index:", widthIndex, "for width:", width + "cm");
      
      // Get the price from the matching row and column
      const price = parseFloat(matchingDropRow.prices[widthIndex]?.toString() || "0");
      
      console.log("✅ EXACT MATCH FOUND:");
      console.log("  📏 Width:", width + "cm");
      console.log("  📏 Drop:", drop + "cm");
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
