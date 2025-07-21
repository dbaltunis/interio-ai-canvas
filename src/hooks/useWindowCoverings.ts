
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useWindowCoverings = () => {
  return useQuery({
    queryKey: ["window-coverings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // For now, return mock data since we don't have the window_coverings table yet
      // This should be replaced with actual Supabase query when the table exists
      return [
        { id: "1", name: "Curtains", description: "Classic fabric curtains" },
        { id: "2", name: "Blinds", description: "Horizontal or vertical blinds" },
        { id: "3", name: "Shutters", description: "Interior window shutters" },
        { id: "4", name: "Drapes", description: "Heavy fabric drapes" },
        { id: "5", name: "Roman Shades", description: "Fabric roman shades" }
      ];
    },
  });
};
