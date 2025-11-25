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
  console.log('fetchTraditionalOptions - Fetching for template:', templateId);
  
  try {
    // Get the template to find its treatment category
    const { data: template, error: templateError } = await supabase
      .from('curtain_templates')
      .select('curtain_type')
      .eq('id', templateId)
      .single();
    
    if (templateError) {
      console.error('Error fetching template:', templateError);
      return [];
    }
    
    // Query treatment_options for this category
    const { data: options, error: optionsError } = await supabase
      .from('treatment_options')
      .select(`
        *,
        option_values (
          id,
          label,
          value,
          extra_data,
          sort_order,
          hidden_by_user
        )
      `)
      .eq('treatment_category', template.curtain_type)
      .order('sort_order', { ascending: true });
    
    if (optionsError) {
      console.error('Error fetching options:', optionsError);
      return [];
    }
    
    if (!options || options.length === 0) {
      console.log('No options found for template category:', template.curtain_type);
      return [];
    }
    
    // If we need to respect template settings, fetch them and filter
    if (respectTemplateSettings) {
      const { data: settings } = await supabase
        .from('template_option_settings')
        .select('treatment_option_id, is_enabled')
        .eq('template_id', templateId);
      
      const settingsMap = new Map(
        settings?.map(s => [s.treatment_option_id, s.is_enabled]) || []
      );
      
      // Filter options based on settings (default to enabled if no setting exists)
      const enabledOptions = options.filter(opt => {
        const isEnabled = settingsMap.has(opt.id) ? settingsMap.get(opt.id) : true;
        return isEnabled;
      });
      
      console.log(`Filtered ${options.length} options to ${enabledOptions.length} enabled options`);
      
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
