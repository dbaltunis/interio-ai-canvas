import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountHealthMetrics {
  permission_count: number;
  expected_permissions: number;
  has_business_settings: boolean;
  has_account_settings: boolean;
  sequence_count: number;
  expected_sequences: number;
  job_status_count: number;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
}

export interface AccountHealth {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
  health_status: 'healthy' | 'warning' | 'critical';
  health_score: number;
  metrics: AccountHealthMetrics;
  issues: string[];
}

export interface HealthSummary {
  total_accounts: number;
  healthy_accounts: number;
  warning_accounts: number;
  critical_accounts: number;
  accounts: AccountHealth[];
}

export function useAccountHealth() {
  return useQuery({
    queryKey: ['account-health'],
    queryFn: async (): Promise<HealthSummary> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('get-account-health', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('[useAccountHealth] Error fetching health data:', error);
        throw error;
      }

      return data as HealthSummary;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
