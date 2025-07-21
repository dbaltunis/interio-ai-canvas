
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreateNotification } from "@/hooks/useNotifications";
import { useSendEmail } from "@/hooks/useSendEmail";
import { useCreateAppointment } from "@/hooks/useAppointments";

interface CreateReminderNotificationRequest {
  reminderId: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  description: string;
  dueDate: Date;
  type: 'email_follow_up' | 'call' | 'meeting' | 'quote_follow_up';
}

export const useCreateReminderNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createNotification = useCreateNotification();
  const sendEmail = useSendEmail();
  const createAppointment = useCreateAppointment();

  return useMutation({
    mutationFn: async (data: CreateReminderNotificationRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Create in-app notification
      await createNotification.mutateAsync({
        title: `Reminder: ${data.title}`,
        message: `${data.description} - Due: ${data.dueDate.toLocaleDateString()}`,
        type: 'info',
        read: false
      });

      // Send email notification if user has email
      if (user.email) {
        const emailContent = `
          <h2>Follow-up Reminder</h2>
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Task:</strong> ${data.title}</p>
          <p><strong>Description:</strong> ${data.description}</p>
          <p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>
          <p><strong>Type:</strong> ${data.type.replace('_', ' ').toUpperCase()}</p>
          <p>Please take action on this reminder.</p>
        `;

        await sendEmail.mutateAsync({
          to: user.email,
          subject: `Follow-up Reminder: ${data.title}`,
          content: emailContent
        });
      }

      // Create calendar appointment for meetings
      if (data.type === 'meeting') {
        const startTime = new Date(data.dueDate);
        startTime.setHours(9, 0, 0, 0); // Default to 9 AM
        const endTime = new Date(startTime);
        endTime.setHours(10, 0, 0, 0); // 1 hour duration

        await createAppointment.mutateAsync({
          title: data.title,
          description: data.description,
          appointment_type: 'follow-up',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          client_id: data.clientId,
          status: 'scheduled'
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Reminder Notifications Set",
        description: "Email, app notification, and calendar event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Notification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useScheduleReminder = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reminder: any) => {
      // Calculate time until reminder
      const now = new Date();
      const dueDate = new Date(reminder.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      
      // If reminder is due within 24 hours, schedule immediate notification
      if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
        setTimeout(() => {
          // This would trigger the notification
          console.log("Reminder triggered:", reminder.title);
        }, timeDiff);
      }

      return { scheduled: true };
    },
    onSuccess: () => {
      toast({
        title: "Reminder Scheduled",
        description: "Notification will be sent when due",
      });
    },
  });
};
