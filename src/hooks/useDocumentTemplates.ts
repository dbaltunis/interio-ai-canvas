import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DocumentTemplate {
  id?: string;
  name: string;
  document_type: string;
  blocks: any[];
  image_settings?: any;
  layout_settings?: any;
  visibility_rules?: any;
  status?: 'active' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const useDocumentTemplates = () => {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Map database fields to DocumentTemplate
      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        document_type: template.template_style || 'quotation',
        blocks: (template.blocks as any) || [],
        image_settings: (template.settings as any) || {},
        layout_settings: {},
        visibility_rules: {},
        status: template.active ? 'active' as const : 'archived' as const,
        created_at: template.created_at,
        updated_at: template.updated_at,
        user_id: template.user_id,
      }));
    },
  });
};

export const useDocumentTemplate = (id?: string) => {
  return useQuery({
    queryKey: ['document-template', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: template, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Map database fields to DocumentTemplate
      return {
        id: template.id,
        name: template.name,
        document_type: template.template_style || 'quotation',
        blocks: (template.blocks as any) || [],
        image_settings: (template.settings as any) || {},
        layout_settings: {},
        visibility_rules: {},
        status: template.active ? 'active' as const : 'archived' as const,
        created_at: template.created_at,
        updated_at: template.updated_at,
        user_id: template.user_id,
      } as DocumentTemplate;
    },
    enabled: !!id,
  });
};

export const useCreateDocumentTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Map DocumentTemplate fields to database fields
      const dbInsert = {
        name: template.name,
        template_style: template.document_type,
        blocks: template.blocks,
        settings: template.image_settings || {},
        user_id: user.id,
        active: template.status === 'active',
        is_default: false,
      };

      const { data, error } = await supabase
        .from('quote_templates')
        .insert(dbInsert)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'Template created',
        description: 'Your document template has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
      console.error('Create template error:', error);
    },
  });
};

export const useUpdateDocumentTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DocumentTemplate> }) => {
      // Map DocumentTemplate fields to database fields
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.document_type) dbUpdates.template_style = updates.document_type;
      if (updates.blocks) dbUpdates.blocks = updates.blocks;
      if (updates.image_settings) dbUpdates.settings = updates.image_settings;
      if (updates.status) dbUpdates.active = updates.status === 'active';
      
      const { data, error } = await supabase
        .from('quote_templates')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['document-template', variables.id] });
      toast({
        title: 'Template updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
      console.error('Update template error:', error);
    },
  });
};

export const useDeleteDocumentTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quote_templates')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast({
        title: 'Template archived',
        description: 'The template has been archived.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to archive template. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete template error:', error);
    },
  });
};
