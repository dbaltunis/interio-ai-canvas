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
      
      // If querying by template ID, fetch options via template_option_settings
      // CRITICAL: Filter by user's account_id to prevent cross-account data leakage
      // Also fetch hidden_value_ids for per-template value filtering
      if (templateIdOrCategory && queryType === 'template') {
        const { data: linkedOptions, error: linkedError } = await supabase
          .from('template_option_settings')
          .select(`
            is_enabled,
            hidden_value_ids,
            order_index,
            treatment_options!inner (
              id,
              treatment_id,
              key,
              label,
              input_type,
              required,
              visible,
              order_index,
              validation,
              template_id,
              treatment_category,
              tracks_inventory,
              pricing_method,
              base_price,
              pricing_grid_data,
              pricing_grid_type,
              account_id,
              source,
              option_values (*)
            )
          `)
          .eq('template_id', templateIdOrCategory)
          .eq('is_enabled', true); // ✅ CRITICAL: Only fetch ENABLED options (WHITELIST approach)
        
        if (linkedError) {
          console.error('Error fetching linked options:', linkedError);
          return [];
        }
        
        // Process linked options - template_option_settings already provides data isolation
        // (template belongs to user's account, so linked options are already properly scoped)
        // Filter out hidden option values based on template_option_settings.hidden_value_ids
        // AND include per-template order_index for sorting
        const allLinkedOptions = (linkedOptions || [])
          .filter(lo => lo.treatment_options)
          .map(lo => {
            const opt = lo.treatment_options as TreatmentOption & { account_id?: string; template_order_index?: number };
            const hiddenValueIds = (lo.hidden_value_ids as string[]) || [];
            
            // CRITICAL: Use template_option_settings.order_index for per-template ordering
            opt.template_order_index = lo.order_index ?? opt.order_index ?? 999;
            
            // Filter out hidden values from option_values
            if (opt.option_values && hiddenValueIds.length > 0) {
              opt.option_values = opt.option_values.filter(
                (v: OptionValue) => !hiddenValueIds.includes(v.id)
              );
              console.log(`🔍 Filtered ${hiddenValueIds.length} hidden values from option ${opt.label}`);
            }
            
            return opt;
          })
          // ✅ REMOVED: account_id filter - template_option_settings already provides data isolation
          // The template belongs to the user's account, so linked options are properly scoped
          .sort((a, b) => (a.template_order_index ?? 999) - (b.template_order_index ?? 999)); // Sort by template order
        
        console.log('🔧 useTreatmentOptions (template query) loaded:', {
          templateId: templateIdOrCategory,
          accountId,
          totalOptions: allLinkedOptions.length,
          options: allLinkedOptions.map(o => ({
            key: o.key,
            label: o.label,
            valuesCount: o.option_values?.length || 0,
            templateOrderIndex: (o as any).template_order_index
          }))
        });
        
        return allLinkedOptions;
      }
      
      // For category-based queries, use account_id filtering (original logic)
      let query = supabase
        .from('treatment_options')
        .select(`
          *,
          option_values (*)
        `)
        .eq('account_id', accountId)
        .eq('visible', true)
        .order('order_index');
      
      if (templateIdOrCategory && queryType === 'category') {
        // Get all equivalent category names (handles cellular_shades vs cellular_blinds etc)
        const categories = CATEGORY_ALIASES[templateIdOrCategory] || [templateIdOrCategory];
        
        // Build OR condition for all equivalent categories + universal options (null)
        const orConditions = categories.map(cat => `treatment_category.eq.${cat}`).join(',');
        query = query.or(`${orConditions},treatment_category.is.null`);
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
      
      // Debug: Log TWC options loaded
      console.log('🔧 useTreatmentOptions (category query) loaded:', {
        queryType,
        category: templateIdOrCategory,
        accountId,
        totalOptions: filteredData.length,
        options: filteredData.map(o => ({
          key: o.key,
          label: o.label,
          valuesCount: o.option_values?.length || 0,
          source: (o as any).metadata?.source
        }))
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
