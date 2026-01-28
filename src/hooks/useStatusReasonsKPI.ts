import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { useDashboardDate } from "@/contexts/DashboardDateContext";
import { subDays, differenceInDays } from "date-fns";

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

interface StatusReasonsData {
  current: StatusReasonEntry[];
  currentCounts: { Rejected: number; Cancelled: number; 'On Hold': number };
  previousCounts: { Rejected: number; Cancelled: number; 'On Hold': number };
  total: number;
  previousTotal: number;
  changePercent: number;
}

export const useStatusReasonsKPI = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  const { dateRange } = useDashboardDate();
  
  return useQuery({
    queryKey: ['status-reasons-kpi', effectiveOwnerId, dateRange.startDate.toISOString(), dateRange.endDate.toISOString()],
    queryFn: async (): Promise<StatusReasonsData> => {
      if (!effectiveOwnerId) {
        return {
          current: [],
          currentCounts: { Rejected: 0, Cancelled: 0, 'On Hold': 0 },
          previousCounts: { Rejected: 0, Cancelled: 0, 'On Hold': 0 },
          total: 0,
          previousTotal: 0,
          changePercent: 0,
        };
      }

      // Calculate previous period for comparison
      const daysDiff = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;
      const previousStart = subDays(dateRange.startDate, daysDiff);
      const previousEnd = subDays(dateRange.startDate, 1);

      // Fetch current period status changes
      const { data: currentChanges, error: currentError } = await supabase
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
        .gte('changed_at', dateRange.startDate.toISOString())
        .lte('changed_at', dateRange.endDate.toISOString())
        .order('changed_at', { ascending: false });

      if (currentError) {
        console.error("Error fetching current status reasons:", currentError);
        throw currentError;
      }

      // Fetch previous period status changes for comparison
      const { data: previousChanges, error: previousError } = await supabase
        .from('status_change_history')
        .select('new_status_name')
        .in('new_status_name', ['Rejected', 'Cancelled', 'On Hold'])
        .gte('changed_at', previousStart.toISOString())
        .lte('changed_at', previousEnd.toISOString());

      if (previousError) {
        console.error("Error fetching previous status reasons:", previousError);
      }

      // Count by status for current period
      const currentCounts = { Rejected: 0, Cancelled: 0, 'On Hold': 0 };
      (currentChanges || []).forEach(sc => {
        if (sc.new_status_name && sc.new_status_name in currentCounts) {
          currentCounts[sc.new_status_name as keyof typeof currentCounts]++;
        }
      });

      // Count by status for previous period
      const previousCounts = { Rejected: 0, Cancelled: 0, 'On Hold': 0 };
      (previousChanges || []).forEach(sc => {
        if (sc.new_status_name && sc.new_status_name in previousCounts) {
          previousCounts[sc.new_status_name as keyof typeof previousCounts]++;
        }
      });

      const total = currentCounts.Rejected + currentCounts.Cancelled + currentCounts['On Hold'];
      const previousTotal = previousCounts.Rejected + previousCounts.Cancelled + previousCounts['On Hold'];
      
      // Calculate percentage change
      let changePercent = 0;
      if (previousTotal > 0) {
        changePercent = ((total - previousTotal) / previousTotal) * 100;
      } else if (total > 0) {
        changePercent = 100; // If no previous data but current exists, 100% increase
      }

      // Get project names for current period entries
      if (currentChanges && currentChanges.length > 0) {
        const projectIds = [...new Set(currentChanges.map(sc => sc.project_id))];
        
        const { data: projects, error: projectError } = await supabase
          .from('projects')
          .select('id, name')
          .in('id', projectIds);

        if (projectError) {
          console.error("Error fetching project names:", projectError);
        }

        const projectMap = new Map(
          (projects || []).map(p => [p.id, p.name])
        );

        const enrichedChanges = currentChanges.map(sc => ({
          ...sc,
          project_name: projectMap.get(sc.project_id) || 'Unknown Project'
        }));

        return {
          current: enrichedChanges,
          currentCounts,
          previousCounts,
          total,
          previousTotal,
          changePercent,
        };
      }

      return {
        current: [],
        currentCounts,
        previousCounts,
        total,
        previousTotal,
        changePercent,
      };
    },
    enabled: !!effectiveOwnerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
