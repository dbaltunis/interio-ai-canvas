
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ClientActivity {
  id: string;
  client_id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description?: string;
  value_amount?: number;
  team_member?: string;
  follow_up_date?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useClientActivityLog = (clientId: string) => {
  return useQuery({
    queryKey: ["client-activity-log", clientId],
    queryFn: async (): Promise<ClientActivity[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First, check if the client_activity_log table exists and has data
      const { data, error } = await supabase
        .from("client_activity_log")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching client activity log:", error);
        // If table doesn't exist or has an error, return empty array for now
        return [];
      }

      return data || [];
    },
    enabled: !!clientId,
  });
};

export const useCreateClientActivity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: Omit<ClientActivity, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("client_activity_log")
        .insert({
          ...activity,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-activity-log", data.client_id] });
      toast({
        title: "Success",
        description: "Activity logged successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to log activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to log activity. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateClientActivity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ClientActivity>) => {
      const { data, error } = await supabase
        .from("client_activity_log")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-activity-log", data.client_id] });
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update activity:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update activity. Please try again.",
        variant: "destructive"
      });
    },
  });
};
