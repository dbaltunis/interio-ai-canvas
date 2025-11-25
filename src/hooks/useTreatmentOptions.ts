import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OptionValue {
  id: string;
  option_id: string;
  code: string;
  label: string;
  order_index: number;
  extra_data?: any;
  inventory_item_id?: string | null; // Link to enhanced_inventory_items
  hidden_by_user?: boolean; // NEW: Track if user wants to hide this option
}

export interface TreatmentOption {
  id: string;
  treatment_id: string;
  key: string;
  label: string;
  input_type: 'select' | 'radio' | 'number' | 'boolean' | 'text' | 'multiselect';
  required: boolean;
  visible: boolean;
  order_index: number;
  validation?: any;
  tracks_inventory?: boolean; // Whether this option type should link to inventory
  option_values?: OptionValue[];
  is_system_default?: boolean; // NEW: Track if this is a system default option
  treatment_category?: string; // The treatment category this option belongs to (e.g., 'roller_blinds')
}

export const useTreatmentOptions = (templateIdOrCategory?: string, queryType: 'template' | 'category' = 'template') => {
  console.log('🔍 useTreatmentOptions hook called:', {
    templateIdOrCategory,
    queryType,
    willQuery: !!templateIdOrCategory
  });

  return useQuery({
    queryKey: ['treatment-options', templateIdOrCategory, queryType],
    queryFn: async () => {
      console.log('🔍 useTreatmentOptions queryFn executing...');
      
      // Get current user's account_id for data isolation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found');
        return [];
      }
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;
      
      console.log('🔍 Account context:', { userId: user.id, accountId });
      
      let query = supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .eq('account_id', accountId) // CRITICAL: Filter by account for data isolation
        .order('order_index');
      
      if (templateIdOrCategory) {
        if (queryType === 'category') {
          // Query by treatment_category for category-based options
          console.log('🔍 Querying by treatment_category:', templateIdOrCategory);
          query = query.eq('treatment_category', templateIdOrCategory);
        } else {
          // Query by template_id for template-specific options (legacy)
          console.log('🔍 Querying by template_id:', templateIdOrCategory);
          query = query.eq('template_id', templateIdOrCategory);
        }
      }
      
      const { data, error } = await query;
      
      console.log('🔍 Query result:', {
        dataCount: data?.length || 0,
        error: error?.message,
        data: data?.map(opt => ({
          id: opt.id,
          key: opt.key,
          label: opt.label,
          treatment_category: opt.treatment_category,
          template_id: opt.template_id,
          visible: opt.visible,
          account_id: opt.account_id,
          option_values_count: opt.option_values?.length || 0
        }))
      });
      
      if (error) throw error;
      
      // CRITICAL: Filter out ghost/test options (visible=false with no option_values)
      const filteredData = (data as TreatmentOption[]).filter(option => {
        // Always include visible options
        if (option.visible === true) return true;
        // If not visible, only include if it has option_values (legitimate hidden options)
        if (!option.visible && (!option.option_values || option.option_values.length === 0)) {
          console.warn(`🚫 Filtering out ghost option: ${option.key} (${option.id}) - visible=false with no values`);
          return false;
        }
        return true;
      });
      
      console.log('✅ Final filtered options count:', filteredData.length);
      
      return filteredData;
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
        .update(updates as any)
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
