import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";

// Helper function to log activity for email sent
const logEmailActivity = async (clientId: string, subject: string, userId: string) => {
  try {
    await supabase.from("client_activity_log").insert({
      client_id: clientId,
      user_id: userId,
      activity_type: "email_sent",
      title: `Email sent: ${subject}`,
      description: `Email with subject "${subject}" was sent`,
    });
  } catch (error) {
    console.warn("Failed to log email activity:", error);
  }
};

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

      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      // Validate email content
      console.log("Validating email content...");

      // Validate email content
      if (!emailData.to || !emailData.subject || !emailData.content) {
        throw new Error('Missing required email fields: recipient, subject, or content');
      }

      // Create the email record with "queued" status
      console.log("Creating email record...");
      const { data: emailRecord, error: createError } = await supabase
        .from('emails')
        .insert({
          user_id: effectiveOwnerId,
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
        const attachmentPaths: string[] = [];
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
            message: emailData.content,
            user_id: user.id,
            client_id: emailData.client_id,
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

        // Log activity if this email is linked to a client
        if (emailData.client_id && user) {
          await logEmailActivity(emailData.client_id, emailData.subject, user.id);
        }

        // Status updates now come from Resend webhooks (resend-webhook edge function)
        // No more guessing - real delivery events update the status

        // Notify account owner when a team member sends an email (don't self-notify)
        try {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("parent_account_id, display_name")
            .eq("user_id", user.id)
            .single();

          if (profile?.parent_account_id && profile.parent_account_id !== user.id) {
            const senderName = profile.display_name || user.email || 'Team member';
            await supabase.from("notifications").insert({
              user_id: profile.parent_account_id,
              title: "Email Sent by Team Member",
              message: `${senderName} sent an email to ${emailData.to}: "${emailData.subject}"`,
              type: "info",
              category: "email",
              source_type: "email",
              source_id: emailRecord.id,
              action_url: "/emails",
            });
          }
        } catch (notifErr) {
          console.error("Failed to send email notification:", notifErr);
        }

        // Final refresh to show updated status
        await queryClient.invalidateQueries({ queryKey: ['emails'] });
        await queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
        await queryClient.invalidateQueries({ queryKey: ['client-activities'] });

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
      
      // Provide helpful error message
      const errorMessage = error.message || "Failed to send email";
      
      toast({
        title: "Email Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};
