import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TreatmentOption, OptionValue } from './useTreatmentOptions';

// Create a treatment option
export const useCreateTreatmentOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      key: string;
      label: string;
      input_type: 'select' | 'number' | 'boolean' | 'text' | 'multiselect';
      required?: boolean;
      visible?: boolean;
      order_index?: number;
      treatment_category: string;
      is_system_default?: boolean;
    }) => {
      // Always create category-based options (NO template_id)
      const { data: option, error } = await supabase
        .from('treatment_options')
        .insert({
          ...data,
          template_id: null, // Force category-based options
        })
        .select()
        .single();
      
      if (error) {
        // Handle unique constraint violation gracefully
        if (error.code === '23505' && error.message.includes('treatment_options_category_key_unique')) {
          throw new Error(`This treatment option already exists for ${data.treatment_category}`);
        }
        throw error;
      }
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['available-treatment-options-from-manager'] });
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

// Get all treatment options for management (category-based, not template-specific)
export const useAllTreatmentOptions = () => {
  return useQuery({
    queryKey: ['all-treatment-options'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      // Get all category-based options (template_id is NULL)
      // Show both system defaults AND user-created options
      const { data, error } = await supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .is('template_id', null)
        .order('treatment_category', { ascending: true })
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return data as TreatmentOption[];
    },
  });
};
