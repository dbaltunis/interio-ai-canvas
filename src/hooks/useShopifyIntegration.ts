
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShopifyIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  access_token?: string;
  auto_sync_enabled: boolean;
  sync_inventory: boolean;
  sync_prices: boolean;
  sync_images: boolean;
  sync_status: 'idle' | 'syncing' | 'error';
  last_sync_at?: string;
  sync_log: Array<{
    action: string;
    timestamp: string;
    details?: string;
    error?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export const useShopifyIntegration = () => {
  return useQuery({
    queryKey: ["shopify-integration"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("shopify_integrations")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as ShopifyIntegration | null;
    },
  });
};

export const useCreateShopifyIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (integration: Omit<ShopifyIntegration, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("shopify_integrations")
        .insert([{ ...integration, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
    },
  });
};

export const useUpdateShopifyIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ShopifyIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from("shopify_integrations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
    },
  });
};
