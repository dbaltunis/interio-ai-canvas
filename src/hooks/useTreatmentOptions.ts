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
