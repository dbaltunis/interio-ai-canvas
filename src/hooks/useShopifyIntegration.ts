
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
      const { data, error } = await supabase
        .from("shopify_integration")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') throw error;
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

      const { data, error } = await supabase
        .from("shopify_integration")
        .insert({ ...integration, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify_integration"] });
      toast.success("Shopify integration configured successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to configure Shopify integration: " + error.message);
    },
  });
};

export const useUpdateShopifyIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...integration }: Partial<ShopifyIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from("shopify_integration")
        .update(integration)
        .eq("id", id)
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
