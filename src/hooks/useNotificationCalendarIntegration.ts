
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";

interface ScheduleReminderParams {
  notificationId: string;
  title: string;
  message: string;
  scheduleDate: Date;
  duration: number;
}

export const useScheduleNotificationReminder = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ScheduleReminderParams) => {
      if (!user) throw new Error("User not authenticated");

      const { notificationId, title, message, scheduleDate, duration } = params;

      // Create a calendar appointment (using the appointments table)
      const { data, error } = await supabase
        .from("appointments")
        .insert([{
          user_id: user.id,
          title: `Reminder: ${title}`,
          description: message,
          start_time: scheduleDate.toISOString(),
          end_time: new Date(scheduleDate.getTime() + duration * 60000).toISOString(),
          appointment_type: 'reminder',
          status: 'scheduled'
        }])
        .select()
        .single();

      if (error) throw error;

      // Create a follow-up notification for the scheduled time
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([{
          user_id: user.id,
          title: `Scheduled: ${title}`,
          message: `Reminder scheduled for ${scheduleDate.toLocaleDateString()} at ${scheduleDate.toLocaleTimeString()}`,
          type: 'info'
        }]);

      if (notificationError) throw notificationError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Reminder Scheduled",
        description: "Your reminder has been added to the calendar",
      });
    },
    onError: (error) => {
      console.error('Failed to schedule reminder:', error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder",
        variant: "destructive",
      });
    },
  });
};
