
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WindowCovering {
  id: string;
  name: string;
  category: string;
  description?: string;
  base_price?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const useWindowCoverings = () => {
  return useQuery({
    queryKey: ["window-coverings"],
    queryFn: async () => {
      // For now, return static data until we have a proper window_coverings table
      // This can be expanded to fetch from database later
      return [
        { id: "curtains", name: "Curtains", category: "fabric", base_price: 45 },
        { id: "drapes", name: "Drapes", category: "fabric", base_price: 65 },
        { id: "blinds", name: "Blinds", category: "hard", base_price: 35 },
        { id: "shutters", name: "Shutters", category: "hard", base_price: 120 },
        { id: "valances", name: "Valances", category: "fabric", base_price: 25 },
        { id: "roman_shades", name: "Roman Shades", category: "fabric", base_price: 55 },
        { id: "roller_shades", name: "Roller Shades", category: "hard", base_price: 40 },
        { id: "cellular_shades", name: "Cellular Shades", category: "hard", base_price: 50 }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
