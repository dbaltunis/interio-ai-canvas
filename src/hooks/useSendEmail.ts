
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
  attachments?: File[];
}

export const useSendEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (emailData: SendEmailRequest) => {
      console.log("=== STARTING EMAIL SEND PROCESS ===");
      console.log("Email data:", emailData);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("No authenticated user found");
        throw new Error('User not authenticated');
      }
      
      const user = session.user;
      console.log("Authenticated user:", user.id);

      // Pre-flight validations
      console.log("Running pre-flight validations...");

      // Check SendGrid integration first
      const { data: integration, error: integrationError } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      if (integrationError) {
        console.error("Integration check failed:", integrationError);
        throw new Error('Failed to check SendGrid integration');
      }

      if (!integration) {
        console.error("No active SendGrid integration found");
        throw new Error('Please configure your SendGrid integration first. Go to Settings > Integrations to set up email sending.');
      }

      console.log("SendGrid integration verified");

      // Check if user has email settings configured
      const { data: emailSettings, error: settingsError } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) {
        console.error("Email settings check failed:", settingsError);
        throw new Error('Failed to check email settings');
      }

      if (!emailSettings || !emailSettings.from_email) {
        console.error("No email settings found");
        throw new Error('Email settings required: Please configure your verified sender email address in Settings → Email Settings. Your sender email must be verified in SendGrid.');
      }

      console.log("Email settings verified:", emailSettings.from_email);

      // Validate email content
      if (!emailData.to || !emailData.subject || !emailData.content) {
        throw new Error('Missing required email fields: recipient, subject, or content');
      }

      // Create the email record with "queued" status
      console.log("Creating email record...");
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
          status: 'queued',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create email record:", createError);
        throw new Error(`Failed to create email record: ${createError.message}`);
      }

      console.log("Email record created:", emailRecord.id);

      // Invalidate queries to show the "queued" status
      await queryClient.invalidateQueries({ queryKey: ['emails'] });
      await queryClient.invalidateQueries({ queryKey: ['email-kpis'] });

      try {
        // Upload attachments to storage if any
        let attachmentPaths: string[] = [];
        if (emailData.attachments && emailData.attachments.length > 0) {
          console.log("Uploading attachments:", emailData.attachments.length);
          
          for (const file of emailData.attachments) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('email-attachments')
              .upload(fileName, file);
            
            if (uploadError) {
              console.error("File upload error:", uploadError);
              throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
            }
            
            attachmentPaths.push(uploadData.path);
          }
          
          console.log("Attachments uploaded:", attachmentPaths);
        }

        // Send the email via the edge function
        console.log("Calling send-email edge function...");
        const { data: sendResponse, error: sendError } = await supabase.functions.invoke('send-email', {
          body: {
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.content,
            emailId: emailRecord.id,
            attachmentPaths: attachmentPaths.length > 0 ? attachmentPaths : undefined
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

          await queryClient.invalidateQueries({ queryKey: ['emails'] });
          await queryClient.invalidateQueries({ queryKey: ['email-kpis'] });

          throw sendError;
        }

        console.log("Email sent successfully:", sendResponse);

        // Final refresh to show updated status
        await queryClient.invalidateQueries({ queryKey: ['emails'] });
        await queryClient.invalidateQueries({ queryKey: ['email-kpis'] });

        return { ...emailRecord, ...sendResponse };

      } catch (error) {
        console.error("Failed to send email:", error);
        
        // Update status to failed
        await supabase
          .from('emails')
          .update({ 
            status: 'failed',
            bounce_reason: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString()
          })
          .eq('id', emailRecord.id);

        await queryClient.invalidateQueries({ queryKey: ['emails'] });
        await queryClient.invalidateQueries({ queryKey: ['email-kpis'] });

        throw error;
      }
    },
    onSuccess: () => {
      console.log("=== EMAIL SEND MUTATION COMPLETED SUCCESSFULLY ===");
      
      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully",
      });
    },
    onError: (error: any) => {
      console.error("=== SEND EMAIL MUTATION ERROR ===");
      console.error("Error details:", error);
      
      // Check for specific error types and provide helpful messages
      let errorMessage = error.message || "Failed to send email";
      
      if (error.message?.includes('verified Sender Identity') || error.message?.includes('verified in SendGrid')) {
        errorMessage = "Your sender email address is not verified in SendGrid. Please verify your email address in your SendGrid account before sending emails.";
      } else if (error.message?.includes('Email settings required')) {
        errorMessage = "Please configure your email settings in Settings → Email Settings with a verified sender address.";
      } else if (error.message?.includes('SendGrid integration')) {
        errorMessage = "Please configure your SendGrid integration in Settings → Integrations first.";
      }
      
      toast({
        title: "Email Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
