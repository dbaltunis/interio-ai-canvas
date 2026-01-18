
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectWindowSummariesResult {
  windows: Array<{
    window_id: string;
    room_id: string | null;
    surface_name: string | null;
    summary: any | null;
  }>;
  totalsByRoom: Record<string, number>;
  projectTotal: number;
}

export const useProjectWindowSummaries = (projectId?: string) => {
  return useQuery<ProjectWindowSummariesResult>({
    queryKey: ["project-window-summaries", projectId],
    queryFn: async () => {
      if (!projectId) return { windows: [], totalsByRoom: {}, projectTotal: 0 };

      // Fetch surfaces for the project (ids, names, room linkage)
      const { data: surfaces, error: surfacesError } = await supabase
        .from("surfaces")
        .select("id, name, room_id")
        .eq("project_id", projectId);

      if (surfacesError) throw surfacesError;

      const surfaceIds = (surfaces || []).map((s) => s.id);
      if (surfaceIds.length === 0) {
        return { windows: [], totalsByRoom: {}, projectTotal: 0 };
      }

      // Fetch summaries for those surfaces
      const { data: summaries, error: summariesError } = await supabase
        .from("windows_summary")
        .select("*")
        .in("window_id", surfaceIds);

      if (summariesError) throw summariesError;

      const byId = Object.fromEntries((surfaces || []).map((s) => [s.id, s]));
      const windows = (surfaces || []).map((s) => ({
        window_id: s.id as string,
        room_id: (s as any).room_id ?? null,
        surface_name: (s as any).name ?? null,
        summary: (summaries || []).find((w: any) => w.window_id === s.id) || null,
      }));

      const totalsByRoom: Record<string, number> = {};
      let projectTotal = 0;

      // DISPLAY-ONLY ARCHITECTURE: Use saved total_cost and total_selling directly
      windows.forEach((w) => {
        const costAmount = w.summary ? Number((w.summary as any).total_cost || 0) : 0;
        const sellingAmount = w.summary ? Number((w.summary as any).total_selling || 0) : 0;
        
        console.log(`📊 [DISPLAY-ONLY] Window ${w.window_id}: Cost ${costAmount}, Selling ${sellingAmount}`);
        
        // Use selling if available, otherwise cost
        const displayAmount = sellingAmount > 0 ? sellingAmount : costAmount;
        projectTotal += displayAmount;
        const roomId = w.room_id || "unknown";
        totalsByRoom[roomId] = (totalsByRoom[roomId] || 0) + displayAmount;
      });

      return { windows, totalsByRoom, projectTotal };
    },
    enabled: !!projectId,
    // PHASE 3: Disabled aggressive polling to prevent state resets
    // Rely on manual query invalidation after saves instead
    refetchInterval: false,
    // Ensure it refetches when user focuses the tab
    refetchOnWindowFocus: true,
    // Keep previous data while refetching to prevent flashing
    placeholderData: (prev) => prev
  });
};
