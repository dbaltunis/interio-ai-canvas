import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export type FeatureKey = 
  | 'crm'
  | 'quoting'
  | 'manual_quotes'
  | 'calendar'
  | 'email'
  | 'inventory'
  | 'window_treatments'
  | 'wallpapers'
  | 'shopify'
  | 'erp_integrations'
  | 'online_store';

interface FeatureAccess {
  [key: string]: boolean;
}

export const useSubscriptionFeatures = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: features, isLoading, error } = useQuery({
    queryKey: ['subscription-features', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return {};

      // Get user subscription with plan features
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:subscription_plans(features_included)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subError || !subscription) {
        console.log('No active subscription found');
        return {
          crm: true, // Basic features always available
          quoting: true,
          manual_quotes: true,
        } as FeatureAccess;
      }

      // Start with plan features
      const planFeatures = subscription.subscription_plan?.features_included || {};
      const allFeatures: FeatureAccess = typeof planFeatures === 'object' && planFeatures !== null 
        ? { ...planFeatures as FeatureAccess } 
        : {};

      // Get user add-ons
      const { data: userAddOns, error: addOnError } = await supabase
        .from('user_subscription_add_ons')
        .select(`
          *,
          add_on:subscription_add_ons(feature_key)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!addOnError && userAddOns) {
        userAddOns.forEach((addon: any) => {
          if (addon.add_on?.feature_key) {
            allFeatures[addon.add_on.feature_key] = true;
          }
        });
      }

      return allFeatures;
    },
  });

  const hasFeature = (featureKey: FeatureKey): boolean => {
    if (!features) return false;
    return features[featureKey] === true;
  };

  const hasAnyFeature = (...featureKeys: FeatureKey[]): boolean => {
    return featureKeys.some(key => hasFeature(key));
  };

  const hasAllFeatures = (...featureKeys: FeatureKey[]): boolean => {
    return featureKeys.every(key => hasFeature(key));
  };

  return {
    features: features || {},
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    isLoading,
    error,
  };
};
