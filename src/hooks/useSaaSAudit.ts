import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrphanedRecord {
  id: string;
  user_id: string;
}

export interface MissingConfig {
  expected: number;
  actual: number;
  missing: string[];
}

export interface AccountAudit {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
  health_score: number;
  health_status: 'healthy' | 'warning' | 'critical';
  is_custom_account: boolean;
  missing_configs: {
    permissions: MissingConfig;
    business_settings: boolean;
    account_settings: boolean;
    number_sequences: MissingConfig;
    job_statuses: number;
    client_stages: MissingConfig;
    subscription: boolean;
  };
  twc_issues: {
    heading_type_required: number;
    orphaned_options: number;
  };
}

export interface OrphanedData {
  projects: OrphanedRecord[];
  quotes: OrphanedRecord[];
  clients: OrphanedRecord[];
  inventory_items: OrphanedRecord[];
  treatment_options: OrphanedRecord[];
}

export interface AuditSummary {
  timestamp: string;
  summary: {
    total_accounts: number;
    healthy_accounts: number;
    needs_attention: number;
    orphaned_records: number;
  };
  accounts: AccountAudit[];
  orphaned_data: OrphanedData;
  auto_fix_script: string;
}

export function useSaaSAudit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const runAudit = useMutation({
    mutationFn: async (accountId?: string): Promise<AuditSummary> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('saas-consistency-audit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: accountId ? { accountId } : undefined,
      });

      if (error) throw error;
      return data as AuditSummary;
    },
    onSuccess: () => {
      toast({
        title: 'Audit Complete',
        description: 'SaaS consistency audit has finished successfully.',
      });
    },
    onError: (error) => {
      console.error('[useSaaSAudit] Error running audit:', error);
      toast({
        title: 'Audit Failed',
        description: error.message || 'Failed to run audit',
        variant: 'destructive',
      });
    },
  });

  const repairAccount = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call the repair function via RPC (using type assertion for new function)
      const { data, error } = await supabase.rpc('repair_account_full' as any, {
        target_user_id: userId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      toast({
        title: 'Account Repaired',
        description: 'Missing configurations have been created.',
      });
      queryClient.invalidateQueries({ queryKey: ['account-health'] });
      queryClient.invalidateQueries({ queryKey: ['saas-audit'] });
    },
    onError: (error) => {
      console.error('[useSaaSAudit] Error repairing account:', error);
      toast({
        title: 'Repair Failed',
        description: error.message || 'Failed to repair account',
        variant: 'destructive',
      });
    },
  });

  const cleanupOrphans = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Using type assertion for new function not yet in types
      const { data, error } = await supabase.rpc('cleanup_orphaned_data' as any);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Cleanup Complete',
        description: `Orphaned data has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['saas-audit'] });
    },
    onError: (error) => {
      console.error('[useSaaSAudit] Error cleaning up orphans:', error);
      toast({
        title: 'Cleanup Failed',
        description: error.message || 'Failed to cleanup orphaned data',
        variant: 'destructive',
      });
    },
  });

  const fixTwcOptions = useMutation({
    mutationFn: async () => {
      // Using type assertion for new function not yet in types
      const { data, error } = await supabase.rpc('fix_twc_required_options' as any);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'TWC Options Fixed',
        description: 'TWC heading_type options have been corrected.',
      });
    },
    onError: (error) => {
      console.error('[useSaaSAudit] Error fixing TWC options:', error);
      toast({
        title: 'Fix Failed',
        description: error.message || 'Failed to fix TWC options',
        variant: 'destructive',
      });
    },
  });

  const downloadReport = (audit: AuditSummary) => {
    const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saas-audit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    runAudit,
    repairAccount,
    cleanupOrphans,
    fixTwcOptions,
    downloadReport,
  };
}
