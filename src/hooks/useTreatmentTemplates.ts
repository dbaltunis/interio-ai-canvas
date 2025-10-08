import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TreatmentTemplate {
  id: string;
  name: string;
  category: 'blinds' | 'curtains' | 'shutters' | 'shades' | 'awnings' | 'other';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTreatmentTemplates = () => {
  return useQuery({
    queryKey: ['treatment-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as TreatmentTemplate[];
    },
  });
};

export const useUpdateTreatmentTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TreatmentTemplate> }) => {
      const { data, error } = await supabase
        .from('treatment_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-templates'] });
    },
  });
};
