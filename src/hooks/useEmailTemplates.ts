
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface EmailTemplateScheduler {
  id: string;
  user_id: string;
  scheduler_id: string | null;
  template_type: 'booking_confirmation' | 'reminder_24h' | 'reminder_10min';
  subject: string;
  content: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data
const mockTemplates: EmailTemplateScheduler[] = [
  {
    id: 'template-1',
    user_id: 'mock-user',
    scheduler_id: 'scheduler-1',
    template_type: 'booking_confirmation',
    subject: 'Booking Confirmation',
    content: 'Your appointment has been confirmed.',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useEmailTemplates = (schedulerId?: string) => {
  return useQuery({
    queryKey: ['email-templates-scheduler', schedulerId],
    queryFn: async () => {
      // Mock implementation
      console.log('useEmailTemplates - Mock implementation for scheduler:', schedulerId);
      
      if (!schedulerId) {
        return [];
      }
      
      return mockTemplates.filter(template => 
        template.scheduler_id === schedulerId && template.active
      );
    },
    enabled: !!schedulerId,
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateData: Omit<EmailTemplateScheduler, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      // Mock implementation
      const newTemplate: EmailTemplateScheduler = {
        ...templateData,
        id: `template-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockTemplates.push(newTemplate);
      return newTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates-scheduler', data.scheduler_id] });
      toast({
        title: "Success",
        description: "Email template created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create email template",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailTemplateScheduler> & { id: string }) => {
      // Mock implementation
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }

      const updatedTemplate = {
        ...mockTemplates[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      mockTemplates[index] = updatedTemplate;
      return updatedTemplate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates-scheduler', data.scheduler_id] });
      toast({
        title: "Success",
        description: "Email template updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
    },
  });
};
