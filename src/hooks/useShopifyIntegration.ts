
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface ShopifyIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  auto_sync_enabled: boolean;
  sync_inventory: boolean;
  sync_prices: boolean;
  sync_images: boolean;
  last_full_sync?: string;
  sync_status: string;
  sync_log: Json;
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

      // Clean and validate the shop domain
      let cleanDomain = integration.shop_domain.trim();
      
      // Remove protocol and www if present
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
      
      // If it doesn't end with myshopify.com, it might be a custom domain
      // For Shopify OAuth, we need the .myshopify.com domain
      if (!cleanDomain.includes('.myshopify.com')) {
        // Convert custom domain to myshopify format if possible
        // This is a basic conversion - user might need to provide the correct myshopify domain
        const storeName = cleanDomain.split('.')[0];
        cleanDomain = `${storeName}.myshopify.com`;
      }

      // Test the connection
      try {
        const response = await fetch(`https://${cleanDomain}/.well-known/shopify/monorail`);
        if (!response.ok) {
          throw new Error(`Store "${cleanDomain}" is not accessible. Please check the domain. For Shopify apps, use the format: your-store-name.myshopify.com`);
        }
      } catch (error) {
        throw new Error(`Cannot connect to "${cleanDomain}". Please verify the store domain is correct. Use format: your-store-name.myshopify.com`);
      }

      const { data, error } = await supabase
        .from('shopify_integrations')
        .insert({
          user_id: user.id,
          shop_domain: cleanDomain,
          auto_sync_enabled: integration.auto_sync_enabled,
          sync_inventory: integration.sync_inventory,
          sync_prices: integration.sync_prices,
          sync_images: integration.sync_images,
          sync_status: integration.sync_status,
          sync_log: integration.sync_log as Json,
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
