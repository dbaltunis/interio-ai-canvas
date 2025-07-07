
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShopifyIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  access_token: string;
  webhook_secret?: string;
  auto_sync_enabled: boolean;
  sync_inventory: boolean;
  sync_prices: boolean;
  sync_images: boolean;
  last_full_sync?: string;
  sync_status: "idle" | "syncing" | "error";
  sync_log: any[];
  created_at: string;
  updated_at: string;
}

export const useShopifyIntegration = () => {
  return useQuery({
    queryKey: ["shopify_integration"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('shopify_integrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching Shopify integration:', error);
        return null;
      }

      return data;
    },
  });
};

export const useCreateShopifyIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integration: Omit<ShopifyIntegration, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Test the connection first by trying to access the store
      try {
        const response = await fetch(`https://${integration.shop_domain}/.well-known/shopify/monorail`);
        if (!response.ok) {
          throw new Error(`Store "${integration.shop_domain}" is not accessible. Please check the domain.`);
        }
      } catch (error) {
        throw new Error(`Cannot connect to "${integration.shop_domain}". Please verify the store domain is correct.`);
      }

      const { data, error } = await supabase
        .from('shopify_integrations')
        .insert({
          user_id: user.id,
          shop_domain: integration.shop_domain,
          auto_sync_enabled: integration.auto_sync_enabled,
          sync_inventory: integration.sync_inventory,
          sync_prices: integration.sync_prices,
          sync_images: integration.sync_images,
          sync_status: integration.sync_status,
          sync_log: integration.sync_log,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify_integration"] });
      toast.success("✅ Store verified and connected! Check the Status tab for connection proof.");
    },
    onError: (error: any) => {
      toast.error("Connection failed: " + error.message);
    },
  });
};

export const useUpdateShopifyIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...integration }: Partial<ShopifyIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from('shopify_integrations')
        .update(integration)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify_integration"] });
      toast.success("Shopify integration updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update Shopify integration: " + error.message);
    },
  });
};
