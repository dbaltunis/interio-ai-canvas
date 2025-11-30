import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmailTemplate {
  id: string;
  user_id: string;
  template_type: string;
  subject: string;
  content: string;
  variables: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGeneralEmailTemplates = () => {
  return useQuery({
    queryKey: ['general-email-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('template_type');

      if (error) throw error;

      // If no templates exist, seed default ones
      if (!data || data.length === 0) {
        console.log('No templates found, seeding defaults...');
        
        const { error: seedError } = await supabase.rpc('seed_default_email_templates', {
          target_user_id: user.id
        });

        if (seedError) {
          console.error('Failed to seed templates:', seedError);
        } else {
          // Refetch after seeding
          const { data: newData, error: refetchError } = await supabase
            .from('email_templates')
            .select('*')
            .eq('user_id', user.id)
            .order('template_type');

          if (refetchError) throw refetchError;
          return newData || [];
        }
      }

      return data || [];
    },
  });
};

export const useGeneralEmailTemplate = (templateType: string) => {
  return useQuery({
    queryKey: ['general-email-template', templateType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('template_type', templateType)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!templateType,
  });
};

export const useUpdateGeneralEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Partial<EmailTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          subject: template.subject,
          content: template.content,
          active: template.active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', template.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-email-templates'] });
      toast({
        title: "Template Updated",
        description: "Email template has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update email template",
        variant: "destructive",
      });
    },
  });
};

export const useCreateGeneralEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          user_id: user.id,
          ...template,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-email-templates'] });
      toast({
        title: "Template Created",
        description: "New email template has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create email template",
        variant: "destructive",
      });
    },
  });
};
