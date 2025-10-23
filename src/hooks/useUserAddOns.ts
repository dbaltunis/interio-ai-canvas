import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionAddOn, UserSubscriptionAddOn } from '@/types/subscriptions';

export const useAvailableAddOns = () => {
  return useQuery({
    queryKey: ['available-add-ons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_add_ons')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as SubscriptionAddOn[];
    },
  });
};

export const useUserAddOns = () => {
  return useQuery({
    queryKey: ['user-add-ons'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_subscription_add_ons')
        .select(`
          *,
          add_on:subscription_add_ons(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data as UserSubscriptionAddOn[];
    },
  });
};

export const useActivateAddOn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (addOnId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_subscription_add_ons')
        .insert({
          user_id: user.id,
          add_on_id: addOnId,
          is_active: true,
          activated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-add-ons'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-features'] });
      toast({
        title: 'Add-on activated',
        description: 'Your new add-on is now active.',
      });
    },
    onError: (error) => {
      console.error('Error activating add-on:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate add-on. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeactivateAddOn = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userAddOnId: string) => {
      const { error } = await supabase
        .from('user_subscription_add_ons')
        .update({ is_active: false })
        .eq('id', userAddOnId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-add-ons'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-features'] });
      toast({
        title: 'Add-on removed',
        description: 'The add-on has been deactivated.',
      });
    },
    onError: (error) => {
      console.error('Error deactivating add-on:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove add-on. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
