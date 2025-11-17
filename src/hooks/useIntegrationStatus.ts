
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIntegrationStatus = () => {
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get account owner to fetch account-level integrations
      const { data: accountOwnerId } = await supabase.rpc('get_account_owner', { 
        user_id_param: user.id 
      });

      const { data, error } = await supabase
        .from('integration_settings')
        .select('integration_type, active, configuration')
        .eq('account_owner_id', accountOwnerId || user.id)
        .eq('integration_type', 'sendgrid')
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching integration status:', error);
        return null;
      }

      return data;
    },
  });

  // Check if integration exists AND has a valid API key
  const config = integrationStatus?.configuration as { api_key?: string } | null;
  const hasValidApiKey = config?.api_key && config.api_key.trim().length > 0;

  return {
    hasSendGridIntegration: !!integrationStatus && !!hasValidApiKey,
    integrationData: integrationStatus,
    isLoading
  };
};
