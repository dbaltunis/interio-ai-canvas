import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendSMSNotificationRequest {
  phoneNumber: string;
  message: string;
  templateId?: string;
  clientId?: string;
  appointmentId?: string;
  quoteId?: string;
  projectId?: string;
}

export const useSendSMSNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SendSMSNotificationRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Send SMS via edge function
      const { data, error } = await supabase.functions.invoke("send-bulk-sms", {
        body: {
          phoneNumbers: [request.phoneNumber],
          message: request.message,
          templateId: request.templateId,
          userId: user.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-delivery-logs"] });
      toast.success("SMS notification sent successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to send SMS: ${error.message}`);
    },
  });
};

// Hook to send appointment reminders
export const useSendAppointmentReminder = () => {
  const sendSMS = useSendSMSNotification();

  return useMutation({
    mutationFn: async ({ appointmentId, phoneNumber, customMessage }: {
      appointmentId: string;
      phoneNumber: string;
      customMessage?: string;
    }) => {
      // Get appointment details
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select("title, start_time, location")
        .eq("id", appointmentId)
        .single();

      if (error) throw error;

      const appointmentDate = new Date(appointment.start_time);
      const formattedDate = appointmentDate.toLocaleDateString();
      const formattedTime = appointmentDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const message = customMessage || 
        `Reminder: You have an appointment "${appointment.title}" scheduled for ${formattedDate} at ${formattedTime}. ${appointment.location ? `Location: ${appointment.location}` : ''} Please confirm or call if you need to reschedule.`;

      return sendSMS.mutateAsync({
        phoneNumber,
        message,
        appointmentId,
      });
    },
    onSuccess: () => {
      toast.success("Appointment reminder sent");
    },
  });
};

// Hook to send quote notifications
export const useSendQuoteNotification = () => {
  const sendSMS = useSendSMSNotification();

  return useMutation({
    mutationFn: async ({ quoteId, phoneNumber, notificationType }: {
      quoteId: string;
      phoneNumber: string;
      notificationType: 'created' | 'updated' | 'approved' | 'expired';
    }) => {
      // Get quote details
      const { data: quote, error } = await supabase
        .from("quotes")
        .select("quote_number, total_amount, valid_until")
        .eq("id", quoteId)
        .single();

      if (error) throw error;

      let message = "";
      switch (notificationType) {
        case 'created':
          message = `Your quote #${quote.quote_number} for $${quote.total_amount} is ready! Valid until ${new Date(quote.valid_until).toLocaleDateString()}. Review and approve at your convenience.`;
          break;
        case 'updated':
          message = `Quote #${quote.quote_number} has been updated. New total: $${quote.total_amount}. Please review the changes.`;
          break;
        case 'approved':
          message = `Thank you for approving quote #${quote.quote_number}! We'll begin processing your order shortly.`;
          break;
        case 'expired':
          message = `Quote #${quote.quote_number} expired on ${new Date(quote.valid_until).toLocaleDateString()}. Contact us to request a new quote.`;
          break;
      }

      return sendSMS.mutateAsync({
        phoneNumber,
        message,
        quoteId,
      });
    },
    onSuccess: () => {
      toast.success("Quote notification sent");
    },
  });
};

// Hook to send project update notifications
export const useSendProjectNotification = () => {
  const sendSMS = useSendSMSNotification();

  return useMutation({
    mutationFn: async ({ projectId, phoneNumber, updateType, customMessage }: {
      projectId: string;
      phoneNumber: string;
      updateType: 'started' | 'in_progress' | 'completed' | 'delayed';
      customMessage?: string;
    }) => {
      let message = customMessage;
      
      if (!message) {
        switch (updateType) {
          case 'started':
            message = `Great news! Your project has officially started. We'll keep you updated on our progress.`;
            break;
          case 'in_progress':
            message = `Project update: Work is progressing well on your project. Estimated completion as scheduled.`;
            break;
          case 'completed':
            message = `Fantastic! Your project has been completed. We'll be in touch to schedule the final walkthrough.`;
            break;
          case 'delayed':
            message = `Project update: We're experiencing a slight delay on your project. We'll contact you with a revised timeline shortly.`;
            break;
        }
      }

      return sendSMS.mutateAsync({
        phoneNumber,
        message,
        projectId,
      });
    },
    onSuccess: () => {
      toast.success("Project notification sent");
    },
  });
};