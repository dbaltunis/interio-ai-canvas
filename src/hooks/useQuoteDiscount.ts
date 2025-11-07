import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'all' | 'fabrics_only' | 'selected_items';
  selectedItems?: string[];
}

export const useQuoteDiscount = () => {
  const queryClient = useQueryClient();

  const calculateDiscountAmount = (
    items: any[],
    config: DiscountConfig,
    subtotal: number
  ): number => {
    let discountableAmount = 0;

    if (config.scope === 'all') {
      discountableAmount = subtotal;
    } else if (config.scope === 'fabrics_only') {
      // Filter items that contain fabric-related categories
      const fabricItems = items.filter(item => 
        item.name?.toLowerCase().includes('fabric') ||
        item.category?.toLowerCase().includes('fabric') ||
        item.description?.toLowerCase().includes('fabric')
      );
      discountableAmount = fabricItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    } else if (config.scope === 'selected_items' && config.selectedItems) {
      const selectedItemsSet = new Set(config.selectedItems);
      const selectedItemsList = items.filter(item => selectedItemsSet.has(item.id));
      discountableAmount = selectedItemsList.reduce((sum, item) => sum + (item.total_price || 0), 0);
    }

    if (config.type === 'percentage') {
      return (discountableAmount * config.value) / 100;
    } else {
      return Math.min(config.value, discountableAmount);
    }
  };

  const applyDiscount = useMutation({
    mutationFn: async ({ quoteId, config, items, subtotal }: {
      quoteId: string;
      config: DiscountConfig;
      items: any[];
      subtotal: number;
    }) => {
      const discountAmount = calculateDiscountAmount(items, config, subtotal);

      const { data, error } = await supabase
        .from("quotes")
        .update({
          discount_type: config.type,
          discount_value: config.value,
          discount_scope: config.scope,
          discount_amount: discountAmount,
          selected_discount_items: config.selectedItems || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      toast.success("Discount applied successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to apply discount: ${error.message}`);
    },
  });

  const removeDiscount = useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase
        .from("quotes")
        .update({
          discount_type: null,
          discount_value: null,
          discount_scope: null,
          discount_amount: 0,
          selected_discount_items: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      toast.success("Discount removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove discount: ${error.message}`);
    },
  });

  return {
    applyDiscount,
    removeDiscount,
    calculateDiscountAmount,
  };
};
