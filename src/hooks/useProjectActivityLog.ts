import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProjectActivityType = 
  | 'status_changed'
  | 'team_assigned'
  | 'team_removed'
  | 'email_sent'
  | 'quote_created'
  | 'quote_sent'
  | 'note_added'
  | 'client_linked'
  | 'project_created'
  | 'project_duplicated'
  | 'room_added'
  | 'window_added'
  | 'treatment_added'
  | 'share_link_created'
  | 'pdf_exported';

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: ProjectActivityType;
  title: string;
  description: string | null;
  metadata: any;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export const useProjectActivityLog = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["project-activity-log", projectId],
    queryFn: async (): Promise<ProjectActivity[]> => {
      if (!projectId) return [];

      // Fetch activity logs
      const { data: activities, error } = await supabase
        .from("project_activity_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project activity log:", error);
        throw error;
      }

      if (!activities || activities.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(activities.map(a => a.user_id))];
      
      // Fetch user profiles for display names
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      // Merge profile data with activities
      return activities.map(activity => {
        const profile = profiles?.find(p => p.user_id === activity.user_id);
        return {
          ...activity,
          activity_type: activity.activity_type as ProjectActivityType,
          user_name: profile?.display_name || 'Unknown User',
        };
      });
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
};

interface LogActivityParams {
  projectId: string;
  activityType: ProjectActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const useLogProjectActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      activityType,
      title,
      description,
      metadata
    }: LogActivityParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("project_activity_log")
        .insert({
          project_id: projectId,
          user_id: user.id,
          activity_type: activityType,
          title,
          description: description || null,
          metadata: metadata || null
        })
        .select()
        .single();

      if (error) {
        console.error("Error logging project activity:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-activity-log", data.project_id] });
    },
  });
};

// Helper function to log activity without needing mutation hook
export const logProjectActivity = async ({
  projectId,
  activityType,
  title,
  description,
  metadata
}: LogActivityParams) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("Cannot log activity: user not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("project_activity_log")
    .insert({
      project_id: projectId,
      user_id: user.id,
      activity_type: activityType,
      title,
      description: description || null,
      metadata: metadata || null
    })
    .select()
    .single();

  if (error) {
    console.error("Error logging project activity:", error);
    return null;
  }

  return data;
};
