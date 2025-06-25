
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  template_type: 'quote_followup' | 'installation_reminder' | 'thank_you' | 'promotional' | 'custom';
  variables: any[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailTemplate[];
    },
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
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
