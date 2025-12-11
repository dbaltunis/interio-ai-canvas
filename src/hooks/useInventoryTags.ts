import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight hook to fetch just tags from inventory
 * Used by FilterButton to avoid loading full inventory
 */
export const useInventoryTags = () => {
  return useQuery({
    queryKey: ["inventory-tags"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Only fetch tags column for performance
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("tags")
        .eq("active", true);

      if (error) throw error;

      // Extract unique tags
      const tagsSet = new Set<string>();
      (data || []).forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });

      return Array.from(tagsSet).sort();
    },
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 600000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? [],
  });
};

/**
 * Lightweight hook to fetch just storage locations from inventory
 */
export const useInventoryLocations = () => {
  return useQuery({
    queryKey: ["inventory-locations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Only fetch location column for performance
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("location")
        .eq("active", true)
        .not("location", "is", null);

      if (error) throw error;

      // Extract unique locations
      const locationsSet = new Set<string>();
      (data || []).forEach(item => {
        if (item.location) {
          locationsSet.add(item.location);
        }
      });

      return Array.from(locationsSet).sort();
    },
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 600000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? [],
  });
};
