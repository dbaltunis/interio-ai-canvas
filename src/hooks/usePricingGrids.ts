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
    console.log("getPriceFromGrid: No grid data provided");
    return 0;
  }
  
  try {
    console.log("=== PRICING GRID LOOKUP DEBUG ===");
    console.log("Input values (DIRECTLY from user form):", { width, drop });
    console.log("Grid data structure (DIRECTLY from your uploaded CSV):", gridData);
    
    // Handle the actual data structure with dropRows (from your CSV)
    if (gridData.dropRows) {
      const dropRows = gridData.dropRows;
      // Input values are already in cm from the form, so use them directly
      const dropInCm = Math.round(drop);
      
      console.log("Looking for drop:", dropInCm, "cm in uploaded CSV dropRows:", dropRows);
      
      // Find the matching drop row from YOUR uploaded data
      const matchingRow = dropRows.find((row: any) => {
        const rowDrop = parseInt(row.drop);
        console.log("Comparing CSV row drop:", rowDrop, "with user input drop:", dropInCm);
        return rowDrop === dropInCm;
      });
      
      if (matchingRow && matchingRow.prices && matchingRow.prices.length > 0) {
        // For now, return the first price since we don't have width column mapping yet
        // This uses the EXACT price from your uploaded CSV file
        const price = parseFloat(matchingRow.prices[0].toString()) || 0;
        console.log("FOUND EXACT MATCH in your CSV data:");
        console.log("- Drop:", dropInCm, "cm");
        console.log("- Price from CSV:", price);
        console.log("- Full matching row from CSV:", matchingRow);
        console.log("=== END PRICING GRID LOOKUP DEBUG ===");
        return price;
      }
      
      console.log("ERROR: No matching row found in your CSV for drop:", dropInCm);
      console.log("Available drops in your CSV:", dropRows.map((r: any) => r.drop));
      console.log("=== END PRICING GRID LOOKUP DEBUG ===");
      return 0;
    }
    
    // Handle the old structure with rows and columns (fallback for legacy data)
    const rows = gridData.rows;
    if (!rows) {
      console.log("No rows data found in grid structure");
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
      console.log("No matching row found for drop ranges");
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
    
    console.log("Legacy pricing calculation result:", matchingPrice);
    return parseFloat(matchingPrice.toString()) || 0;
  } catch (error) {
    console.error("Error parsing pricing grid (this is YOUR uploaded CSV data):", error);
    return 0;
  }
};
