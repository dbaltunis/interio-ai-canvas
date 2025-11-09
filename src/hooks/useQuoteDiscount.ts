import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'all' | 'fabrics_only' | 'selected_items';
  selectedItems?: string[];
}

export const useQuoteDiscount = (projectId?: string) => {
  const queryClient = useQueryClient();

  const getItemPrice = (item: any): number => {
    // Try different possible price fields
    return item.total_price || item.total || item.total_cost || 
           (item.unit_price && item.quantity ? item.unit_price * item.quantity : 0) || 0;
  };

  const calculateDiscountAmount = (
    items: any[],
    config: DiscountConfig,
    subtotal: number
  ): number => {
    let discountableAmount = 0;

    if (config.scope === 'all') {
      discountableAmount = subtotal;
    } else if (config.scope === 'fabrics_only') {
      // Filter items that contain fabric-related keywords
      const fabricItems = items.filter(item => {
        const searchText = [
          item.name || '',
          item.description || ''
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchText.includes('fabric') || 
               searchText.includes('material') ||
               searchText.includes('textile') ||
               searchText.includes('curtain') ||
               searchText.includes('drape') ||
               searchText.includes('blind') ||
               searchText.includes('roman') ||
               searchText.includes('roller');
      });
      discountableAmount = fabricItems.reduce((sum, item) => sum + getItemPrice(item), 0);
    } else if (config.scope === 'selected_items' && config.selectedItems) {
      const selectedItemsSet = new Set(config.selectedItems);
      const selectedItemsList = items.filter(item => selectedItemsSet.has(item.id));
      discountableAmount = selectedItemsList.reduce((sum, item) => sum + getItemPrice(item), 0);
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
      console.log('💾 Applying discount:', { quoteId, config, itemsCount: items.length, subtotal });
      const discountAmount = calculateDiscountAmount(items, config, subtotal);
      console.log('💰 Calculated discount amount:', discountAmount);

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

      if (error) {
        console.error('❌ Error applying discount:', error);
        throw error;
      }
      console.log('✅ Discount saved to DB:', {
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        discount_amount: data.discount_amount,
        discount_scope: data.discount_scope
      });
      return data;
    },
    onSuccess: async () => {
      // Aggressively invalidate ALL related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quotes"] }),
        queryClient.invalidateQueries({ queryKey: ["quote-versions"] }),
        projectId && queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["quote-items"] }),
        queryClient.invalidateQueries({ queryKey: ["treatments"] }),
      ].filter(Boolean));
      
      // Force refetch
      await queryClient.refetchQueries({ queryKey: ["quote-versions", projectId] });
      
      console.log('🔄 All quote queries invalidated and refetched');
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
    onSuccess: async () => {
      // Aggressively invalidate ALL related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quotes"] }),
        queryClient.invalidateQueries({ queryKey: ["quote-versions"] }),
        projectId && queryClient.invalidateQueries({ queryKey: ["quote-versions", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["quote-items"] }),
        queryClient.invalidateQueries({ queryKey: ["treatments"] }),
      ].filter(Boolean));
      
      // Force refetch
      await queryClient.refetchQueries({ queryKey: ["quote-versions", projectId] });
      
      console.log('🔄 Discount removed, all queries refetched');
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
    getItemPrice,
  };
};
