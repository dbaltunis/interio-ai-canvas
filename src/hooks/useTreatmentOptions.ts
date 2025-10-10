import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OptionValue {
  id: string;
  option_id: string;
  code: string;
  label: string;
  order_index: number;
  extra_data?: any;
}

export interface TreatmentOption {
  id: string;
  treatment_id: string;
  key: string;
  label: string;
  input_type: 'select' | 'number' | 'boolean' | 'text' | 'multiselect';
  required: boolean;
  visible: boolean;
  order_index: number;
  validation?: any;
  option_values?: OptionValue[];
}

export const useTreatmentOptions = (templateIdOrCategory?: string, queryType: 'template' | 'category' = 'template') => {
  return useQuery({
    queryKey: ['treatment-options', templateIdOrCategory, queryType],
    queryFn: async () => {
      let query = supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .order('order_index');
      
      if (templateIdOrCategory) {
        if (queryType === 'category') {
          // Query by treatment_category for category-based options
          query = query.eq('treatment_category', templateIdOrCategory);
        } else {
          // Query by template_id for template-specific options (legacy)
          query = query.eq('template_id', templateIdOrCategory);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as TreatmentOption[];
    },
    enabled: !!templateIdOrCategory,
  });
};

export const useUpdateTreatmentOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TreatmentOption> }) => {
      const { data, error } = await supabase
        .from('treatment_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
    },
  });
};
