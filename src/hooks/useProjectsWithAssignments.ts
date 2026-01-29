import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectAssignmentWithProfile {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  assigned_at: string;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

export type ProjectAssignmentsMap = Record<string, ProjectAssignmentWithProfile[]>;

export const useProjectsWithAssignments = (projectIds: string[]) => {
  return useQuery({
    queryKey: ["projects-assignments-bulk", projectIds.sort().join(",")],
    queryFn: async (): Promise<ProjectAssignmentsMap> => {
      if (!projectIds || projectIds.length === 0) {
        return {};
      }

      // Fetch all active assignments for the given projects
      const { data: assignments, error: assignmentsError } = await supabase
        .from("project_assignments")
        .select("id, project_id, user_id, role, is_active, assigned_at")
        .in("project_id", projectIds)
        .eq("is_active", true)
        .order("assigned_at", { ascending: false });

      if (assignmentsError) {
        console.error("Error fetching project assignments:", assignmentsError);
        throw assignmentsError;
      }

      if (!assignments || assignments.length === 0) {
        return {};
      }

      // Get unique user IDs
      const userIds = [...new Set(assignments.map(a => a.user_id))];

      // Fetch user profiles for all assigned users
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, avatar_url, role")
        .in("user_id", userIds);

      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
      }

      // Create a map of user_id to profile
      const profilesMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Build the result map: projectId -> assignments[]
      const result: ProjectAssignmentsMap = {};
      
      for (const assignment of assignments) {
        const profile = profilesMap.get(assignment.user_id);
        const enrichedAssignment: ProjectAssignmentWithProfile = {
          ...assignment,
          profile: profile ? {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            role: profile.role,
          } : null
        };

        if (!result[assignment.project_id]) {
          result[assignment.project_id] = [];
        }
        result[assignment.project_id].push(enrichedAssignment);
      }

      return result;
    },
    enabled: projectIds.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
};
