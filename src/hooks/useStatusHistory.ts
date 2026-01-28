import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StatusChangeRecord {
  id: string;
  project_id: string;
  previous_status_id: string | null;
  new_status_id: string | null;
  previous_status_name: string | null;
  new_status_name: string | null;
  changed_by: string;
  changed_at: string;
  reason: string | null;
  notes: string | null;
  user_name: string | null;
  user_email: string | null;
}

export const useStatusHistory = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["status_history", projectId],
    queryFn: async (): Promise<StatusChangeRecord[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("status_change_history")
        .select("*")
        .eq("project_id", projectId)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Error fetching status history:", error);
        throw error;
      }

      return (data || []) as StatusChangeRecord[];
    },
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute
  });
};

interface LogStatusChangeParams {
  projectId: string;
  previousStatusId: string | null;
  newStatusId: string;
  previousStatusName: string | null;
  newStatusName: string;
  reason?: string;
  notes?: string;
}

export const useLogStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      previousStatusId,
      newStatusId,
      previousStatusName,
      newStatusName,
      reason,
      notes,
    }: LogStatusChangeParams) => {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get user profile for name
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Insert the status change record
      const { data, error } = await supabase
        .from("status_change_history")
        .insert({
          project_id: projectId,
          previous_status_id: previousStatusId,
          new_status_id: newStatusId,
          previous_status_name: previousStatusName,
          new_status_name: newStatusName,
          changed_by: user.id,
          reason,
          notes,
          user_name: profile?.display_name || null,
          user_email: user.email || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error logging status change:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["status_history", variables.projectId] });
    },
  });
};
