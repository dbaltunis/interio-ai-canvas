import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the count of pending materials in the queue
 * Used for badge indicators in navigation
 */
export const useMaterialQueueCount = () => {
  return useQuery({
    queryKey: ['material-queue-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('material_order_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
