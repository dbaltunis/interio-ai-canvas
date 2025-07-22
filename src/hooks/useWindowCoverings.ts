
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
        { id: "curtains", name: "Curtains", category: "fabric" },
        { id: "drapes", name: "Drapes", category: "fabric" },
        { id: "blinds", name: "Blinds", category: "hard" },
        { id: "shutters", name: "Shutters", category: "hard" },
        { id: "valances", name: "Valances", category: "fabric" },
        { id: "roman_shades", name: "Roman Shades", category: "fabric" },
        { id: "roller_shades", name: "Roller Shades", category: "hard" },
        { id: "cellular_shades", name: "Cellular Shades", category: "hard" }
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
