import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OptionRule {
  id: string;
  treatment_id: string;
  condition: {
    option_key: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in_list';
    value: string | string[];
  };
  effect: {
    action: 'show_option' | 'hide_option' | 'require_option' | 'set_default';
    target_option_key: string;
    target_value?: string;
  };
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const useTreatmentOptionRules = (treatmentId?: string) => {
  return useQuery({
    queryKey: ['treatment-option-rules', treatmentId],
    queryFn: async () => {
      if (!treatmentId) return [];
      
      const { data, error } = await supabase
        .from('option_rules')
        .select('*')
        .eq('treatment_id', treatmentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as OptionRule[];
    },
    enabled: !!treatmentId,
  });
};

export const useCreateOptionRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: Omit<OptionRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('option_rules')
        .insert(rule)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-option-rules', variables.treatment_id] });
      toast.success('Option rule created');
    },
    onError: (error) => {
      toast.error('Failed to create rule: ' + error.message);
    },
  });
};

export const useUpdateOptionRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OptionRule> }) => {
      const { data, error } = await supabase
        .from('option_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-option-rules', data.treatment_id] });
      toast.success('Option rule updated');
    },
    onError: (error) => {
      toast.error('Failed to update rule: ' + error.message);
    },
  });
};

export const useDeleteOptionRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, treatmentId }: { id: string; treatmentId: string }) => {
      const { error } = await supabase
        .from('option_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { treatmentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['treatment-option-rules', data.treatmentId] });
      toast.success('Option rule deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete rule: ' + error.message);
    },
  });
};
