import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserSubscription } from './useUserSubscription';
import { useQuery as useAddOnsQuery } from '@tanstack/react-query';

interface UsageLimits {
  inventory: {
    used: number;
    limit: number;
    percentage: number;
    canAdd: boolean;
    unlimited: boolean;
  };
  emails: {
    used: number;
    limit: number;
    percentage: number;
    canSend: boolean;
    unlimited: boolean;
  };
}

export const useUsageLimits = () => {
  const { data: subscription } = useUserSubscription();
  
  // Fetch user's active add-ons
  const { data: userAddOns } = useAddOnsQuery({
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
      return data || [];
    },
  });

  // Fetch current usage
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage-tracking'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const currentPeriodStart = new Date();
      currentPeriodStart.setDate(1);
      currentPeriodStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('user_usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_start', currentPeriodStart.toISOString().split('T')[0])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const calculateInventoryLimit = (): { limit: number; unlimited: boolean } => {
    // Check for unlimited add-on
    const hasUnlimited = userAddOns?.some((ua: any) => 
      ua.add_on?.feature_key === 'inventory_unlimited'
    );
    
    if (hasUnlimited) return { limit: Infinity, unlimited: true };

    // Check for 1K boost add-on
    const has1K = userAddOns?.some((ua: any) => 
      ua.add_on?.feature_key === 'inventory_1000'
    );
    
    if (has1K) return { limit: 1000, unlimited: false };

    // Default from plan
    return { 
      limit: (subscription?.plan as any)?.max_inventory_items || 100, 
      unlimited: false 
    };
  };

  const calculateEmailLimit = (): { limit: number; unlimited: boolean } => {
    // Check for unlimited add-on
    const hasUnlimited = userAddOns?.some((ua: any) => 
      ua.add_on?.feature_key === 'emails_unlimited'
    );
    
    if (hasUnlimited) return { limit: Infinity, unlimited: true };

    // Check for 500 pack add-on
    const has500 = userAddOns?.some((ua: any) => 
      ua.add_on?.feature_key === 'emails_500'
    );
    
    if (has500) return { limit: 500, unlimited: false };

    // Default from plan
    return { 
      limit: (subscription?.plan as any)?.max_emails_per_month || 50, 
      unlimited: false 
    };
  };

  const inventoryLimit = calculateInventoryLimit();
  const emailLimit = calculateEmailLimit();

  const inventoryUsed = usage?.inventory_items_count || 0;
  const emailsUsed = usage?.emails_sent_count || 0;

  const limits: UsageLimits = {
    inventory: {
      used: inventoryUsed,
      limit: inventoryLimit.limit,
      percentage: inventoryLimit.unlimited ? 0 : (inventoryUsed / inventoryLimit.limit) * 100,
      canAdd: inventoryLimit.unlimited || inventoryUsed < inventoryLimit.limit,
      unlimited: inventoryLimit.unlimited,
    },
    emails: {
      used: emailsUsed,
      limit: emailLimit.limit,
      percentage: emailLimit.unlimited ? 0 : (emailsUsed / emailLimit.limit) * 100,
      canSend: emailLimit.unlimited || emailsUsed < emailLimit.limit,
      unlimited: emailLimit.unlimited,
    },
  };

  return {
    ...limits,
    isLoading,
    refresh: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('sync_inventory_usage', { p_user_id: user.id });
      }
    },
  };
};
