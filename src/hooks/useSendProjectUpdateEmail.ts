import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendProjectUpdateEmailParams {
  projectId: string;
  recipientEmail: string;
  recipientName?: string;
  updateType: 'status_change' | 'milestone' | 'delay' | 'completion' | 'general';
  updateTitle: string;
  updateMessage: string;
  includeProjectDetails?: boolean;
}

export const useSendProjectUpdateEmail = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendProjectUpdateEmailParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, clients(*)')
        .eq('id', params.projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      const clientName = params.recipientName || project.clients?.name || 'Valued Client';

      // Determine styling based on update type
      const typeColors = {
        status_change: '#3b82f6',
        milestone: '#10b981',
        delay: '#f59e0b',
        completion: '#8b5cf6',
        general: '#6b7280'
      };

      const typeIcons = {
        status_change: '📋',
        milestone: '🎯',
        delay: '⏰',
        completion: '✅',
        general: '📢'
      };

      const headerColor = typeColors[params.updateType];
      const icon = typeIcons[params.updateType];

      // Build email content
      const subject = `${icon} Project Update: ${params.updateTitle}`;
      
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: ${headerColor}; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .update-box { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${headerColor}; }
              .project-info { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${icon} ${params.updateTitle}</h1>
            </div>
            <div class="content">
              <p>Dear ${clientName},</p>
              <p>We wanted to update you on your project:</p>
              
              <div class="update-box">
                <h3>Update Details</h3>
                <p>${params.updateMessage}</p>
              </div>

              ${params.includeProjectDetails !== false ? `
                <div class="project-info">
                  <h3>Project Information</h3>
                  <p><strong>Project:</strong> ${project.name || 'Untitled'}</p>
                  <p><strong>Job Number:</strong> ${project.job_number}</p>
                  <p><strong>Current Status:</strong> ${project.status || 'In Progress'}</p>
                  ${project.start_date ? `<p><strong>Start Date:</strong> ${new Date(project.start_date).toLocaleDateString()}</p>` : ''}
                  ${project.due_date ? `<p><strong>Expected Completion:</strong> ${new Date(project.due_date).toLocaleDateString()}</p>` : ''}
                </div>
              ` : ''}

              <p>If you have any questions or concerns, please don't hesitate to reach out to us.</p>
              <p>Thank you for your continued trust in our services.</p>
              <p>Best regards,<br>Your Project Team</p>
            </div>
            <div class="footer">
              <p>This is an automated project update. For immediate assistance, please contact us directly.</p>
            </div>
          </body>
        </html>
      `;

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.recipientEmail,
          subject: subject,
          html: content,
          user_id: session.user.id,
          client_id: project.client_id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Update Sent",
        description: `Project update sent to ${variables.recipientEmail}`,
        importance: 'important',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send project update",
        variant: "destructive"
      });
    },
  });
};
