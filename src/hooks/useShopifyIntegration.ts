
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ShopifyIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  access_token?: string;
  webhook_secret?: string;
  auto_sync_enabled: boolean;
  sync_inventory: boolean;
  sync_prices: boolean;
  sync_images: boolean;
  sync_products: boolean;
  last_sync_at?: string;
  last_full_sync?: string;
  sync_status: 'idle' | 'syncing' | 'error';
  error_message?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Create shopify_integrations table if it doesn't exist
const createShopifyIntegrationsTable = async () => {
  const { error } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.shopify_integrations (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL,
        shop_domain TEXT NOT NULL,
        access_token TEXT,
        webhook_secret TEXT,
        auto_sync_enabled BOOLEAN DEFAULT true,
        sync_inventory BOOLEAN DEFAULT true,
        sync_prices BOOLEAN DEFAULT true,
        sync_images BOOLEAN DEFAULT false,
        sync_products BOOLEAN DEFAULT true,
        last_sync_at TIMESTAMP WITH TIME ZONE,
        last_full_sync TIMESTAMP WITH TIME ZONE,
        sync_status TEXT DEFAULT 'idle',
        error_message TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `
  });
  if (error) console.error('Error creating shopify_integrations table:', error);
};

export const useShopifyIntegration = () => {
  return useQuery({
    queryKey: ["shopify-integration"],
    queryFn: async () => {
      // Try to create table first (will be ignored if exists)
      await createShopifyIntegrationsTable();
      
      const { data, error } = await supabase
        .from("shopify_integrations")
        .select("*")
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Return mock data if no integration exists
      if (!data) {
        return {
          id: 'mock-id',
          user_id: 'mock-user',
          shop_domain: '',
          auto_sync_enabled: false,
          sync_inventory: true,
          sync_prices: true,
          sync_images: false,
          sync_products: true,
          last_sync_at: null,
          last_full_sync: null,
          sync_status: 'idle' as const,
          error_message: null,
          active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as ShopifyIntegration;
      }
      
      return data as ShopifyIntegration;
    },
  });
};

export const useUpdateShopifyIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<ShopifyIntegration>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("shopify_integrations")
        .upsert({ ...updates, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopify-integration"] });
      toast({
        title: "Success",
        description: "Shopify integration updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
