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
    
    // Query treatment_options for this category AND account
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
      .eq('account_id', accountId)  // 🔐 CRITICAL: Filter by account_id for data isolation
      .order('order_index', { ascending: true });
    
    if (optionsError) {
      console.error('Error fetching options:', optionsError);
      return [];
    }
    
    if (!options || options.length === 0) {
      console.log('No options found for template category:', template.treatment_category);
      return [];
    }
    
    // If we need to respect template settings, fetch them and filter
    if (respectTemplateSettings) {
      console.log('🔍 Fetching template_option_settings for template:', templateId);
      const { data: settings, error: settingsError } = await supabase
        .from('template_option_settings')
        .select('treatment_option_id, is_enabled')
        .eq('template_id', templateId);
      
      console.log('🔍 Template settings:', {
        templateId,
        settingsCount: settings?.length || 0,
        settings: settings,
        error: settingsError
      });
      
      const settingsMap = new Map(
        settings?.map(s => [s.treatment_option_id, s.is_enabled]) || []
      );
      
      // Filter options based on settings (default to enabled if no setting exists)
      const enabledOptions = options.filter(opt => {
        const isEnabled = settingsMap.has(opt.id) ? settingsMap.get(opt.id) : true;
        console.log(`🔍 Option "${opt.label}" (${opt.id}): ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
        return isEnabled;
      });
      
      console.log(`✅ Filtered ${options.length} options to ${enabledOptions.length} enabled options`);
      
      return enabledOptions.map(mapToWindowCoveringOption);
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
