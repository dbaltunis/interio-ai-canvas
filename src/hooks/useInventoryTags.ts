import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

/**
 * Lightweight hook to fetch just tags from inventory
 * Used by FilterButton to avoid loading full inventory
 */
export const useInventoryTags = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["inventory-tags", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Only fetch tags column for performance
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("tags")
        .eq("user_id", effectiveOwnerId)
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
    enabled: !!effectiveOwnerId,
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
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["inventory-locations", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Only fetch location column for performance
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("location")
        .eq("user_id", effectiveOwnerId)
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
    enabled: !!effectiveOwnerId,
    staleTime: 300000, // Cache for 5 minutes
    gcTime: 600000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? [],
  });
};

/**
 * Lightweight hook to fetch unique colors from inventory
 */
export const useInventoryColors = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["inventory-colors", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      // Only fetch color column for performance
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("color")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .not("color", "is", null);

      if (error) throw error;

      // Extract unique colors
      const colorsSet = new Set<string>();
      (data || []).forEach(item => {
        if (item.color && item.color.trim()) {
          colorsSet.add(item.color.trim());
        }
      });

      return Array.from(colorsSet).sort();
    },
    enabled: !!effectiveOwnerId,
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? [],
  });
};
