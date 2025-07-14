
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
  if (!gridData) return 0;
  
  try {
    // Handle the actual data structure with dropRows
    if (gridData.dropRows) {
      const dropRows = gridData.dropRows;
      const dropInCm = Math.round(drop * 100); // Convert meters to cm
      
      // Find the matching drop row
      const matchingRow = dropRows.find((row: any) => {
        const rowDrop = parseInt(row.drop);
        return rowDrop === dropInCm;
      });
      
      if (matchingRow && matchingRow.prices && matchingRow.prices.length > 0) {
        // For now, return the first price since we don't have width mapping
        // This could be enhanced to map width to specific price index
        return parseFloat(matchingRow.prices[0].toString()) || 0;
      }
      
      return 0;
    }
    
    // Handle the old structure with rows and columns (fallback)
    const rows = gridData.rows;
    if (!rows) return 0;
    
    // Find the appropriate row based on drop ranges
    let matchingRow = null;
    for (const row of rows) {
      if (row.drop_min <= drop && drop <= row.drop_max) {
        matchingRow = row;
        break;
      }
    }
    
    if (!matchingRow) return 0;
    
    // Find the appropriate column based on width ranges
    const columns = gridData.columns || [];
    let matchingPrice = 0;
    
    for (const col of columns) {
      if (col.width_min <= width && width <= col.width_max) {
        matchingPrice = matchingRow[col.key] || 0;
        break;
      }
    }
    
    return parseFloat(matchingPrice.toString()) || 0;
  } catch (error) {
    console.error("Error parsing pricing grid:", error);
    return 0;
  }
};
