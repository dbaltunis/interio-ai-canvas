import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStoreCategorySettings = (storeId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['store-category-settings', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_category_settings')
        .select('*')
        .eq('store_id', storeId);

      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const updateCategorySetting = useMutation({
    mutationFn: async ({ category, isExcluded }: { category: string; isExcluded: boolean }) => {
      const { error } = await supabase
        .from('store_category_settings')
        .upsert(
          {
            store_id: storeId,
            category,
            is_excluded: isExcluded,
          },
          {
            onConflict: 'store_id,category',
          }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-category-settings', storeId] });
      queryClient.invalidateQueries({ queryKey: ['public-store-products', storeId] });
      toast.success("Category settings updated");
    },
    onError: (error) => {
      toast.error("Failed to update category settings: " + (error as Error).message);
    },
  });

  return {
    ...query,
    updateCategorySetting,
  };
};
