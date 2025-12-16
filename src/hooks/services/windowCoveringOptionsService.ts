import { supabase } from '@/integrations/supabase/client';
import type { WindowCoveringOption, HierarchicalOption } from '../types/windowCoveringOptionsTypes';

/**
 * Fetch traditional/flat options from treatment_options table
 * Filters by template and respects template_option_settings for enabled/disabled state
 */
export const fetchTraditionalOptions = async (
  templateId: string,
  respectTemplateSettings = true
): Promise<WindowCoveringOption[]> => {
  console.log('🔍 fetchTraditionalOptions - Fetching for template:', templateId);
  console.log('🔍 respectTemplateSettings:', respectTemplateSettings);
  
  try {
    // Get current user's account_id for data isolation
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ No authenticated user');
      return [];
    }
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, parent_account_id')
      .eq('user_id', user.id)
      .single();
    
    const accountId = profile?.parent_account_id || user.id;
    console.log('🔐 Using account_id for filtering:', accountId);
    
    // Get the template to find its treatment category
    const { data: template, error: templateError } = await supabase
      .from('curtain_templates')
      .select('treatment_category')
      .eq('id', templateId)
      .single();
    
    if (templateError) {
      console.error('Error fetching template:', templateError);
      return [];
    }

    // If respecting template settings, fetch options DIRECTLY via template_option_settings
    // This bypasses account_id filtering and gets ALL linked options (including TWC options)
    if (respectTemplateSettings) {
      console.log('🔍 Fetching options via template_option_settings for template:', templateId);
      
      // CRITICAL FIX: Fetch options through template_option_settings to get ALL linked options
      // This includes TWC options that may have different account_ids
      // Also fetch hidden_value_ids for per-template value filtering
      const { data: linkedOptions, error: linkedError } = await supabase
        .from('template_option_settings')
        .select(`
          is_enabled,
          hidden_value_ids,
          treatment_options!inner (
            id,
            key,
            label,
            input_type,
            description,
            is_required,
            is_default,
            sort_order,
            order_index,
            image_url,
            option_type_category,
            source,
            treatment_category,
            option_values (
              id,
              label,
              code,
              extra_data,
              order_index,
              hidden_by_user
            )
          )
        `)
        .eq('template_id', templateId)
        .eq('is_enabled', true);
      
      console.log('🔍 Linked options query result:', {
        templateId,
        linkedCount: linkedOptions?.length || 0,
        error: linkedError
      });
      
      if (linkedError) {
        console.error('Error fetching linked options:', linkedError);
        return [];
      }
      
      if (!linkedOptions || linkedOptions.length === 0) {
        console.log('⚠️ No enabled options found for template');
        return [];
      }
      
      // Extract treatment_options from the joined result and filter hidden values
      const options = linkedOptions
        .filter(lo => lo.treatment_options)
        .map(lo => {
          const option = lo.treatment_options as any;
          const hiddenValueIds = (lo.hidden_value_ids as string[]) || [];
          
          // Filter out hidden values from option_values
          if (option.option_values && hiddenValueIds.length > 0) {
            option.option_values = option.option_values.filter(
              (v: any) => !hiddenValueIds.includes(v.id)
            );
            console.log(`🔍 Filtered ${hiddenValueIds.length} hidden values from option ${option.label}`);
          }
          
          return option;
        });
      
      console.log(`✅ Found ${options.length} enabled options for template`);
      
      return options.map(mapToWindowCoveringOption);
    }
    
    // Fallback: Query treatment_options for this category AND account (original logic)
    const { data: options, error: optionsError } = await supabase
      .from('treatment_options')
      .select(`
        *,
        option_values (
          id,
          label,
          code,
          extra_data,
          order_index,
          hidden_by_user
        )
      `)
      .eq('treatment_category', template.treatment_category)
      .eq('account_id', accountId)
      .order('order_index', { ascending: true });
    
    if (optionsError) {
      console.error('Error fetching options:', optionsError);
      return [];
    }
    
    if (!options || options.length === 0) {
      console.log('No options found for template category:', template.treatment_category);
      return [];
    }
    
    return options.map(mapToWindowCoveringOption);
  } catch (error) {
    console.error('Error in fetchTraditionalOptions:', error);
    return [];
  }
};

/**
 * Fetch hierarchical options (legacy system - mostly unused now)
 */
export const fetchHierarchicalOptions = async (templateId: string): Promise<HierarchicalOption[]> => {
  console.log('fetchHierarchicalOptions - Template:', templateId);
  
  // Hierarchical options are from the legacy _legacy_option_categories system
  // For now, return empty array as we're moving to flat treatment_options
  return [];
};

/**
 * Map database treatment_option to WindowCoveringOption format
 */
function mapToWindowCoveringOption(dbOption: any): WindowCoveringOption {
  // Get pricing method from option_values if available, otherwise use default
  const pricingMethod = dbOption.option_values?.[0]?.extra_data?.pricing_method || 'fixed';
  const basePrice = dbOption.option_values?.[0]?.extra_data?.price || 0;
  
  return {
    id: dbOption.id,
    window_covering_id: '', // Not used in new system
    name: dbOption.label || dbOption.key,
    description: dbOption.description,
    option_type: dbOption.option_type_category || dbOption.key,
    key: dbOption.key,
    base_price: basePrice,
    base_cost: basePrice,
    cost_type: pricingMethod,
    is_required: dbOption.is_required || false,
    is_default: dbOption.is_default || false,
    active: true,
    sort_order: dbOption.sort_order || 0,
    pricing_method: pricingMethod,
    image_url: dbOption.image_url,
    option_values: dbOption.option_values || []
  };
}
