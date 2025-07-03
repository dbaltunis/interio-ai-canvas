
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendEmailData {
  to: string;
  subject: string;
  content: string;
  template_id?: string;
  campaign_id?: string;
  client_id?: string;
  from_email?: string;
  from_name?: string;
}

export const useSendEmail = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (emailData: SendEmailData) => {
      console.log("Sending email via SendGrid:", emailData);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      console.log("SendGrid response:", response);

      if (response.error) {
        console.error("SendGrid error:", response.error);
        throw new Error(response.error.message || 'Failed to send email');
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully via SendGrid",
      });
    },
    onError: (error) => {
      console.error("Email sending error:", error);
      toast({
        title: "Failed to Send Email",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
