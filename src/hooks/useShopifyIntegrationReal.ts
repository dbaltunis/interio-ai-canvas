import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShopifyIntegration } from '@/types/subscriptions';

export const useShopifyIntegrationReal = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
    queryKey: ['shopify-integration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try to get user's own integration first
      const { data, error } = await supabase
        .from('shopify_integrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no integration found, check account owner's integration
      if (!data) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('parent_account_id')
          .eq('user_id', user.id)
          .single();

        if (profile?.parent_account_id) {
          const { data: ownerIntegration, error: ownerError } = await supabase
            .from('shopify_integrations')
            .select('*')
            .eq('user_id', profile.parent_account_id)
            .maybeSingle();

          if (ownerError) throw ownerError;
          
          // Mark as read-only
          if (ownerIntegration) {
            return { ...ownerIntegration, isAccountOwner: true } as ShopifyIntegration & { isAccountOwner: boolean };
          }
        }
      }
      
      return data as ShopifyIntegration | null;
    },
  });

  const updateIntegration = useMutation({
    mutationFn: async (updates: Partial<ShopifyIntegration> & { shop_domain: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shopify_integrations')
        .upsert([{
          user_id: user.id,
          shop_domain: updates.shop_domain,
          ...updates,
        }], {
          onConflict: 'user_id,shop_domain',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      toast({
        title: 'Integration updated',
        description: 'Shopify integration settings have been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating integration',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const syncProducts = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('shopify-sync-products', {
        method: 'POST',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Sync completed',
        description: `Synced ${data.synced} products successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    integration,
    isLoading,
    updateIntegration: updateIntegration.mutate,
    syncProducts: syncProducts.mutate,
    isSyncing: syncProducts.isPending,
  };
};
