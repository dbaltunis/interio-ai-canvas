import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type JobStatus = Tables<"job_statuses">;

export const useDefaultStatus = () => {
  return useQuery({
    queryKey: ["default_status"],
    queryFn: async (): Promise<JobStatus | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("job_statuses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching default status:", error);
        return null;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};