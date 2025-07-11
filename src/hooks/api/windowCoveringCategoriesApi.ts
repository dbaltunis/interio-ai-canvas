
import { supabase } from '@/integrations/supabase/client';
import { OptionCategory, OptionSubcategory, OptionSubSubcategory, OptionExtra } from '../types/windowCoveringTypes';

export const fetchCategoriesFromDB = async (): Promise<OptionCategory[]> => {
  console.log('fetchCategoriesFromDB - Starting fetch...');
  
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('window_covering_option_categories')
      .select('*')
      .order('sort_order');

    if (categoriesError) {
      console.error('fetchCategoriesFromDB - Categories error:', categoriesError);
      throw categoriesError;
    }

    console.log('fetchCategoriesFromDB - Categories fetched:', categories?.length || 0);

    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('window_covering_option_subcategories')
      .select('*')
      .order('sort_order');

    if (subcategoriesError) {
      console.error('fetchCategoriesFromDB - Subcategories error:', subcategoriesError);
      throw subcategoriesError;
    }

    console.log('fetchCategoriesFromDB - Subcategories fetched:', subcategories?.length || 0);

    const { data: subSubcategories, error: subSubcategoriesError } = await supabase
      .from('window_covering_option_sub_subcategories')
      .select('*')
      .order('sort_order');

    if (subSubcategoriesError) {
      console.error('fetchCategoriesFromDB - Sub-subcategories error:', subSubcategoriesError);
      throw subSubcategoriesError;
    }

    console.log('fetchCategoriesFromDB - Sub-subcategories fetched:', subSubcategories?.length || 0);

    const { data: extras, error: extrasError } = await supabase
      .from('window_covering_option_extras')
      .select('*')
      .order('sort_order');

    if (extrasError) {
      console.error('fetchCategoriesFromDB - Extras error:', extrasError);
      throw extrasError;
    }

    console.log('fetchCategoriesFromDB - Extras fetched:', extras?.length || 0);

    // Build hierarchy
    const categoriesWithHierarchy: OptionCategory[] = (categories || []).map(category => {
      const categorySubcategories = (subcategories || [])
        .filter(sub => sub.category_id === category.id)
        .map(subcategory => {
          const subSubcats = (subSubcategories || [])
            .filter(subSub => subSub.subcategory_id === subcategory.id)
            .map(subSubcategory => {
              const subSubExtras = (extras || [])
                .filter(extra => extra.sub_subcategory_id === subSubcategory.id)
                .map(extra => ({
                  id: extra.id,
                  name: extra.name || '',
                  description: extra.description,
                  pricing_method: extra.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
                  base_price: extra.base_price || 0,
                  sort_order: extra.sort_order || 0,
                  image_url: extra.image_url,
                  is_required: extra.is_required || false,
                  is_default: extra.is_default || false,
                  sub_subcategory_id: extra.sub_subcategory_id
                }));

              return {
                id: subSubcategory.id,
                name: subSubcategory.name || '',
                description: subSubcategory.description,
                pricing_method: subSubcategory.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
                base_price: subSubcategory.base_price || 0,
                sort_order: subSubcategory.sort_order || 0,
                image_url: subSubcategory.image_url,
                subcategory_id: subSubcategory.subcategory_id,
                extras: subSubExtras
              };
            });

          return {
            id: subcategory.id,
            name: subcategory.name || '',
            description: subcategory.description,
            pricing_method: subcategory.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
            base_price: subcategory.base_price || 0,
            fullness_ratio: subcategory.fullness_ratio,
            sort_order: subcategory.sort_order || 0,
            image_url: subcategory.image_url,
            category_id: subcategory.category_id,
            sub_subcategories: subSubcats
          };
        });

      return {
        id: category.id,
        name: category.name || '',
        description: category.description,
        is_required: category.is_required || false,
        sort_order: category.sort_order || 0,
        category_type: category.category_type || 'general',
        calculation_method: category.calculation_method as 'per-unit' | 'per-linear-meter' | 'per-linear-yard' | 'per-sqm' | 'fixed' | 'percentage',
        subcategories: categorySubcategories
      };
    });

    console.log('fetchCategoriesFromDB - Built hierarchy with', categoriesWithHierarchy.length, 'categories');
    return categoriesWithHierarchy;
  } catch (error) {
    console.error('fetchCategoriesFromDB - Error:', error);
    throw error;
  }
};

export const createCategoryInDB = async (category: Omit<OptionCategory, 'id' | 'subcategories'>): Promise<OptionCategory> => {
  console.log('createCategoryInDB - Creating category:', category.name);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('window_covering_option_categories')
      .insert([{
        name: category.name,
        description: category.description,
        is_required: category.is_required,
        sort_order: category.sort_order,
        category_type: category.category_type,
        calculation_method: category.calculation_method,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('createCategoryInDB - Error:', error);
      throw error;
    }

    const result: OptionCategory = {
      id: data.id,
      name: data.name || '',
      description: data.description,
      is_required: data.is_required || false,
      sort_order: data.sort_order || 0,
      category_type: data.category_type || 'general',
      calculation_method: data.calculation_method as 'per-unit' | 'per-linear-meter' | 'per-linear-yard' | 'per-sqm' | 'fixed' | 'percentage',
      subcategories: []
    };

    console.log('createCategoryInDB - Created category:', result.name);
    return result;
  } catch (error) {
    console.error('createCategoryInDB - Error:', error);
    throw error;
  }
};

export const createSubcategoryInDB = async (subcategory: Omit<OptionSubcategory, 'id'>): Promise<OptionSubcategory> => {
  console.log('createSubcategoryInDB - Creating subcategory:', subcategory.name);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('window_covering_option_subcategories')
      .insert([{
        name: subcategory.name,
        description: subcategory.description,
        pricing_method: subcategory.pricing_method,
        base_price: subcategory.base_price,
        fullness_ratio: subcategory.fullness_ratio,
        sort_order: subcategory.sort_order,
        image_url: subcategory.image_url,
        category_id: subcategory.category_id,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('createSubcategoryInDB - Error:', error);
      throw error;
    }

    const result: OptionSubcategory = {
      id: data.id,
      name: data.name || '',
      description: data.description,
      pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
      base_price: data.base_price || 0,
      fullness_ratio: data.fullness_ratio,
      sort_order: data.sort_order || 0,
      image_url: data.image_url,
      category_id: data.category_id,
      sub_subcategories: []
    };

    console.log('createSubcategoryInDB - Created subcategory:', result.name);
    return result;
  } catch (error) {
    console.error('createSubcategoryInDB - Error:', error);
    throw error;
  }
};

export const createSubSubcategoryInDB = async (subSubcategory: Omit<OptionSubSubcategory, 'id' | 'extras'>): Promise<OptionSubSubcategory> => {
  console.log('createSubSubcategoryInDB - Creating sub-subcategory:', subSubcategory.name);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('window_covering_option_sub_subcategories')
      .insert([{
        name: subSubcategory.name,
        description: subSubcategory.description,
        pricing_method: subSubcategory.pricing_method,
        base_price: subSubcategory.base_price,
        sort_order: subSubcategory.sort_order,
        image_url: subSubcategory.image_url,
        subcategory_id: subSubcategory.subcategory_id,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('createSubSubcategoryInDB - Error:', error);
      throw error;
    }

    const result: OptionSubSubcategory = {
      id: data.id,
      name: data.name || '',
      description: data.description,
      pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
      base_price: data.base_price || 0,
      sort_order: data.sort_order || 0,
      image_url: data.image_url,
      subcategory_id: data.subcategory_id,
      extras: []
    };

    console.log('createSubSubcategoryInDB - Created sub-subcategory:', result.name);
    return result;
  } catch (error) {
    console.error('createSubSubcategoryInDB - Error:', error);
    throw error;
  }
};

export const createExtraInDB = async (extra: Omit<OptionExtra, 'id'>): Promise<OptionExtra> => {
  console.log('createExtraInDB - Creating extra:', extra.name);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('window_covering_option_extras')
      .insert([{
        name: extra.name,
        description: extra.description,
        pricing_method: extra.pricing_method,
        base_price: extra.base_price,
        sort_order: extra.sort_order,
        image_url: extra.image_url,
        is_required: extra.is_required,
        is_default: extra.is_default,
        sub_subcategory_id: extra.sub_subcategory_id,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('createExtraInDB - Error:', error);
      throw error;
    }

    const result: OptionExtra = {
      id: data.id,
      name: data.name || '',
      description: data.description,
      pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
      base_price: data.base_price || 0,
      sort_order: data.sort_order || 0,
      image_url: data.image_url,
      is_required: data.is_required || false,
      is_default: data.is_default || false,
      sub_subcategory_id: data.sub_subcategory_id
    };

    console.log('createExtraInDB - Created extra:', result.name);
    return result;
  } catch (error) {
    console.error('createExtraInDB - Error:', error);
    throw error;
  }
};

export const deleteCategoryFromDB = async (id: string): Promise<void> => {
  console.log('deleteCategoryFromDB - Deleting category:', id);
  
  try {
    const { error } = await supabase
      .from('window_covering_option_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteCategoryFromDB - Error:', error);
      throw error;
    }

    console.log('deleteCategoryFromDB - Deleted category:', id);
  } catch (error) {
    console.error('deleteCategoryFromDB - Error:', error);
    throw error;
  }
};

export const deleteSubcategoryFromDB = async (id: string): Promise<void> => {
  console.log('deleteSubcategoryFromDB - Deleting subcategory:', id);
  
  try {
    const { error } = await supabase
      .from('window_covering_option_subcategories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteSubcategoryFromDB - Error:', error);
      throw error;
    }

    console.log('deleteSubcategoryFromDB - Deleted subcategory:', id);
  } catch (error) {
    console.error('deleteSubcategoryFromDB - Error:', error);
    throw error;
  }
};

export const deleteSubSubcategoryFromDB = async (id: string): Promise<void> => {
  console.log('deleteSubSubcategoryFromDB - Deleting sub-subcategory:', id);
  
  try {
    const { error } = await supabase
      .from('window_covering_option_sub_subcategories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteSubSubcategoryFromDB - Error:', error);
      throw error;
    }

    console.log('deleteSubSubcategoryFromDB - Deleted sub-subcategory:', id);
  } catch (error) {
    console.error('deleteSubSubcategoryFromDB - Error:', error);
    throw error;
  }
};

export const deleteExtraFromDB = async (id: string): Promise<void> => {
  console.log('deleteExtraFromDB - Deleting extra:', id);
  
  try {
    const { error } = await supabase
      .from('window_covering_option_extras')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteExtraFromDB - Error:', error);
      throw error;
    }

    console.log('deleteExtraFromDB - Deleted extra:', id);
  } catch (error) {
    console.error('deleteExtraFromDB - Error:', error);
    throw error;
  }
};
