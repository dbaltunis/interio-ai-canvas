import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionEnd?: string;
  loading: boolean;
  error?: string;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    loading: true
  });

  const checkSubscription = async () => {
    if (!user) {
      setStatus({ hasActiveSubscription: false, loading: false });
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setStatus({
        hasActiveSubscription: data?.subscribed || false,
        subscriptionEnd: data?.subscription_end,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus({
        hasActiveSubscription: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription'
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Check subscription status every 5 minutes
  useEffect(() => {
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    ...status,
    refreshSubscription: checkSubscription
  };
};