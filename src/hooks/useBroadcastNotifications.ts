import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BroadcastNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'both';
  recipient_type: 'all_clients' | 'team_members' | 'selected_users';
  recipient_ids: string[];
  template_id?: string;
  scheduled_for?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  recipients_count: number;
  success_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export const useBroadcastNotifications = () => {
  return useQuery({
    queryKey: ["broadcast-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("broadcast_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BroadcastNotification[];
    },
  });
};

export const useCreateBroadcastNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notification: Partial<BroadcastNotification> & { title: string; message: string; type: string; recipient_type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("broadcast_notifications")
        .insert({
          user_id: user.id,
          ...notification,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-notifications"] });
      toast({
        title: "Broadcast created",
        description: "Your broadcast notification has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create broadcast notification.",
        variant: "destructive",
      });
      console.error("Error creating broadcast:", error);
    },
  });
};

export const useSendBroadcastNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Call edge function to send broadcast
      const { data, error } = await supabase.functions.invoke('send-broadcast-notification', {
        body: { broadcastId: id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcast-notifications"] });
      toast({
        title: "Broadcast sent",
        description: "Your broadcast notification has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send broadcast notification.",
        variant: "destructive",
      });
      console.error("Error sending broadcast:", error);
    },
  });
};