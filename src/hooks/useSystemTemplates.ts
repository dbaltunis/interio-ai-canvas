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
      
      // Clone associated treatment_options and option_values by treatment_category
      const { data: options, error: optionsError } = await supabase
        .from('treatment_options')
        .select('*, option_values(*)')
        .eq('treatment_category', template.curtain_type)
        .eq('is_system_default', true);
      
      if (optionsError) throw optionsError;
      
      if (options && options.length > 0) {
        // Clone each option for the user's template
        for (const option of options) {
          const { data: newOption, error: optionInsertError } = await supabase
            .from('treatment_options')
            .insert({
              treatment_category: template.curtain_type,
              user_id: user.id,
              key: option.key,
              label: option.label,
              input_type: option.input_type,
              required: option.required,
              visible: option.visible,
              order_index: option.order_index,
              validation: option.validation,
              is_system_default: false,
            })
            .select()
            .single();
          
          if (optionInsertError) throw optionInsertError;
          
          // Clone option values
          if (option.option_values && option.option_values.length > 0) {
            const valuesToInsert = option.option_values.map((value: any) => ({
              option_id: newOption.id,
              code: value.code,
              label: value.label,
              extra_data: value.extra_data,
              order_index: value.order_index,
              is_system_default: false,
            }));
            
            const { error: valuesInsertError } = await supabase
              .from('option_values')
              .insert(valuesToInsert);
            
            if (valuesInsertError) throw valuesInsertError;
          }
        }
      }
      
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
