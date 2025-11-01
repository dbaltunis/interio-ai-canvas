import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendInvitationParams {
  appointmentId: string;
  recipientEmail: string;
  recipientName?: string;
}

export const useSendCalendarInvitation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ appointmentId, recipientEmail, recipientName }: SendInvitationParams) => {
      const { data, error } = await supabase.functions.invoke('send-calendar-invitation', {
        body: {
          appointmentId,
          recipientEmail,
          recipientName
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Invitation Sent",
        description: `Calendar invitation sent to ${variables.recipientEmail}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send calendar invitation",
        variant: "destructive"
      });
    },
  });
};
