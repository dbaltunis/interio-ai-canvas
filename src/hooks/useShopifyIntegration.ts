import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Mock data store
let mockIntegration: ShopifyIntegration = {
  id: 'mock-id',
  user_id: 'user-1',
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
};

export const useShopifyIntegration = () => {
  return useQuery({
    queryKey: ["shopify-integration"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockIntegration;
    },
  });
};

export const useUpdateShopifyIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<ShopifyIntegration>) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      mockIntegration = { ...mockIntegration, ...updates, updated_at: new Date().toISOString() };
      return mockIntegration;
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