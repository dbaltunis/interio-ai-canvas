
import { supabase } from '@/integrations/supabase/client';
import { OptionCategory, OptionSubcategory } from '../types/windowCoveringTypes';

export const fetchCategoriesFromDB = async () => {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('window_covering_option_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoriesError) throw categoriesError;

  const { data: subcategoriesData, error: subcategoriesError } = await supabase
    .from('window_covering_option_subcategories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (subcategoriesError) throw subcategoriesError;

  const categoriesWithSubcategories = (categoriesData || []).map(category => ({
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    is_required: category.is_required,
    sort_order: category.sort_order,
    subcategories: (subcategoriesData || [])
      .filter(sub => sub.category_id === category.id)
      .map(sub => ({
        id: sub.id,
        category_id: sub.category_id,
        name: sub.name,
        description: sub.description || undefined,
        pricing_method: sub.pricing_method as OptionSubcategory['pricing_method'],
        base_price: sub.base_price,
        fullness_ratio: sub.fullness_ratio || undefined,
        extra_fabric_percentage: sub.extra_fabric_percentage || undefined,
        sort_order: sub.sort_order
      } as OptionSubcategory))
  } as OptionCategory));

  return categoriesWithSubcategories;
};

export const createCategoryInDB = async (category: Omit<OptionCategory, 'id' | 'subcategories'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('window_covering_option_categories')
    .insert([
      {
        ...category,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;

  const newCategory: OptionCategory = {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    is_required: data.is_required,
    sort_order: data.sort_order,
    subcategories: []
  };

  return newCategory;
};

export const createSubcategoryInDB = async (subcategory: Omit<OptionSubcategory, 'id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('window_covering_option_subcategories')
    .insert([
      {
        ...subcategory,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;

  const newSubcategory: OptionSubcategory = {
    id: data.id,
    category_id: data.category_id,
    name: data.name,
    description: data.description || undefined,
    pricing_method: data.pricing_method as OptionSubcategory['pricing_method'],
    base_price: data.base_price,
    fullness_ratio: data.fullness_ratio || undefined,
    extra_fabric_percentage: data.extra_fabric_percentage || undefined,
    sort_order: data.sort_order
  };

  return newSubcategory;
};

export const deleteCategoryFromDB = async (id: string) => {
  const { error } = await supabase
    .from('window_covering_option_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const deleteSubcategoryFromDB = async (id: string) => {
  const { error } = await supabase
    .from('window_covering_option_subcategories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
