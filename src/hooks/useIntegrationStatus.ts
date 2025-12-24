
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntegrationData {
  integration_type: string;
  active: boolean;
  configuration: { api_key?: string; webhook_configured?: boolean } | null;
  api_credentials: { api_key?: string } | null;
  last_sync?: string;
}

export interface EmailSetupStatus {
  hasSendGridIntegration: boolean;
  hasEmailSettings: boolean;
  isFullyConfigured: boolean;
  setupMessage: string | null;
  emailLimit: string;
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

      const effectiveOwnerId = accountOwnerId || user.id;

      const { data, error } = await supabase
        .from('integration_settings')
        .select('integration_type, active, configuration, api_credentials, last_sync')
        .eq('account_owner_id', effectiveOwnerId)
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

// Combined hook for complete email setup status
export const useEmailSetupStatus = () => {
  const { hasSendGridIntegration, isLoading: integrationLoading } = useIntegrationStatus();
  
  const { data: emailSettings, isLoading: emailLoading } = useQuery({
    queryKey: ['email-settings-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get account owner for inheritance
      const { data: accountOwnerId } = await supabase.rpc('get_account_owner', { 
        user_id_param: user.id 
      });

      const effectiveOwnerId = accountOwnerId || user.id;

      // First try user's own settings
      let { data } = await supabase
        .from('email_settings')
        .select('id, from_email, from_name, active')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no settings, try account owner's settings
      if (!data && effectiveOwnerId !== user.id) {
        const { data: ownerSettings } = await supabase
          .from('email_settings')
          .select('id, from_email, from_name, active')
          .eq('user_id', effectiveOwnerId)
          .maybeSingle();
        
        data = ownerSettings;
      }

      return data;
    },
  });

  const hasEmailSettings = !!emailSettings?.from_email && !!emailSettings?.from_name;
  const isFullyConfigured = hasEmailSettings; // SendGrid is optional, just adds unlimited emails

  // Determine the appropriate message
  let setupMessage: string | null = null;
  if (!hasEmailSettings) {
    setupMessage = 'Configure sender details to start sending emails';
  }

  return {
    hasSendGridIntegration,
    hasEmailSettings,
    isFullyConfigured,
    setupMessage,
    emailLimit: hasSendGridIntegration ? 'Unlimited' : '500/month',
    isLoading: integrationLoading || emailLoading
  };
};
