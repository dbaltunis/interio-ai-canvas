import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export interface SupplierIntegration {
  type: 'twc' | 'rfms' | 'tig_pim' | 'cw_systems' | 'norman_australia' | 'netsuite' | string;
  name: string;
  isProduction: boolean;
  apiUrl?: string;
}

// All supplier-type integration types that can be used for ordering
const SUPPLIER_INTEGRATION_TYPES = [
  "twc",
  "rfms",
  "tig_pim",
  "cw_systems",
  "norman_australia",
  "netsuite",
];

function getIntegrationName(type: string): string {
  switch (type) {
    case "twc":
      return "TWC Online";
    case "rfms":
      return "RFMS";
    case "tig_pim":
      return "TIG PIM";
    case "cw_systems":
      return "CW Systems";
    case "norman_australia":
      return "Norman Australia";
    case "netsuite":
      return "NetSuite";
    default:
      return type.toUpperCase();
  }
}

/**
 * Determine if an integration is in production mode.
 * API-based integrations (TWC, RFMS) use environment field.
 * Email-based integrations (CW Systems, Norman) are production when they have account details.
 */
function isProductionMode(type: string, creds: Record<string, any> | null): boolean {
  if (type === 'cw_systems' || type === 'norman_australia') {
    // Email-based: production if account code/number is filled in
    return !!(creds?.account_code || creds?.account_number || creds?.account_name);
  }
  // API-based: check environment field
  return creds?.environment === "production";
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
        .eq("account_owner_id", effectiveOwnerId)
        .eq("active", true)
        .in("integration_type", SUPPLIER_INTEGRATION_TYPES);

      if (error) {
        console.error("Error fetching supplier integrations:", error);
        return [];
      }

      const integrations: SupplierIntegration[] = (data || []).map((i) => {
        const creds = i.api_credentials as Record<string, any> | null;
        return {
          type: i.integration_type,
          name: getIntegrationName(i.integration_type),
          isProduction: isProductionMode(i.integration_type, creds),
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
        .eq("account_owner_id", effectiveOwnerId)
        .eq("active", true)
        .in("integration_type", SUPPLIER_INTEGRATION_TYPES);

      if (error) {
        console.error("Error fetching supplier integrations:", error);
        return [];
      }

      // Filter to only production-mode integrations and map to usable format
      const integrations: SupplierIntegration[] = (data || [])
        .filter((i) => {
          const creds = i.api_credentials as Record<string, any> | null;
          return isProductionMode(i.integration_type, creds);
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
