import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StoreProductCatalogItem {
  id: string;
  store_id: string;
  inventory_item_id: string;
  template_id?: string | null;
  is_visible: boolean;
  is_featured: boolean;
  custom_description?: string;
  custom_images?: string[];
  sort_order: number;
  inventory_item: any;
  template?: any;
}

export const useStoreProductCatalog = (storeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-product-catalog', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from('store_product_visibility')
        .select(`
          *,
          inventory_item:enhanced_inventory_items(*),
          template:curtain_templates(*)
        `)
        .eq('store_id', storeId)
        .order('sort_order');

      if (error) throw error;
      return data as StoreProductCatalogItem[];
    },
    enabled: !!storeId,
  });

  const bulkUpdateVisibility = useMutation({
    mutationFn: async ({ ids, isVisible }: { ids: string[]; isVisible: boolean }) => {
      const { error } = await supabase
        .from('store_product_visibility')
        .update({ is_visible: isVisible })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-product-catalog', storeId] });
      toast({
        title: "Products updated",
        description: "Visibility has been updated for selected products.",
      });
    },
  });

  const updateDescription = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      const { error } = await supabase
        .from('store_product_visibility')
        .update({ custom_description: description })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-product-catalog', storeId] });
      toast({
        title: "Description updated",
        description: "Product description has been updated.",
      });
    },
  });

  const updateImages = useMutation({
    mutationFn: async ({ id, images }: { id: string; images: string[] }) => {
      const { error } = await supabase
        .from('store_product_visibility')
        .update({ custom_images: images as any })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-product-catalog', storeId] });
      toast({
        title: "Images updated",
        description: "Product images have been updated.",
      });
    },
  });

  const bulkAddProducts = useMutation({
    mutationFn: async ({ itemIds, templates }: { itemIds: string[]; templates?: Record<string, string> }) => {
      if (!storeId) throw new Error("Store ID required");

      const items = itemIds.map((itemId, index) => ({
        store_id: storeId,
        inventory_item_id: itemId,
        template_id: templates?.[itemId] || null,
        is_visible: false,
        is_featured: false,
        sort_order: index,
      }));

      const { error } = await supabase
        .from('store_product_visibility')
        .upsert(items, { onConflict: 'store_id,inventory_item_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-product-catalog', storeId] });
      toast({
        title: "Products added",
        description: "Selected items have been added to your store catalog.",
      });
    },
  });

  return {
    ...query,
    products: query.data || [],
    bulkUpdateVisibility,
    updateDescription,
    updateImages,
    bulkAddProducts,
  };
};
