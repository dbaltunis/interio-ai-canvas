import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AccountFeatureFlag {
  id: string;
  user_id: string;
  feature_key: string;
  enabled: boolean;
  config: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch feature flags for a specific account (admin use)
 */
export const useAdminAccountFeatures = (userId: string) => {
  return useQuery({
    queryKey: ["adminAccountFeatures", userId],
    queryFn: async (): Promise<AccountFeatureFlag[]> => {
      const { data, error } = await supabase
        .from("account_feature_flags")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching account features:", error);
        throw error;
      }

      return (data || []) as AccountFeatureFlag[];
    },
    enabled: !!userId,
  });
};

/**
 * Hook to update or create a feature flag for an account
 */
export const useUpdateAccountFeature = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      featureKey,
      enabled,
      config,
    }: {
      userId: string;
      featureKey: string;
      enabled: boolean;
      config?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from("account_feature_flags")
        .upsert(
          {
            user_id: userId,
            feature_key: featureKey,
            enabled,
            config: config || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,feature_key",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["adminAccountFeatures", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      toast({
        title: "Feature Updated",
        description: `${variables.featureKey} has been ${variables.enabled ? "enabled" : "disabled"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update feature",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update seat limits for an account subscription
 */
export const useUpdateSeatLimit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      totalUsers,
    }: {
      subscriptionId: string;
      totalUsers: number;
    }) => {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ 
          total_users: totalUsers,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      toast({
        title: "Seat Limit Updated",
        description: "The user seat limit has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update seat limit",
        variant: "destructive",
      });
    },
  });
};

/**
 * Helper to check if a feature is enabled for an account
 */
export const isFeatureEnabled = (
  features: AccountFeatureFlag[] | undefined,
  featureKey: string
): boolean => {
  if (!features) return false;
  const feature = features.find((f) => f.feature_key === featureKey);
  return feature?.enabled ?? false;
};

/**
 * Helper to get feature config
 */
export const getFeatureConfig = <T extends Record<string, any>>(
  features: AccountFeatureFlag[] | undefined,
  featureKey: string
): T | null => {
  if (!features) return null;
  const feature = features.find((f) => f.feature_key === featureKey);
  return (feature?.config as T) || null;
};
