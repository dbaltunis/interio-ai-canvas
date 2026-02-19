import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Batch-fetch accurate project totals from windows_summary.
 * Returns a map of projectId -> { total, hasData }.
 * This replaces reliance on the often-stale quotes.total_amount.
 */
export const useProjectTotals = (projectIds: string[]) => {
  return useQuery({
    queryKey: ["project-totals-batch", projectIds.sort().join(",")],
    queryFn: async () => {
      if (projectIds.length === 0) return {} as Record<string, { total: number; hasData: boolean }>;

      // Fetch all surfaces for these projects
      const { data: surfaces, error: surfacesError } = await supabase
        .from("surfaces")
        .select("id, project_id")
        .in("project_id", projectIds);

      if (surfacesError) throw surfacesError;
      if (!surfaces || surfaces.length === 0) return {} as Record<string, { total: number; hasData: boolean }>;

      const surfaceIds = surfaces.map((s) => s.id);
      const surfaceToProject = Object.fromEntries(surfaces.map((s) => [s.id, s.project_id]));

      // Fetch all windows_summary for those surfaces
      const { data: summaries, error: summariesError } = await supabase
        .from("windows_summary")
        .select("window_id, total_cost, total_selling")
        .in("window_id", surfaceIds);

      if (summariesError) throw summariesError;

      // Aggregate by project
      const result: Record<string, { total: number; hasData: boolean }> = {};

      // Initialize all requested projects
      for (const pid of projectIds) {
        result[pid] = { total: 0, hasData: false };
      }

      for (const s of summaries || []) {
        const projectId = surfaceToProject[s.window_id];
        if (!projectId) continue;

        const selling = Number(s.total_selling || 0);
        const cost = Number(s.total_cost || 0);
        const amount = selling > 0 ? selling : cost;

        if (!result[projectId]) {
          result[projectId] = { total: 0, hasData: false };
        }
        result[projectId].total += amount;
        if (amount > 0) result[projectId].hasData = true;
      }

      return result;
    },
    enabled: projectIds.length > 0,
    staleTime: 30_000, // 30s cache
    refetchOnWindowFocus: true,
  });
};
