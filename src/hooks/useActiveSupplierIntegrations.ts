import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export interface SupplierIntegration {
  type: 'twc' | 'rfms' | 'tig_pim' | string;
  name: string;
  isProduction: boolean;
  apiUrl?: string;
}

function getIntegrationName(type: string): string {
  switch (type) {
    case "twc":
      return "TWC Online";
    case "rfms":
      return "RFMS Core";
    case "tig_pim":
      return "TIG PIM";
    default:
      return type.toUpperCase();
  }
}

/**
 * Hook to fetch ALL active supplier integrations (both production and test mode)
 * Used to determine visibility of the supplier ordering dropdown
 */
export const useAllSupplierIntegrations = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["all-supplier-integrations", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("integration_settings")
        .select("integration_type, api_credentials, configuration")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .in("integration_type", ["twc", "rfms", "tig_pim"]);

      if (error) {
        console.error("Error fetching supplier integrations:", error);
        return [];
      }

      // Map ALL active integrations, marking production vs test mode
      const integrations: SupplierIntegration[] = (data || []).map((i) => {
        const creds = i.api_credentials as Record<string, any> | null;
        return {
          type: i.integration_type,
          name: getIntegrationName(i.integration_type),
          isProduction: creds?.environment === "production",
          apiUrl: creds?.api_url,
        };
      });

      return integrations;
    },
    enabled: !!effectiveOwnerId,
  });
};

/**
 * Hook to fetch active supplier integrations in production mode ONLY
 * Used to determine which supplier ordering options can actually submit orders
 */
export const useActiveSupplierIntegrations = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["active-supplier-integrations", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("integration_settings")
        .select("integration_type, api_credentials, configuration")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .in("integration_type", ["twc", "rfms", "tig_pim"]);

      if (error) {
        console.error("Error fetching supplier integrations:", error);
        return [];
      }

      // Filter to only production-mode integrations and map to usable format
      const integrations: SupplierIntegration[] = (data || [])
        .filter((i) => {
          const creds = i.api_credentials as Record<string, any> | null;
          return creds?.environment === "production";
        })
        .map((i) => {
          const creds = i.api_credentials as Record<string, any> | null;
          return {
            type: i.integration_type,
            name: getIntegrationName(i.integration_type),
            isProduction: true,
            apiUrl: creds?.api_url,
          };
        });

      return integrations;
    },
    enabled: !!effectiveOwnerId,
  });
};

/**
 * Check if a specific supplier integration is active in production mode
 */
export const useHasProductionIntegration = (supplierType: string) => {
  const { data: integrations = [], isLoading } = useActiveSupplierIntegrations();
  
  return {
    hasIntegration: integrations.some((i) => i.type === supplierType),
    isLoading,
  };
};
