import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppointmentNotification {
  id: string;
  user_id: string;
  appointment_id: string;
  title: string;
  message: string;
  channels: string[];
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useAppointmentNotifications = () => {
  return useQuery({
    queryKey: ["appointment-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AppointmentNotification[];
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("appointment_notifications")
        .update({ status: 'cancelled' })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-notifications"] });
      toast({
        title: "Notification dismissed",
        description: "The notification has been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification status.",
        variant: "destructive",
      });
      console.error("Error updating notification:", error);
    },
  });
};

export const usePendingNotifications = () => {
  return useQuery({
    queryKey: ["pending-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointment_notifications")
        .select("*, appointments(title, start_time)")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data as (AppointmentNotification & {
        appointments: { title: string; start_time: string } | null;
      })[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};