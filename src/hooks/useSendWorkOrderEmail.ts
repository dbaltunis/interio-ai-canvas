import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendWorkOrderEmailParams {
  projectId: string;
  recipientEmail: string;
  recipientName?: string;
  documentType: 'workshop' | 'installation' | 'fitting';
  includeImages?: boolean;
  additionalNotes?: string;
}

export const useSendWorkOrderEmail = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: SendWorkOrderEmailParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*, clients(*), quotes(*)')
        .eq('id', params.projectId)
        .single();

      if (projectError || !project) {
        throw new Error('Project not found');
      }

      // Determine document title based on type
      const documentTitles = {
        workshop: 'Workshop Information',
        installation: 'Installation Instructions',
        fitting: 'Fitting Instructions'
      };

      const documentTitle = documentTitles[params.documentType];
      const clientName = params.recipientName || project.clients?.name || 'Valued Client';

      // Build email content
      const subject = `${documentTitle} - ${project.name || 'Project'} #${project.job_number}`;
      
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .project-info { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${documentTitle}</h1>
            </div>
            <div class="content">
              <p>Dear ${clientName},</p>
              <p>Please find attached the ${documentTitle.toLowerCase()} for your project.</p>
              
              <div class="project-info">
                <h3>Project Details</h3>
                <p><strong>Project:</strong> ${project.name || 'Untitled'}</p>
                <p><strong>Job Number:</strong> ${project.job_number}</p>
                <p><strong>Status:</strong> ${project.status || 'In Progress'}</p>
              </div>

              ${params.additionalNotes ? `
                <div class="project-info">
                  <h3>Additional Notes</h3>
                  <p>${params.additionalNotes}</p>
                </div>
              ` : ''}

              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Best regards,<br>Your Project Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
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
        title: "Work Order Sent",
        description: `${variables.documentType === 'workshop' ? 'Workshop Information' : variables.documentType === 'installation' ? 'Installation Instructions' : 'Fitting Instructions'} sent to ${variables.recipientEmail}`,
        importance: 'important',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send work order document",
        variant: "destructive"
      });
    },
  });
};
