
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export const useEmailTemplates = (schedulerId?: string) => {
  return useQuery({
    queryKey: ['email-templates-scheduler', schedulerId],
    queryFn: async () => {
      let query = supabase
        .from('email_templates_scheduler')
        .select('*')
        .eq('active', true)
        .order('template_type');

      if (schedulerId) {
        query = query.eq('scheduler_id', schedulerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as EmailTemplateScheduler[];
    },
    enabled: !!schedulerId,
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateData: Omit<EmailTemplateScheduler, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_templates_scheduler')
        .insert([{ ...templateData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('email_templates_scheduler')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
