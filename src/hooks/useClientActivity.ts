import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ActivityType = 
  | "follow_up_completed"
  | "email_sent"
  | "call_made"
  | "meeting_held"
  | "quote_created"
  | "project_started"
  | "note_added"
  | "reminder_snoozed"
  | "stage_changed"
  | "task_completed";

export interface ClientActivity {
  id: string;
  client_id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  value_amount?: number;
  team_member?: string;
  follow_up_date?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useClientActivities = (clientId: string) => {
  return useQuery({
    queryKey: ["client-activities", clientId],
    queryFn: async () => {
      console.log("Fetching activities for client:", clientId);
      const { data, error } = await supabase
        .from("client_activity_log")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activities:", error);
        throw error;
      }
      console.log("Activities fetched:", data?.length, "records");
      return data as ClientActivity[];
    },
    enabled: !!clientId,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: {
      client_id: string;
      activity_type: ActivityType;
      title: string;
      description?: string;
      value_amount?: number;
      team_member?: string;
      follow_up_date?: string;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("client_activity_log")
        .insert({
          ...activity,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Activity creation error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-activities", data.client_id] });
      // Removed unnecessary success toast
    },
    onError: (error: any) => {
      console.error("Failed to create activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log activity",
        variant: "destructive",
      });
    },
  });
};
