import { supabase } from '@/integrations/supabase/client';
import type { WindowCoveringOption, HierarchicalOption } from '../types/windowCoveringOptionsTypes';

/**
 * Fetches treatment options for a specific window covering template
 * Returns flat list of options with their values
 */
export const fetchTraditionalOptions = async (windowCoveringId: string): Promise<WindowCoveringOption[]> => {
  console.log('🔍 fetchTraditionalOptions - Starting for template:', windowCoveringId);
  
  try {
    // Get current user and their account
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      console.error('❌ User not authenticated');
      return [];
    }

    // Get user's account_id
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('parent_account_id, user_id')
      .eq('user_id', user.id)
      .single();

    const accountId = userProfile?.parent_account_id || user.id;
    console.log('👤 User account:', accountId);

    // Get the template to find its treatment_category
    const { data: template, error: templateError } = await supabase
      .from('curtain_templates')
      .select('treatment_category, curtain_type')
      .eq('id', windowCoveringId)
      .single();

    if (templateError || !template) {
      console.error('❌ Template not found:', templateError);
      return [];
    }

    console.log('📋 Template category:', template.treatment_category);

    // Fetch treatment_options for this category
    // Include system defaults OR account's own options
    const { data: treatmentOptions, error: optionsError } = await supabase
      .from('treatment_options')
      .select('*')
      .eq('treatment_category', template.treatment_category)
      .or(`is_system_default.eq.true,account_id.eq.${accountId}`)
      .eq('visible', true);

    if (optionsError) {
      console.error('❌ Failed to fetch treatment options:', optionsError);
      return [];
    }

    console.log('✅ Found treatment options:', treatmentOptions?.length || 0);

    if (!treatmentOptions || treatmentOptions.length === 0) {
      return [];
    }

    // For now, return empty array - the hierarchical structure handles options display
    // Traditional options are deprecated in favor of hierarchical structure
    return [];

  } catch (error) {
    console.error('❌ fetchTraditionalOptions error:', error);
    return [];
  }
};

/**
 * Fetches hierarchical options structure (categories -> options -> values)
 * This is the primary method for displaying options in the UI
 */
export const fetchHierarchicalOptions = async (windowCoveringId: string): Promise<HierarchicalOption[]> => {
  console.log('🔍 fetchHierarchicalOptions - Starting for template:', windowCoveringId);
  
  try {
    // Get current user and their account
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      console.error('❌ User not authenticated');
      return [];
    }

    // Get user's account_id
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('parent_account_id, user_id')
      .eq('user_id', user.id)
      .single();

    const accountId = userProfile?.parent_account_id || user.id;
    console.log('👤 User account:', accountId);

    // Get the template to find its treatment_category
    const { data: template, error: templateError } = await supabase
      .from('curtain_templates')
      .select('treatment_category, curtain_type')
      .eq('id', windowCoveringId)
      .single();

    if (templateError || !template) {
      console.error('❌ Template not found:', templateError);
      return [];
    }

    console.log('📋 Template category:', template.treatment_category);

    // Step 1: Get option type categories for this treatment
    const { data: optionCategories, error: categoriesError } = await supabase
      .from('option_type_categories')
      .select('*')
      .eq('treatment_category', template.treatment_category)
      .eq('active', true)
      .or(`is_system_default.eq.true,account_id.eq.${accountId}`)
      .order('sort_order', { ascending: true });

    if (categoriesError) {
      console.error('❌ Failed to fetch option categories:', categoriesError);
      return [];
    }

    console.log('✅ Found option categories:', optionCategories?.length || 0);

    if (!optionCategories || optionCategories.length === 0) {
      return [];
    }

    // Get user's hidden categories
    const { data: hiddenCategories } = await supabase
      .from('hidden_option_categories' as any)
      .select('option_type_category_id')
      .eq('user_id', user.id);

    const hiddenIds = new Set(hiddenCategories?.map((h: any) => h.option_type_category_id) || []);

    // Filter out categories that are:
    // - User-created and hidden_by_user = true
    // - System defaults that user has hidden via hidden_option_categories
    const visibleCategories = optionCategories.filter(cat => {
      if (cat.hidden_by_user) return false;
      if (cat.is_system_default && hiddenIds.has(cat.id)) return false;
      return true;
    });

    console.log('✅ Visible categories after filtering:', visibleCategories.length);

    // Step 2: For each category, get treatment_options
    const hierarchicalOptions: HierarchicalOption[] = [];

    for (const category of visibleCategories) {
      // Get treatment_options for this option type (using 'key' field to match type_key)
      const { data: options, error: optionsError } = await supabase
        .from('treatment_options')
        .select('*')
        .eq('treatment_category', template.treatment_category)
        .eq('key', category.type_key)
        .or(`is_system_default.eq.true,account_id.eq.${accountId}`)
        .eq('visible', true)
        .order('order_index', { ascending: true });

      if (optionsError) {
        console.error(`❌ Failed to fetch options for ${category.type_key}:`, optionsError);
        continue;
      }

      if (!options || options.length === 0) {
        console.log(`ℹ️ No options found for category: ${category.type_label}`);
        continue;
      }

      console.log(`✅ Found ${options.length} options for ${category.type_label}`);

      // Step 3: For each option, get its values
      const subcategories = await Promise.all(
        options.map(async (option) => {
          const { data: values, error: valuesError } = await supabase
            .from('option_values')
            .select('*')
            .eq('option_id', option.id)
            .or(`is_system_default.eq.true,account_id.eq.${accountId}`)
            .eq('hidden_by_user', false)
            .order('order_index', { ascending: true });

          if (valuesError) {
            console.error(`❌ Failed to fetch values for option ${option.id}:`, valuesError);
            return null;
          }

          if (!values || values.length === 0) {
            console.log(`ℹ️ No values found for option: ${option.label}`);
            return null;
          }

          console.log(`✅ Found ${values.length} values for ${option.label}`);

          // Map to SubSubCategory format (the actual selectable values)
          const subSubcategories = values.map(value => ({
            id: value.id,
            name: value.label,
            description: (value.extra_data as any)?.description || undefined,
            base_price: parseFloat(String(value.pricing_grid_data || 0)),
            pricing_method: value.pricing_method || option.pricing_method || 'fixed',
            image_url: (value.extra_data as any)?.image_url || undefined,
            extras: []
          }));

          return {
            id: option.id,
            name: option.label,
            description: undefined,
            base_price: parseFloat(String(option.base_price || 0)),
            pricing_method: option.pricing_method || 'fixed',
            sub_subcategories: subSubcategories
          };
        })
      );

      // Filter out null results and add to hierarchical structure
      const validSubcategories = subcategories.filter(sub => sub !== null);
      
      if (validSubcategories.length > 0) {
        hierarchicalOptions.push({
          id: category.id,
          name: category.type_label,
          description: undefined,
          subcategories: validSubcategories
        });
      }
    }

    console.log('✅ Final hierarchical structure:', hierarchicalOptions.length, 'categories');
    return hierarchicalOptions;

  } catch (error) {
    console.error('❌ fetchHierarchicalOptions error:', error);
    return [];
  }
};
