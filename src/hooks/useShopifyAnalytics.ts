import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopifyAnalytics {
  id: string;
  user_id: string;
  shop_domain: string;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  orders_this_month: number;
  revenue_this_month: number;
  avg_order_value: number;
  analytics_data: any;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export const useShopifyAnalytics = () => {
  return useQuery({
    queryKey: ["shopify-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("shopify_analytics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ShopifyAnalytics | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSyncShopifyAnalytics = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("shopify-sync-analytics", {
        method: "POST",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-analytics"] });
      toast({
        title: "Analytics synced",
        description: "Shopify analytics have been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
