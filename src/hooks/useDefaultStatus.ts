import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import type { Tables } from "@/integrations/supabase/types";

type JobStatus = Tables<"job_statuses">;

export const useDefaultStatus = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["default_status", effectiveOwnerId],
    queryFn: async (): Promise<JobStatus | null> => {
      if (!effectiveOwnerId) return null;

      const { data, error } = await supabase
        .from("job_statuses")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching default status:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!effectiveOwnerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
