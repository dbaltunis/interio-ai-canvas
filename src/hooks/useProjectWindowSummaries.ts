
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

      windows.forEach((w) => {
        const amount = Number(w.summary?.total_cost || 0);
        projectTotal += amount;
        const roomId = w.room_id || "unknown";
        totalsByRoom[roomId] = (totalsByRoom[roomId] || 0) + amount;
      });

      return { windows, totalsByRoom, projectTotal };
    },
    enabled: !!projectId,
  });
};
