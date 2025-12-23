
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntegrationData {
  integration_type: string;
  active: boolean;
  configuration: { api_key?: string; webhook_configured?: boolean } | null;
  api_credentials: { api_key?: string } | null;
  last_sync?: string;
}

export const useIntegrationStatus = () => {
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async (): Promise<IntegrationData | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get account owner to fetch account-level integrations
      const { data: accountOwnerId } = await supabase.rpc('get_account_owner', { 
        user_id_param: user.id 
      });

      const { data, error } = await supabase
        .from('integration_settings')
        .select('integration_type, active, configuration, api_credentials, last_sync')
        .eq('account_owner_id', accountOwnerId || user.id)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching integration status:', error);
        return null;
      }

      return data as IntegrationData | null;
    },
  });

  // Check if integration exists AND has a valid API key (check both configuration and api_credentials)
  const config = integrationStatus?.configuration;
  const apiCredentials = integrationStatus?.api_credentials;
  const hasValidApiKey = (config?.api_key && config.api_key.trim().length > 0) || 
                         (apiCredentials?.api_key && apiCredentials.api_key.trim().length > 0);

  return {
    hasSendGridIntegration: !!integrationStatus && !!hasValidApiKey,
    integrationData: integrationStatus,
    isLoading
  };
};
