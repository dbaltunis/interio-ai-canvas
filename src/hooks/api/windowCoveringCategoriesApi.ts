import { supabase } from '@/integrations/supabase/client';
import { OptionCategory, OptionSubcategory, OptionSubSubcategory, OptionExtra } from '../types/windowCoveringTypes';

export const fetchCategoriesFromDB = async (): Promise<OptionCategory[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Fetching categories for user:', user.id);

  // Fetch all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('window_covering_option_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    throw categoriesError;
  }

  // Fetch all subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('window_covering_option_subcategories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (subcategoriesError) {
    console.error('Error fetching subcategories:', subcategoriesError);
    throw subcategoriesError;
  }

  // Fetch all sub-subcategories
  const { data: subSubcategories, error: subSubcategoriesError } = await supabase
    .from('window_covering_option_sub_subcategories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (subSubcategoriesError) {
    console.error('Error fetching sub-subcategories:', subSubcategoriesError);
    throw subSubcategoriesError;
  }

  // Fetch all extras
  const { data: extras, error: extrasError } = await supabase
    .from('window_covering_option_extras')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (extrasError) {
    console.error('Error fetching extras:', extrasError);
    throw extrasError;
  }

  // Build hierarchical structure
  const categoriesWithHierarchy = (categories || []).map(category => ({
    ...category,
    subcategories: (subcategories || [])
      .filter(sub => sub.category_id === category.id)
      .map(sub => ({
        ...sub,
        pricing_method: sub.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
        sub_subcategories: (subSubcategories || [])
          .filter(subSub => subSub.subcategory_id === sub.id)
          .map(subSub => ({
            ...subSub,
            pricing_method: subSub.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
            extras: (extras || [])
              .filter(extra => extra.sub_subcategory_id === subSub.id)
              .map(extra => ({
                ...extra,
                pricing_method: extra.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage' | 'per-item'
              }))
          }))
      }))
  }));

  console.log('Final categories with hierarchy:', categoriesWithHierarchy);
  return categoriesWithHierarchy as OptionCategory[];
};

export const createCategoryInDB = async (category: Omit<OptionCategory, 'id' | 'subcategories'>): Promise<OptionCategory> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Creating category:', category);

  const { data, error } = await supabase
    .from('window_covering_option_categories')
    .insert([
      {
        name: category.name,
        description: category.description || null,
        is_required: category.is_required || false,
        sort_order: category.sort_order || 0,
        image_url: category.image_url || null,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  console.log('Created category:', data);
  return { ...data, subcategories: [] };
};

export const createSubcategoryInDB = async (subcategory: Omit<OptionSubcategory, 'id'>): Promise<OptionSubcategory> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Creating subcategory:', subcategory);

  const { data, error } = await supabase
    .from('window_covering_option_subcategories')
    .insert([
      {
        category_id: subcategory.category_id,
        name: subcategory.name,
        description: subcategory.description || null,
        pricing_method: subcategory.pricing_method,
        base_price: subcategory.base_price,
        fullness_ratio: subcategory.fullness_ratio || null,
        extra_fabric_percentage: subcategory.extra_fabric_percentage || null,
        sort_order: subcategory.sort_order || 0,
        image_url: subcategory.image_url || null,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }

  console.log('Created subcategory:', data);
  return {
    ...data,
    pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage'
  } as OptionSubcategory;
};

export const createSubSubcategoryInDB = async (subSubcategory: Omit<OptionSubSubcategory, 'id' | 'extras'>): Promise<OptionSubSubcategory> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Creating sub-subcategory:', subSubcategory);

  const { data, error } = await supabase
    .from('window_covering_option_sub_subcategories')
    .insert([
      {
        subcategory_id: subSubcategory.subcategory_id,
        name: subSubcategory.name,
        description: subSubcategory.description || null,
        pricing_method: subSubcategory.pricing_method,
        base_price: subSubcategory.base_price,
        fullness_ratio: subSubcategory.fullness_ratio || null,
        extra_fabric_percentage: subSubcategory.extra_fabric_percentage || null,
        sort_order: subSubcategory.sort_order || 0,
        image_url: subSubcategory.image_url || null,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating sub-subcategory:', error);
    throw error;
  }

  console.log('Created sub-subcategory:', data);
  return {
    ...data,
    pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage',
    extras: []
  } as OptionSubSubcategory;
};

export const createExtraInDB = async (extra: Omit<OptionExtra, 'id'>): Promise<OptionExtra> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  console.log('Creating extra:', extra);

  const { data, error } = await supabase
    .from('window_covering_option_extras')
    .insert([
      {
        sub_subcategory_id: extra.sub_subcategory_id,
        name: extra.name,
        description: extra.description || null,
        pricing_method: extra.pricing_method,
        base_price: extra.base_price,
        sort_order: extra.sort_order || 0,
        image_url: extra.image_url || null,
        is_required: extra.is_required || false,
        is_default: extra.is_default || false,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating extra:', error);
    throw error;
  }

  console.log('Created extra:', data);
  return {
    ...data,
    pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage' | 'per-item'
  } as OptionExtra;
};

export const deleteCategoryFromDB = async (id: string): Promise<void> => {
  console.log('Deleting category:', id);
  
  const { error } = await supabase
    .from('window_covering_option_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
  
  console.log('Category deleted successfully');
};

export const deleteSubcategoryFromDB = async (id: string): Promise<void> => {
  console.log('Deleting subcategory:', id);
  
  const { error } = await supabase
    .from('window_covering_option_subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
  
  console.log('Subcategory deleted successfully');
};

export const deleteSubSubcategoryFromDB = async (id: string): Promise<void> => {
  console.log('Deleting sub-subcategory:', id);
  
  const { error } = await supabase
    .from('window_covering_option_sub_subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting sub-subcategory:', error);
    throw error;
  }
  
  console.log('Sub-subcategory deleted successfully');
};

export const deleteExtraFromDB = async (id: string): Promise<void> => {
  console.log('Deleting extra:', id);
  
  const { error } = await supabase
    .from('window_covering_option_extras')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting extra:', error);
    throw error;
  }
  
  console.log('Extra deleted successfully');
};
