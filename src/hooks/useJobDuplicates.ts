import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useJobDuplicates = (jobId: string) => {
  return useQuery({
    queryKey: ["job-duplicates", jobId],
    queryFn: async () => {
      if (!jobId) return { parent: null, children: [] };

      // Get the current job to check if it has a parent
      const { data: currentJob } = await supabase
        .from("projects")
        .select("parent_job_id")
        .eq("id", jobId)
        .single();

      const parentJobId = currentJob?.parent_job_id;

      // Get parent job if exists
      let parent = null;
      if (parentJobId) {
        const { data } = await supabase
          .from("projects")
          .select("*, clients(name)")
          .eq("id", parentJobId)
          .single();
        parent = data;
      }

      // Get all children (duplicates) of this job
      const { data: children } = await supabase
        .from("projects")
        .select("*, clients(name)")
        .eq("parent_job_id", jobId)
        .order("created_at", { ascending: false });

      // If this job is a duplicate, also get its siblings
      let siblings: any[] = [];
      if (parentJobId) {
        const { data } = await supabase
          .from("projects")
          .select("*, clients(name)")
          .eq("parent_job_id", parentJobId)
          .neq("id", jobId)
          .order("created_at", { ascending: false });
        siblings = data || [];
      }

      return { 
        parent, 
        children: children || [], 
        siblings,
        isDuplicate: !!parentJobId,
        hasDuplicates: (children && children.length > 0) || false
      };
    },
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000,
  });
};
