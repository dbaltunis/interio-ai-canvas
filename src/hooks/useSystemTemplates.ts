import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SystemTemplate {
  id: string;
  name: string;
  description: string | null;
  treatment_category: string | null;
  curtain_type: string | null;
  unit_price: number | null;
  pricing_type: string;
  manufacturing_type: string;
  is_system_default: boolean;
}

export const useSystemTemplates = () => {
  return useQuery({
    queryKey: ['system-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curtain_templates')
        .select('id, name, description, treatment_category, curtain_type, unit_price, pricing_type, manufacturing_type, is_system_default')
        .eq('is_system_default', true)
        .eq('active', true)
        .order('treatment_category, name');
      
      if (error) throw error;
      return data as SystemTemplate[];
    },
  });
};

export const useCloneSystemTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      systemTemplateId, 
      customPricing 
    }: { 
      systemTemplateId: string; 
      customPricing?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get the full system template
      const { data: template, error: fetchError } = await supabase
        .from('curtain_templates')
        .select('*')
        .eq('id', systemTemplateId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Clone the template with user's custom pricing
      const { data: clonedTemplate, error } = await supabase
        .from('curtain_templates')
        .insert({
          ...template,
          id: undefined, // Let database generate new ID
          user_id: user.id,
          is_system_default: false,
          name: `${template.name} (Custom)`,
          unit_price: customPricing || template.unit_price,
          created_at: undefined,
          updated_at: undefined,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // NO LONGER CLONE OPTIONS - they are category-based and shared
      // Options are created once per category and reused by all templates
      
      return clonedTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curtain-templates'] });
      toast({
        title: "Template cloned successfully",
        description: "You can now customize this template with your own pricing and settings.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to clone template",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
