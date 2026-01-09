import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Wrench, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import type { AccountHealth } from '@/hooks/useAccountHealth';

interface AccountHealthDetailsProps {
  account: AccountHealth;
}

export function AccountHealthDetails({ account }: AccountHealthDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fixingPermissions, setFixingPermissions] = useState(false);
  const [fixingSettings, setFixingSettings] = useState(false);
  const [fixingSequences, setFixingSequences] = useState(false);
  const [fixingStatuses, setFixingStatuses] = useState(false);

  const handleFixPermissions = async () => {
    setFixingPermissions(true);
    try {
      // Get all 77 permissions from a working account
      const { data: allPermissions, error: fetchError } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .limit(100);

      if (fetchError) throw fetchError;

      // Get unique permission names
      const uniquePermissions = [...new Set(allPermissions?.map(p => p.permission_name) || [])];

      // Insert missing permissions
      const { error: insertError } = await supabase
        .from('user_permissions')
        .upsert(
          uniquePermissions.map(permission => ({
            user_id: account.user_id,
            permission_name: permission,
          })),
          { onConflict: 'user_id,permission_name' }
        );

      if (insertError) throw insertError;

      toast({
        title: 'Permissions Fixed',
        description: `Added missing permissions for ${account.display_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['account-health'] });
    } catch (error) {
      console.error('Error fixing permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix permissions',
        variant: 'destructive',
      });
    } finally {
      setFixingPermissions(false);
    }
  };

  const handleFixSettings = async () => {
    setFixingSettings(true);
    try {
      // Create default business settings
      if (!account.metrics.has_business_settings) {
        const { error: bizError } = await supabase.from('business_settings').insert({
          user_id: account.user_id,
          measurement_units: 'mm',
          tax_type: 'GST',
          tax_rate: 15,
        });
        if (bizError && bizError.code !== '23505') throw bizError;
      }

      // Create default account settings
      if (!account.metrics.has_account_settings) {
        const { error: accError } = await supabase.from('account_settings').insert({
          account_owner_id: account.user_id,
          currency: 'USD',
          language: 'en',
        });
        if (accError && accError.code !== '23505') throw accError;
      }

      toast({
        title: 'Settings Fixed',
        description: `Created missing settings for ${account.display_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['account-health'] });
    } catch (error) {
      console.error('Error fixing settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix settings',
        variant: 'destructive',
      });
    } finally {
      setFixingSettings(false);
    }
  };

  const handleFixSequences = async () => {
    setFixingSequences(true);
    try {
      const sequenceTypes = ['job', 'quote', 'invoice', 'order', 'draft'];
      const prefixes: Record<string, string> = { job: 'JOB', quote: 'QTE', invoice: 'INV', order: 'ORD', draft: 'DFT' };

      for (const type of sequenceTypes) {
        const { error } = await supabase.from('number_sequences').insert({
          user_id: account.user_id,
          entity_type: type,
          prefix: prefixes[type],
          next_number: 1000,
          padding: 4,
        });
        if (error && error.code !== '23505') console.warn('Sequence insert warning:', error);
      }

      toast({
        title: 'Sequences Fixed',
        description: `Created missing number sequences for ${account.display_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['account-health'] });
    } catch (error) {
      console.error('Error fixing sequences:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix sequences',
        variant: 'destructive',
      });
    } finally {
      setFixingSequences(false);
    }
  };

  const handleFixStatuses = async () => {
    setFixingStatuses(true);
    try {
      const defaultStatuses = [
        { name: 'New', color: '#3B82F6', is_default: true, sort_order: 1, status_type: 'active' },
        { name: 'In Progress', color: '#F59E0B', is_default: false, sort_order: 2, status_type: 'active' },
        { name: 'Pending', color: '#8B5CF6', is_default: false, sort_order: 3, status_type: 'active' },
        { name: 'On Hold', color: '#6B7280', is_default: false, sort_order: 4, status_type: 'active' },
        { name: 'Completed', color: '#10B981', is_default: false, sort_order: 5, status_type: 'completed' },
        { name: 'Cancelled', color: '#EF4444', is_default: false, sort_order: 6, status_type: 'cancelled' },
      ];

      for (const status of defaultStatuses) {
        const { error } = await supabase.from('job_statuses').insert({
          user_id: account.user_id,
          ...status,
        });
        if (error && error.code !== '23505') console.warn('Status insert warning:', error);
      }

      toast({
        title: 'Statuses Fixed',
        description: `Created job statuses for ${account.display_name}`,
      });

      queryClient.invalidateQueries({ queryKey: ['account-health'] });
    } catch (error) {
      console.error('Error fixing statuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix statuses',
        variant: 'destructive',
      });
    } finally {
      setFixingStatuses(false);
    }
  };

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? (
      <CheckCircle className="w-4 h-4 text-emerald-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );

  return (
    <div className="p-4 space-y-4">
      {/* Issues */}
      {account.issues.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              Issues Found ({account.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {account.issues.map((issue, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Permissions */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Permissions</span>
              <StatusIcon ok={account.metrics.permission_count === account.metrics.expected_permissions} />
            </div>
            <div className="text-2xl font-bold">
              {account.metrics.permission_count}/{account.metrics.expected_permissions}
            </div>
            {account.metrics.permission_count < account.metrics.expected_permissions && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={handleFixPermissions}
                disabled={fixingPermissions}
              >
                {fixingPermissions ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Wrench className="w-4 h-4 mr-1" />
                )}
                Fix
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Settings</span>
              <StatusIcon ok={account.metrics.has_business_settings && account.metrics.has_account_settings} />
            </div>
            <div className="flex gap-2">
              <Badge variant={account.metrics.has_business_settings ? 'default' : 'destructive'}>
                Business
              </Badge>
              <Badge variant={account.metrics.has_account_settings ? 'default' : 'destructive'}>
                Account
              </Badge>
            </div>
            {(!account.metrics.has_business_settings || !account.metrics.has_account_settings) && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={handleFixSettings}
                disabled={fixingSettings}
              >
                {fixingSettings ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Wrench className="w-4 h-4 mr-1" />
                )}
                Fix
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sequences */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Sequences</span>
              <StatusIcon ok={account.metrics.sequence_count >= account.metrics.expected_sequences} />
            </div>
            <div className="text-2xl font-bold">
              {account.metrics.sequence_count}/{account.metrics.expected_sequences}
            </div>
            {account.metrics.sequence_count < account.metrics.expected_sequences && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={handleFixSequences}
                disabled={fixingSequences}
              >
                {fixingSequences ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Wrench className="w-4 h-4 mr-1" />
                )}
                Fix
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Job Statuses */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Job Statuses</span>
              <StatusIcon ok={account.metrics.job_status_count > 0} />
            </div>
            <div className="text-2xl font-bold">{account.metrics.job_status_count}</div>
            {account.metrics.job_status_count === 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={handleFixStatuses}
                disabled={fixingStatuses}
              >
                {fixingStatuses ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Wrench className="w-4 h-4 mr-1" />
                )}
                Fix
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Subscription</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={account.metrics.subscription_status === 'active' ? 'default' : 'secondary'}
                >
                  {account.metrics.subscription_status || 'No subscription'}
                </Badge>
                {account.metrics.stripe_subscription_id && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {account.metrics.stripe_subscription_id}
                  </span>
                )}
              </div>
            </div>
            {account.metrics.trial_ends_at && (
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Trial ends</span>
                <div className="text-sm font-medium">
                  {new Date(account.metrics.trial_ends_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
