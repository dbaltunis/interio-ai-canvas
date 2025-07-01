
import { supabase } from '@/integrations/supabase/client';
import { OptionCategory, OptionSubcategory } from '../types/windowCoveringTypes';

export const fetchCategoriesFromDB = async (): Promise<OptionCategory[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: categories, error: categoriesError } = await supabase
    .from('window_covering_option_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (categoriesError) throw categoriesError;

  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('window_covering_option_subcategories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (subcategoriesError) throw subcategoriesError;

  const categoriesWithSubcategories = categories.map(category => ({
    ...category,
    subcategories: subcategories
      .filter(sub => sub.category_id === category.id)
      .map(sub => ({
        ...sub,
        pricing_method: sub.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage'
      }))
  }));

  return categoriesWithSubcategories as OptionCategory[];
};

export const createCategoryInDB = async (category: Omit<OptionCategory, 'id' | 'subcategories'>): Promise<OptionCategory> => {
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

  return { ...data, subcategories: [] };
};

export const createSubcategoryInDB = async (subcategory: Omit<OptionSubcategory, 'id'>): Promise<OptionSubcategory> => {
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

  return {
    ...data,
    pricing_method: data.pricing_method as 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage'
  } as OptionSubcategory;
};

export const deleteCategoryFromDB = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('window_covering_option_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const deleteSubcategoryFromDB = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('window_covering_option_subcategories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
