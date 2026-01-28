import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

interface StatusReasonEntry {
  id: string;
  new_status_name: string | null;
  reason: string | null;
  user_name: string | null;
  user_email: string | null;
  changed_at: string;
  project_id: string;
  project_name?: string;
}

export const useStatusReasonsKPI = (limit: number = 10) => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ['status-reasons-kpi', effectiveOwnerId, limit],
    queryFn: async (): Promise<StatusReasonEntry[]> => {
      if (!effectiveOwnerId) return [];

      // Get recent status changes that have reasons (rejections, cancellations, on hold)
      const { data: statusChanges, error: statusError } = await supabase
        .from('status_change_history')
        .select(`
          id,
          new_status_name,
          reason,
          user_name,
          user_email,
          changed_at,
          project_id
        `)
        .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
        .not('reason', 'is', null)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (statusError) {
        console.error("Error fetching status reasons:", statusError);
        return [];
      }

      if (!statusChanges || statusChanges.length === 0) {
        return [];
      }

      // Get project names for the status changes
      const projectIds = [...new Set(statusChanges.map(sc => sc.project_id))];
      
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds);

      if (projectError) {
        console.error("Error fetching project names:", projectError);
      }

      // Create a map of project IDs to names
      const projectMap = new Map(
        (projects || []).map(p => [p.id, p.name])
      );

      // Combine the data
      return statusChanges.map(sc => ({
        ...sc,
        project_name: projectMap.get(sc.project_id) || 'Unknown Project'
      }));
    },
    enabled: !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
