import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";

export const useClientFilesCount = (clientIds: string[]) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["client-files-count", effectiveOwnerId, clientIds],
    queryFn: async () => {
      if (!effectiveOwnerId || clientIds.length === 0) return {};

      const { data, error } = await supabase
        .from('client_files')
        .select('client_id')
        .eq('user_id', effectiveOwnerId)
        .in('client_id', clientIds);

      if (error) throw error;

      // Count files per client
      const counts: Record<string, number> = {};
      (data || []).forEach(file => {
        counts[file.client_id] = (counts[file.client_id] || 0) + 1;
      });
      
      return counts;
    },
    enabled: !!effectiveOwnerId && clientIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
