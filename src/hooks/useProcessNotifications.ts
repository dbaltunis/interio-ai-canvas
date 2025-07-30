import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProcessPendingNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      // Get all pending notifications that should be sent
      const { data: pendingNotifications, error: fetchError } = await supabase
        .from("appointment_notifications")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString());

      if (fetchError) throw fetchError;

      console.log("Found pending notifications to process:", pendingNotifications);

      // Process each notification
      for (const notification of pendingNotifications) {
        try {
          console.log("Processing notification:", notification.id);
          
          // Call the send-appointment-notifications edge function
          const { data: result, error: sendError } = await supabase.functions.invoke(
            "send-appointment-notifications",
            {
              body: {
                notificationId: notification.id,
                appointmentId: notification.appointment_id,
                userId: notification.user_id,
                title: notification.title,
                message: notification.message,
                channels: notification.channels,
              },
            }
          );

          if (sendError) {
            console.error("Error sending notification:", sendError);
            // Update notification status to failed
            await supabase
              .from("appointment_notifications")
              .update({ 
                status: "failed", 
                error_message: sendError.message,
                sent_at: new Date().toISOString()
              })
              .eq("id", notification.id);
          } else {
            console.log("Successfully processed notification:", notification.id, result);
          }
        } catch (error) {
          console.error("Error processing notification:", notification.id, error);
          // Update notification status to failed
          await supabase
            .from("appointment_notifications")
            .update({ 
              status: "failed", 
              error_message: error.message,
              sent_at: new Date().toISOString()
            })
            .eq("id", notification.id);
        }
      }

      return pendingNotifications.length;
    },
    onSuccess: (processedCount) => {
      queryClient.invalidateQueries({ queryKey: ["appointment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["pending-notifications"] });
      
      toast({
        title: "Notifications processed",
        description: `Successfully processed ${processedCount} pending notifications.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process notifications. Please try again.",
        variant: "destructive",
      });
      console.error("Error processing notifications:", error);
    },
  });
};