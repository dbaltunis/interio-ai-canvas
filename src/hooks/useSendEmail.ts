
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendEmailRequest {
  to: string;
  subject: string;
  content: string;
  template_id?: string;
  client_id?: string;
  campaign_id?: string;
}

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (emailData: SendEmailRequest) => {
      console.log("Starting email send process...", emailData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, create the email record with "sending" status
      const { data: emailRecord, error: createError } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          recipient_email: emailData.to,
          subject: emailData.subject,
          content: emailData.content,
          template_id: emailData.template_id,
          client_id: emailData.client_id,
          campaign_id: emailData.campaign_id,
          status: 'sending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create email record:", createError);
        throw createError;
      }

      console.log("Email record created:", emailRecord);

      // Invalidate queries immediately to show the "sending" status
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-kpis'] });

      try {
        // Now send the actual email
        const { data: sendResponse, error: sendError } = await supabase.functions.invoke('send-email', {
          body: {
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.content,
            emailId: emailRecord.id
          }
        });

        if (sendError) {
          console.error("Send email function error:", sendError);
          
          // Update status to failed
          await supabase
            .from('emails')
            .update({ 
              status: 'failed',
              bounce_reason: sendError.message,
              updated_at: new Date().toISOString()
            })
            .eq('id', emailRecord.id);

          throw sendError;
        }

        console.log("Email sent successfully:", sendResponse);

        // Update status to sent
        await supabase
          .from('emails')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString(),
            sendgrid_message_id: sendResponse.messageId,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailRecord.id);

        return { ...emailRecord, ...sendResponse };

      } catch (error) {
        console.error("Failed to send email:", error);
        
        // Update status to failed
        await supabase
          .from('emails')
          .update({ 
            status: 'failed',
            bounce_reason: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', emailRecord.id);

        throw error;
      }
    },
    onSuccess: () => {
      // Refresh data after successful send
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
      
      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully",
      });
    },
    onError: (error: any) => {
      console.error("Send email mutation error:", error);
      
      // Refresh data to show failed status
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
      
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    },
  });
};
