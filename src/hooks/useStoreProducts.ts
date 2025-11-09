import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useStoreProducts = (storeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-products', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from('store_product_visibility')
        .select(`
          *,
          inventory_item:enhanced_inventory_items(*)
        `)
        .eq('store_id', storeId)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('store_product_visibility')
        .update({ is_visible: isVisible })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-products', storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-stats', storeId] });
      toast({
        title: "Product updated",
        description: "Product visibility has been updated.",
      });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const { error } = await supabase
        .from('store_product_visibility')
        .update({ is_featured: isFeatured })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-products', storeId] });
    },
  });

  return {
    ...query,
    toggleVisibility,
    toggleFeatured,
  };
};
