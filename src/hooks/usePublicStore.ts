import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePublicStore = (storeSlug: string) => {
  return useQuery({
    queryKey: ['public-store', storeSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('online_stores')
        .select(`
          *,
          template:store_templates(*)
        `)
        .eq('store_slug', storeSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Store not found');
      return data;
    },
    enabled: !!storeSlug,
    retry: false,
  });
};

export const usePublicStoreProducts = (storeId: string) => {
  return useQuery({
    queryKey: ['public-store-products', storeId],
    queryFn: async () => {
      // Get excluded categories
      const { data: categorySettings } = await supabase
        .from('store_category_settings')
        .select('category')
        .eq('store_id', storeId)
        .eq('is_excluded', true);

      const excludedCategories = categorySettings?.map(s => s.category) || [];

      // Get products
      const { data, error } = await supabase
        .from('store_product_visibility')
        .select(`
          *,
          inventory_item:enhanced_inventory_items(*),
          template:curtain_templates(*)
        `)
        .eq('store_id', storeId)
        .eq('is_visible', true)
        .order('sort_order');

      if (error) throw error;

      // Filter out excluded categories
      const filteredData = data?.filter(product => {
        const category = product.inventory_item?.category;
        return !category || !excludedCategories.includes(category);
      }) || [];

      return filteredData;
    },
    enabled: !!storeId,
  });
};

export const usePublicStorePages = (storeId: string) => {
  return useQuery({
    queryKey: ['public-store-pages', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_pages')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });
};
