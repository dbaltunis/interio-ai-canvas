import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NylasCalendarIntegration {
  id: string;
  user_id: string;
  grant_id: string;
  email: string;
  provider: string; // 'google' | 'microsoft' | 'unknown'
  sync_enabled: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  configuration: any;
}

export const useNylasCalendarIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
    queryKey: ['nylas-calendar-integration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'nylas_calendar')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      const credentials = data.api_credentials as any;
      const config = data.configuration as any;

      return {
        id: data.id,
        user_id: data.user_id,
        grant_id: credentials?.grant_id || '',
        email: credentials?.email || '',
        provider: credentials?.provider || 'unknown',
        sync_enabled: config?.sync_enabled || false,
        last_sync: config?.last_sync || data.last_sync,
        created_at: data.created_at,
        updated_at: data.updated_at,
        active: data.active || false,
        configuration: config,
      } as NylasCalendarIntegration;
    },
  });

  // Fallback to account owner's integration
  const { data: accountOwnerIntegration } = useQuery({
    queryKey: ['nylas-calendar-integration-owner'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || integration) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('parent_account_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.parent_account_id) return null;

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', profile.parent_account_id)
        .eq('integration_type', 'nylas_calendar')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      const credentials = data.api_credentials as any;
      const config = data.configuration as any;

      return {
        id: data.id,
        user_id: data.user_id,
        grant_id: credentials?.grant_id || '',
        email: credentials?.email || '',
        provider: credentials?.provider || 'unknown',
        sync_enabled: config?.sync_enabled || false,
        last_sync: config?.last_sync || data.last_sync,
        created_at: data.created_at,
        updated_at: data.updated_at,
        active: data.active || false,
        configuration: config,
      } as NylasCalendarIntegration;
    },
    enabled: !integration && !isLoading,
  });

  const connect = useMutation({
    mutationFn: async ({ provider, loginHint }: { provider?: string; loginHint?: string } = {}) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: urlData, error: urlError } = await supabase.functions.invoke('nylas-auth-url', {
        body: { userId: user.id, provider, loginHint }
      });

      if (urlError) {
        throw new Error(urlError.message || 'Failed to generate Nylas OAuth URL');
      }

      const nylasAuthUrl = urlData.authUrl;

      // Open popup for OAuth — open blank first to avoid Safari COOP blocking
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        'about:blank',
        'Nylas Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,popup=yes`
      );

      // If popup is blocked, redirect
      if (!popup || popup.closed) {
        window.location.href = nylasAuthUrl;
        return new Promise(() => {});
      }

      // Navigate after opening to avoid COOP issues
      popup.location.href = nylasAuthUrl;

      return new Promise((resolve, reject) => {
        let resolved = false;
        let checkClosedInterval: ReturnType<typeof setInterval>;
        let pollDatabaseInterval: ReturnType<typeof setInterval>;
        let closeGracePeriodTimeout: ReturnType<typeof setTimeout>;

        const cleanup = () => {
          window.removeEventListener('message', messageHandler);
          window.removeEventListener('storage', storageHandler);
          if (checkClosedInterval) clearInterval(checkClosedInterval);
          if (pollDatabaseInterval) clearInterval(pollDatabaseInterval);
          if (closeGracePeriodTimeout) clearTimeout(closeGracePeriodTimeout);
        };

        const handleSuccess = (source: string) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          resolve({ type: 'NYLAS_AUTH_SUCCESS', source });
        };

        const handleError = (error: string) => {
          if (resolved) return;
          resolved = true;
          cleanup();
          reject(new Error(error));
        };

        // Method 1: postMessage from popup
        const messageHandler = (event: MessageEvent) => {
          const isValidOrigin = event.origin.includes('supabase.co') ||
                                event.origin.includes('supabase.in') ||
                                event.origin === window.location.origin;
          if (!isValidOrigin) return;

          if (event.data?.type === 'NYLAS_AUTH_SUCCESS') {
            handleSuccess('postMessage');
          } else if (event.data?.type === 'NYLAS_AUTH_ERROR') {
            handleError(event.data.error || 'Authentication failed');
          }
        };

        // Method 2: localStorage fallback
        const storageHandler = (event: StorageEvent) => {
          if (event.key === 'nylas_calendar_auth_success' && event.newValue) {
            try {
              const data = JSON.parse(event.newValue);
              if (data.success) {
                handleSuccess('localStorage');
                try { localStorage.removeItem('nylas_calendar_auth_success'); } catch (_) {}
              }
            } catch (_) {}
          }
        };

        // Method 3: Poll database
        const checkDatabaseForConnection = async () => {
          if (resolved) return;
          try {
            const { data } = await supabase
              .from('integration_settings')
              .select('active, updated_at')
              .eq('user_id', user.id)
              .eq('integration_type', 'nylas_calendar')
              .single();

            if (data?.active) {
              const updatedAt = new Date(data.updated_at).getTime();
              if (Date.now() - updatedAt < 30000) {
                handleSuccess('database_poll');
              }
            }
          } catch (_) {}
        };

        window.addEventListener('message', messageHandler);
        window.addEventListener('storage', storageHandler);

        pollDatabaseInterval = setInterval(checkDatabaseForConnection, 2000);

        checkClosedInterval = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosedInterval);
            closeGracePeriodTimeout = setTimeout(async () => {
              if (resolved) return;
              try {
                const { data } = await supabase
                  .from('integration_settings')
                  .select('active, updated_at')
                  .eq('user_id', user.id)
                  .eq('integration_type', 'nylas_calendar')
                  .single();

                if (data?.active) {
                  const updatedAt = new Date(data.updated_at).getTime();
                  if (Date.now() - updatedAt < 60000) {
                    handleSuccess('final_database_check');
                    return;
                  }
                }
              } catch (_) {}
              handleError('Authentication cancelled');
            }, 3000);
          }
        }, 500);

        // 5 minute timeout
        setTimeout(() => {
          if (!resolved) handleError('Authentication timed out');
        }, 300000);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nylas-calendar-integration'] });
      toast({
        title: "Success",
        description: "Calendar connected via Nylas successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to connect calendar";
      const isUserCancelled = errorMessage.includes('cancelled') || errorMessage.includes('canceled');

      toast({
        title: isUserCancelled ? "Connection Cancelled" : "Connection Failed",
        description: isUserCancelled
          ? "You can try connecting again anytime."
          : "Please try again. If the issue persists, check your Nylas configuration.",
        variant: isUserCancelled ? "default" : "destructive",
      });
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Delete appointments imported from Nylas (have nylas_event_id, default consultation type)
      const { data: importedEvents } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', user.id)
        .not('nylas_event_id', 'is', null)
        .eq('appointment_type', 'consultation')
        .is('google_event_id', null)
        .is('outlook_event_id', null);

      if (importedEvents && importedEvents.length > 0) {
        const ids = importedEvents.map(e => e.id);
        await supabase
          .from('appointments')
          .delete()
          .in('id', ids);
      }

      // 2. Clear nylas_event_id from remaining appointments (user-created, pushed to Nylas)
      await supabase
        .from('appointments')
        .update({ nylas_event_id: null } as any)
        .eq('user_id', user.id)
        .not('nylas_event_id', 'is', null);

      // 3. Delete the integration setting
      const { error } = await supabase
        .from('integration_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_type', 'nylas_calendar');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nylas-calendar-integration'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Nylas calendar disconnected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect calendar",
        variant: "destructive",
      });
    },
  });

  const setupWebhook = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('nylas-setup-webhook', {
        body: { userId: user.id, action: 'create' }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['nylas-calendar-integration'] });
      toast({
        title: "Real-time Sync Enabled",
        description: "You'll now receive instant calendar updates via webhooks.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Webhook Setup Failed",
        description: error.message || "Could not enable real-time sync",
        variant: "destructive",
      });
    },
  });

  const webhookStatus = useQuery({
    queryKey: ['nylas-webhook-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { active: false };

      const { data, error } = await supabase.functions.invoke('nylas-setup-webhook', {
        body: { userId: user.id, action: 'status' }
      });
      if (error) return { active: false };
      return data || { active: false };
    },
    enabled: !!integration?.active,
    staleTime: 5 * 60 * 1000,
  });

  return {
    integration,
    accountOwnerIntegration,
    isLoading,
    isConnected: !!integration || !!accountOwnerIntegration,
    connect: connect.mutate,
    disconnect: disconnect.mutate,
    isConnecting: connect.isPending,
    isDisconnecting: disconnect.isPending,
    setupWebhook: setupWebhook.mutate,
    isSettingUpWebhook: setupWebhook.isPending,
    webhookActive: webhookStatus.data?.active || false,
  };
};

export const useNylasCalendarSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useNylasCalendarIntegration();

  const syncFromNylas = useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        return { synced: 0, updated: 0, skipped: 0 };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      try {
        const { data, error } = await supabase.functions.invoke('nylas-sync-calendar', {
          body: { userId: user.id, direction: 'from', days: 90 }
        });

        if (data && typeof data === 'object' && 'error' in data) {
          const errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
          if (errorMessage.includes('not found') || errorMessage.includes('not connected')) {
            return { synced: 0, updated: 0, skipped: 0 };
          }
          throw new Error(errorMessage);
        }

        if (error) {
          const errorMessage = error.message || '';
          if (errorMessage.includes('not found') || errorMessage.includes('not connected')) {
            return { synced: 0, updated: 0, skipped: 0 };
          }
          throw error;
        }

        return data;
      } catch (err: any) {
        const errorMessage = err?.message || '';
        if (errorMessage.includes('not found') || errorMessage.includes('not connected')) {
          return { synced: 0, updated: 0, skipped: 0 };
        }
        throw err;
      }
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
      await queryClient.refetchQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['nylas-calendar-integration'] });

      const syncedCount = data?.synced || 0;
      const updatedCount = data?.updated || 0;
      if (syncedCount > 0 || updatedCount > 0) {
        const parts = [];
        if (syncedCount > 0) parts.push(`${syncedCount} new`);
        if (updatedCount > 0) parts.push(`${updatedCount} updated`);
        toast({
          title: "Calendar Synced",
          description: `${parts.join(', ')} event${(syncedCount + updatedCount) > 1 ? 's' : ''} from Nylas`,
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || '';
      if (errorMessage.includes('not found') || errorMessage.includes('not connected')) return;

      toast({
        title: "Nylas Sync Error",
        description: errorMessage || "Failed to sync from calendar. Try reconnecting.",
        variant: "destructive",
      });
    },
  });

  const syncToNylas = useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        return { synced: 0, failed: 0 };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('nylas-sync-calendar', {
        body: { userId: user.id, direction: 'to', days: 90 }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      const syncedCount = data?.synced || 0;
      if (syncedCount > 0) {
        toast({
          title: "Sync Complete",
          description: `Pushed ${syncedCount} event${syncedCount > 1 ? 's' : ''} to calendar`,
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || '';
      if (errorMessage.includes('not found') || errorMessage.includes('not connected')) return;

      toast({
        title: "Sync Error",
        description: errorMessage || "Failed to push events to calendar",
        variant: "destructive",
      });
    },
  });

  return {
    syncFromNylas: syncFromNylas.mutate,
    syncToNylas: syncToNylas.mutate,
    isSyncingFromNylas: syncFromNylas.isPending,
    isSyncingToNylas: syncToNylas.isPending,
  };
};
