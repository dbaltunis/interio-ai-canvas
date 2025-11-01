import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShopifyOrder {
  id: string;
  user_id: string;
  project_id?: string;
  client_id?: string;
  shopify_order_id: string;
  order_number: string;
  financial_status: string;
  fulfillment_status: string;
  total_price: number;
  currency: string;
  customer_email: string;
  customer_name: string;
  order_data: any;
  created_at: string;
  updated_at: string;
}

export const useShopifyOrders = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['shopify-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('shopify_orders')
        .select(`
          *,
          projects (
            id,
            title,
            status
          ),
          clients (
            id,
            name,
            email
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShopifyOrder[];
    },
  });
};

export const useSyncCustomers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('shopify-sync-customers', {
        method: 'POST',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-integration'] });
      toast({
        title: 'Customers synced',
        description: `Successfully synced ${data.synced} new customers and updated ${data.updated} existing customers`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
