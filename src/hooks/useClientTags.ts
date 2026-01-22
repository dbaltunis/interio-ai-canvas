import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export const useClientTags = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["client-tags", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("clients")
        .select("tags")
        .eq("user_id", effectiveOwnerId)
        .not("tags", "is", null);

      if (error) throw error;

      // Extract unique tags from all clients
      const tagsSet = new Set<string>();
      (data || []).forEach(client => {
        if (client.tags && Array.isArray(client.tags)) {
          client.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });

      return Array.from(tagsSet).sort();
    },
    enabled: !!effectiveOwnerId,
    staleTime: 60000, // Cache for 1 minute
  });
};
