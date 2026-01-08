import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMeasurement {
  id: string;
  name: string;
  width: number | null;
  height: number | null;
  project_id: string;
  project_name: string;
  room_id: string | null;
  room_name: string;
  windows_summary: {
    rail_width: number | null;
    drop: number | null;
    treatment_type: string | null;
    total_cost: number | null;
    template_name: string | null;
    fabric_details: any;
    measurements_details: any;
  } | null;
}

export const useClientProjectMeasurements = (clientId: string) => {
  return useQuery({
    queryKey: ["client-project-measurements", clientId],
    queryFn: async () => {
      // Get all projects for this client
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", clientId);

      if (projectsError) throw projectsError;
      if (!projects?.length) return [];

      const projectIds = projects.map(p => p.id);

      // Get all surfaces with their rooms for these projects
      const { data: surfaces, error: surfacesError } = await supabase
        .from("surfaces")
        .select(`
          id, 
          name, 
          width, 
          height, 
          project_id,
          room_id,
          rooms!left(id, name)
        `)
        .in("project_id", projectIds);

      if (surfacesError) throw surfacesError;
      if (!surfaces?.length) return [];

      // Get windows_summary for these surfaces
      const surfaceIds = surfaces.map(s => s.id);
      const { data: windowsSummary, error: summaryError } = await supabase
        .from("windows_summary")
        .select("*")
        .in("window_id", surfaceIds);

      if (summaryError) throw summaryError;

      // Map surfaces with their summary data
      const result: ProjectMeasurement[] = surfaces.map(surface => {
        const summary = windowsSummary?.find(ws => ws.window_id === surface.id);
        const project = projects.find(p => p.id === surface.project_id);
        const room = surface.rooms as any;

        return {
          id: surface.id,
          name: surface.name || 'Unnamed Window',
          width: surface.width,
          height: surface.height,
          project_id: surface.project_id,
          project_name: project?.name || 'Unknown Project',
          room_id: surface.room_id,
          room_name: room?.name || 'Unassigned Room',
          windows_summary: summary ? {
            rail_width: summary.rail_width,
            drop: summary.drop,
            treatment_type: summary.treatment_type,
            total_cost: summary.total_cost,
            template_name: summary.template_name,
            fabric_details: summary.fabric_details,
            measurements_details: summary.measurements_details,
          } : null,
        };
      });

      return result;
    },
    enabled: !!clientId,
  });
};
