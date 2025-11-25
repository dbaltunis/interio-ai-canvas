import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Map equivalent treatment categories to handle naming inconsistencies
const CATEGORY_ALIASES: Record<string, string[]> = {
  'roller_blinds': ['roller_blinds', 'roller_shades'],
  'roller_shades': ['roller_blinds', 'roller_shades'],
  'venetian_blinds': ['venetian_blinds', 'venetian_shades'],
  'venetian_shades': ['venetian_blinds', 'venetian_shades'],
  'vertical_blinds': ['vertical_blinds', 'vertical_shades'],
  'vertical_shades': ['vertical_blinds', 'vertical_shades'],
};

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
  return useQuery({
    queryKey: ['treatment-options', templateIdOrCategory, queryType],
    queryFn: async () => {
      
      // Get current user's account_id for data isolation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id, parent_account_id')
        .eq('user_id', user.id)
        .single();
      
      const accountId = profile?.parent_account_id || user.id;
      
      let query = supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .eq('account_id', accountId)
        .eq('visible', true) // Only get visible options
        .order('order_index');
      
      // If no specific filter provided, get ALL visible options for this account
      if (templateIdOrCategory) {
        if (queryType === 'category') {
          // Get all equivalent category names (handles cellular_shades vs cellular_blinds etc)
          const categories = CATEGORY_ALIASES[templateIdOrCategory] || [templateIdOrCategory];
          
          // Build OR condition for all equivalent categories + universal options (null)
          const orConditions = categories.map(cat => `treatment_category.eq.${cat}`).join(',');
          query = query.or(`${orConditions},treatment_category.is.null`);
        } else {
          query = query.eq('template_id', templateIdOrCategory);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter out ghost options (visible=false with no option_values)
      const filteredData = (data as TreatmentOption[]).filter(option => {
        if (option.visible === true) return true;
        if (!option.visible && (!option.option_values || option.option_values.length === 0)) {
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
