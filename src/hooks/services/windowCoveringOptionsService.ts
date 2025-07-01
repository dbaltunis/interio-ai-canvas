
import { supabase } from '@/integrations/supabase/client';
import type { WindowCoveringOption, HierarchicalOption } from '../types/windowCoveringOptionsTypes';

export const fetchTraditionalOptions = async (windowCoveringId: string) => {
  console.log('fetchTraditionalOptions - Fetching options for window covering:', windowCoveringId);
  
  const { data: traditionalOptions, error: traditionalError } = await supabase
    .from('window_covering_options')
    .select('*')
    .eq('window_covering_id', windowCoveringId)
    .order('sort_order', { ascending: true });

  if (traditionalError) {
    console.error('fetchTraditionalOptions - Error fetching traditional options:', traditionalError);
    throw traditionalError;
  }

  return traditionalOptions || [];
};

export const fetchHierarchicalOptions = async (windowCoveringId: string): Promise<HierarchicalOption[]> => {
  console.log('fetchHierarchicalOptions - Fetching hierarchical options for window covering:', windowCoveringId);
  
  // First fetch assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('window_covering_option_assignments')
    .select('category_id')
    .eq('window_covering_id', windowCoveringId);

  if (assignmentsError) {
    console.error('fetchHierarchicalOptions - Error fetching assignments:', assignmentsError);
    return [];
  }

  if (!assignments || assignments.length === 0) {
    console.log('fetchHierarchicalOptions - No assignments found');
    return [];
  }

  // Fetch the full category data
  const categoryIds = assignments.map(a => a.category_id);
  
  const { data: categories, error: categoriesError } = await supabase
    .from('window_covering_option_categories')
    .select(`
      id,
      name,
      description,
      is_required,
      image_url,
      sort_order,
      window_covering_option_subcategories (
        id,
        name,
        description,
        base_price,
        pricing_method,
        image_url,
        sort_order,
        window_covering_option_sub_subcategories (
          id,
          name,
          description,
          base_price,
          pricing_method,
          image_url,
          sort_order,
          window_covering_option_extras (
            id,
            name,
            description,
            base_price,
            pricing_method,
            image_url,
            is_required,
            is_default,
            sort_order
          )
        )
      )
    `)
    .in('id', categoryIds)
    .order('sort_order', { ascending: true });

  if (categoriesError) {
    console.error('fetchHierarchicalOptions - Error fetching categories:', categoriesError);
    return [];
  }

  return transformCategoriesData(categories);
};

const transformCategoriesData = (categories: any[]): HierarchicalOption[] => {
  if (!categories) return [];

  return categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    option_type: 'category',
    base_cost: 0,
    is_required: category.is_required,
    is_default: false,
    sort_order: category.sort_order,
    image_url: category.image_url,
    cost_type: 'fixed',
    pricing_method: 'fixed',
    subcategories: category.window_covering_option_subcategories?.map((sub: any) => ({
      id: sub.id,
      name: sub.name,
      description: sub.description,
      base_price: sub.base_price,
      pricing_method: sub.pricing_method,
      image_url: sub.image_url,
      sub_subcategories: sub.window_covering_option_sub_subcategories?.map((subSub: any) => ({
        id: subSub.id,
        name: subSub.name,
        description: subSub.description,
        base_price: subSub.base_price,
        pricing_method: subSub.pricing_method,
        image_url: subSub.image_url,
        extras: subSub.window_covering_option_extras?.map((extra: any) => ({
          id: extra.id,
          name: extra.name,
          description: extra.description,
          base_price: extra.base_price,
          pricing_method: extra.pricing_method,
          image_url: extra.image_url,
          is_required: extra.is_required,
          is_default: extra.is_default
        })) || []
      })) || []
    })) || []
  }));
};
