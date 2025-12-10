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
    }) => {
      // Get current user's account_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;
      
      // Always create category-based options (NO template_id)
      const { data: option, error } = await supabase
        .from('treatment_options')
        .insert({
          ...data,
          template_id: null, // Force category-based options
          account_id: accountId,
        })
        .select()
        .single();
      
      if (error) {
        // Handle unique constraint violation gracefully (updated constraint name)
        if (error.code === '23505' && error.message.includes('treatment_options_account_category_key_unique')) {
          throw new Error(`You already have a "${data.label}" option for ${data.treatment_category}`);
        }
        throw error;
      }
      
      // Auto-sync: Create matching option_type_category for Options Manager
      const categoryInsert = await supabase
        .from('option_type_categories')
        .insert({
          account_id: accountId,
          type_key: data.key,
          type_label: data.label,
          treatment_category: data.treatment_category,
          sort_order: data.order_index || 999,
        })
        .select()
        .single();
      
      // Silently ignore duplicate key errors (option_type_category already exists)
      if (!categoryInsert.error || categoryInsert.error.code === '23505') {
        queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
      } else {
        console.error('Failed to create option_type_category:', categoryInsert.error);
      }
      
      return option;
    },
    onSuccess: async (newOption: any) => {
      // AUTO-SYNC: Create template_option_settings for ALL templates of this category
      if (newOption?.id && newOption?.treatment_category && newOption?.account_id) {
        try {
          // Find all active templates for this category
          const { data: templates } = await supabase
            .from('curtain_templates')
            .select('id')
            .eq('user_id', newOption.account_id)
            .eq('treatment_category', newOption.treatment_category)
            .eq('active', true);
          
          if (templates?.length) {
            // Create template_option_settings for each template
            const settingsToInsert = templates.map(t => ({
              template_id: t.id,
              treatment_option_id: newOption.id,
              is_enabled: true
            }));
            
            await supabase
              .from('template_option_settings')
              .upsert(settingsToInsert, { onConflict: 'template_id,treatment_option_id' });
            
            console.log(`✅ Auto-created template_option_settings for ${templates.length} templates`);
          }
        } catch (syncError) {
          console.error('Failed to auto-sync template_option_settings:', syncError);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['available-treatment-options-from-manager'] });
      queryClient.invalidateQueries({ queryKey: ['template-option-settings'] });
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
      inventory_item_id?: string | null; // NEW: Link to inventory
    }) => {
      // Get current user's account_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;
      
      const { data: value, error } = await supabase
        .from('option_values')
        .insert({
          ...data,
          account_id: accountId,
        })
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
// CRITICAL: Only returns options for the current user's account
export const useAllTreatmentOptions = () => {
  return useQuery({
    queryKey: ['all-treatment-options'],
    queryFn: async () => {
      console.log('🔄 useAllTreatmentOptions: Starting query...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ useAllTreatmentOptions: No authenticated user');
        return [];
      }
      
      // Get current user's account_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.user.id;
      console.log('🔐 useAllTreatmentOptions: Account ID:', accountId);
      
      // Get all category-based options for THIS ACCOUNT ONLY
      const { data, error } = await supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .is('template_id', null)
        .eq('account_id', accountId) // CRITICAL: Account isolation
        .order('treatment_category', { ascending: true })
        .order('order_index', { ascending: true });
      
      if (error) {
        console.error('❌ useAllTreatmentOptions: Query error:', error);
        throw error;
      }
      
      console.log('✅ useAllTreatmentOptions: Found', data?.length || 0, 'options');
      console.log('📊 Categories:', [...new Set((data || []).map(o => o.treatment_category))]);
      
      return data as TreatmentOption[];
    },
  });
};
