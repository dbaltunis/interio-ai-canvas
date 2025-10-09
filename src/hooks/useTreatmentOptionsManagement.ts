import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TreatmentOption, OptionValue } from './useTreatmentOptions';

// Create a treatment option
export const useCreateTreatmentOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      template_id: string;
      key: string;
      label: string;
      input_type: 'select' | 'number' | 'boolean' | 'text' | 'multiselect';
      required?: boolean;
      visible?: boolean;
      order_index?: number;
    }) => {
      const { data: option, error } = await supabase
        .from('treatment_options')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
    },
  });
};

// Create an option value
export const useCreateOptionValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      option_id: string;
      code: string;
      label: string;
      order_index?: number;
      extra_data?: any;
    }) => {
      const { data: value, error } = await supabase
        .from('option_values')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
    },
  });
};

// Update an option value
export const useUpdateOptionValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OptionValue> }) => {
      const { data, error } = await supabase
        .from('option_values')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
    },
  });
};

// Delete an option value
export const useDeleteOptionValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('option_values')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
    },
  });
};

// Get all treatment options for management (without filtering by treatment_id)
export const useAllTreatmentOptions = () => {
  return useQuery({
    queryKey: ['all-treatment-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .order('order_index');
      
      if (error) throw error;
      return data as TreatmentOption[];
    },
  });
};
