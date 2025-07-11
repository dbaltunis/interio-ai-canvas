
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWindowCoveringTypes = () => {
  return useQuery({
    queryKey: ["window-covering-types"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get making costs (which represent window covering types)
      const { data: makingCosts, error } = await supabase
        .from("making_costs")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("name");

      if (error) {
        console.error("Error fetching making costs:", error);
        return [];
      }

      // Transform making costs into treatment types
      const treatmentTypes = makingCosts?.map(cost => ({
        id: cost.id,
        name: cost.name,
        category: 'window_covering',
        description: cost.description,
        type: cost.name.toLowerCase().replace(/\s+/g, '_')
      })) || [];

      // Add default treatment types if no custom ones exist
      const defaultTypes = [
        { id: 'curtains', name: 'Curtains', category: 'window_covering', type: 'curtains' },
        { id: 'blinds', name: 'Blinds', category: 'window_covering', type: 'blinds' },
        { id: 'shutters', name: 'Shutters', category: 'window_covering', type: 'shutters' },
        { id: 'valances', name: 'Valances', category: 'window_covering', type: 'valances' }
      ];

      return treatmentTypes.length > 0 ? treatmentTypes : defaultTypes;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
