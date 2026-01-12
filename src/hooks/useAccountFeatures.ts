import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface AccountFeature {
  feature_key: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface DealerPortalConfig {
  dealer_seat_price: number;
  unlimited_seats: boolean;
  pricing_note?: string;
}

/**
 * Hook to fetch account feature flags for the effective account owner
 * This works for both account owners and child accounts (dealers, staff, etc.)
 */
export const useAccountFeatures = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["accountFeatures", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the user's parent account ID (or their own ID if they're an owner)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("parent_account_id")
        .eq("user_id", user.id)
        .single();

      const accountOwnerId = profile?.parent_account_id || user.id;

      // Fetch feature flags for the account owner
      const { data, error } = await supabase
        .from("account_feature_flags")
        .select("feature_key, enabled, config")
        .eq("user_id", accountOwnerId);

      if (error) {
        console.error("Error fetching account features:", error);
        return [];
      }

      return (data || []) as AccountFeature[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Check if a specific feature is enabled for the account
 */
export const useHasAccountFeature = (featureKey: string) => {
  const { data: features, isLoading } = useAccountFeatures();
  
  if (isLoading) return undefined;
  
  const feature = features?.find(f => f.feature_key === featureKey);
  return feature?.enabled ?? false;
};

/**
 * Get the configuration for a specific feature
 */
export const useAccountFeatureConfig = <T extends Record<string, any>>(
  featureKey: string
): T | null => {
  const { data: features } = useAccountFeatures();
  
  const feature = features?.find(f => f.feature_key === featureKey);
  return (feature?.config as T) || null;
};

/**
 * Specifically for dealer portal feature
 */
export const useDealerPortalFeature = () => {
  const hasFeature = useHasAccountFeature("dealer_portal");
  const config = useAccountFeatureConfig<DealerPortalConfig>("dealer_portal");
  
  return {
    isEnabled: hasFeature,
    dealerSeatPrice: config?.dealer_seat_price ?? 99, // Default £99 per seat
    unlimitedSeats: config?.unlimited_seats ?? false,
    pricingNote: config?.pricing_note,
  };
};
