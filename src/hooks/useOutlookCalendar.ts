import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OutlookCalendarIntegration {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  calendar_id: string | null;
  sync_enabled: boolean;
  token_expires_at: string | null;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  configuration: any;
}

export const useOutlookCalendarIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
    queryKey: ['outlook-calendar-integration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'outlook_calendar')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      const credentials = data.api_credentials as any;
      const config = data.configuration as any;

      return {
        id: data.id,
        user_id: data.user_id,
        access_token: credentials?.access_token || '',
        refresh_token: credentials?.refresh_token || null,
        calendar_id: config?.calendar_id || null,
        sync_enabled: config?.sync_enabled || false,
        token_expires_at: credentials?.expires_at || null,
        last_sync: data.last_sync,
        created_at: data.created_at,
        updated_at: data.updated_at,
        active: data.active || false,
        configuration: config,
      } as OutlookCalendarIntegration;
    },
  });

  // Fallback to account owner's integration
  const { data: accountOwnerIntegration } = useQuery({
    queryKey: ['outlook-calendar-integration-owner'],
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
        .eq('integration_type', 'outlook_calendar')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      const credentials = data.api_credentials as any;
      const config = data.configuration as any;

      return {
        id: data.id,
        user_id: data.user_id,
        access_token: credentials?.access_token || '',
        refresh_token: credentials?.refresh_token || null,
        calendar_id: config?.calendar_id || null,
        sync_enabled: config?.sync_enabled || false,
        token_expires_at: credentials?.expires_at || null,
        last_sync: data.last_sync,
        created_at: data.created_at,
        updated_at: data.updated_at,
        active: data.active || false,
        configuration: config,
      } as OutlookCalendarIntegration;
    },
    enabled: !integration && !isLoading,
  });

  const connect = useMutation({
    mutationFn: async ({ useRedirect = false }: { useRedirect?: boolean } = {}) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: urlData, error: urlError } = await supabase.functions.invoke('outlook-oauth-initiate', {
        body: { userId: user.id }
      });

      if (urlError) {
        throw new Error(urlError.message || 'Failed to generate Outlook OAuth URL');
      }

      const outlookAuthUrl = urlData.authUrl;

      if (!useRedirect) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          outlookAuthUrl,
          'Outlook Calendar Authorization',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
        );

        if (!popup || popup.closed) {
          window.location.href = outlookAuthUrl;
          return new Promise(() => {});
        }

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
            console.log(`Outlook Calendar auth success detected via ${source}`);
            cleanup();
            resolve({ type: 'OUTLOOK_AUTH_SUCCESS', source });
          };

          const handleError = (error: string) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            reject(new Error(error));
          };

          const messageHandler = (event: MessageEvent) => {
            const isValidOrigin = event.origin.includes('supabase.co') ||
                                  event.origin.includes('supabase.in') ||
                                  event.origin === window.location.origin;

            if (!isValidOrigin) return;

            if (event.data?.type === 'OUTLOOK_AUTH_SUCCESS') {
              handleSuccess('postMessage');
            } else if (event.data?.type === 'OUTLOOK_AUTH_ERROR') {
              handleError(event.data.error || 'Authentication failed');
            }
          };

          const storageHandler = (event: StorageEvent) => {
            if (event.key === 'outlook_calendar_auth_success' && event.newValue) {
              try {
                const data = JSON.parse(event.newValue);
                if (data.success) {
                  handleSuccess('localStorage');
                  try { localStorage.removeItem('outlook_calendar_auth_success'); } catch(e) {}
                }
              } catch(e) {}
            }
          };

          const checkDatabaseForConnection = async () => {
            if (resolved) return;
            try {
              const { data } = await supabase
                .from('integration_settings')
                .select('active, updated_at')
                .eq('user_id', user.id)
                .eq('integration_type', 'outlook_calendar')
                .single();

              if (data?.active) {
                const updatedAt = new Date(data.updated_at).getTime();
                if (Date.now() - updatedAt < 30000) {
                  handleSuccess('database_poll');
                }
              }
            } catch(e) {}
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
                    .eq('integration_type', 'outlook_calendar')
                    .single();

                  if (data?.active) {
                    const updatedAt = new Date(data.updated_at).getTime();
                    if (Date.now() - updatedAt < 60000) {
                      handleSuccess('final_database_check');
                      return;
                    }
                  }
                } catch(e) {}
                handleError('Authentication cancelled');
              }, 3000);
            }
          }, 500);

          setTimeout(() => {
            if (!resolved) handleError('Authentication timed out');
          }, 300000);
        });
      } else {
        window.location.href = outlookAuthUrl;
        return new Promise(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlook-calendar-integration'] });
      toast({
        title: "Success",
        description: "Outlook Calendar connected successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to connect Outlook Calendar";
      const isUserCancelled = errorMessage.includes('cancelled') || errorMessage.includes('canceled');

      toast({
        title: isUserCancelled ? "Connection Cancelled" : "Connection Failed",
        description: isUserCancelled
          ? "You can try connecting again anytime."
          : "Please try again. Make sure you have the correct Microsoft account permissions.",
        variant: isUserCancelled ? "default" : "destructive",
      });
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('integration_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_type', 'outlook_calendar');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlook-calendar-integration'] });
      toast({
        title: "Success",
        description: "Outlook Calendar disconnected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect Outlook Calendar",
        variant: "destructive",
      });
    },
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
  };
};

export const useOutlookCalendarSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useOutlookCalendarIntegration();

  const syncToOutlook = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-to-outlook-calendar', {
        body: { appointmentId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Event synced to Outlook Calendar",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync to Outlook Calendar",
        variant: "destructive",
      });
    },
  });

  const syncFromOutlook = useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        return { imported: 0, skipped: 0 };
      }

      try {
        const { data, error } = await supabase.functions.invoke('sync-from-outlook-calendar');

        if (data && typeof data === 'object' && 'error' in data) {
          const responseError = (data as any).error;
          const errorMessage = typeof responseError === 'string' ? responseError : JSON.stringify(responseError);

          if (errorMessage.includes('Outlook Calendar not connected') ||
              errorMessage.includes('not connected')) {
            return { imported: 0, skipped: 0 };
          }
          throw new Error(errorMessage);
        }

        if (error) {
          const errorMessage = error.message || '';
          const errorString = JSON.stringify(error);

          if (errorMessage.includes('Outlook Calendar not connected') ||
              errorMessage.includes('not connected') ||
              errorString.includes('not connected')) {
            return { imported: 0, skipped: 0 };
          }

          if (error.status === 500 || (error as any).statusCode === 500) {
            console.error('Outlook Calendar sync returned 500:', errorMessage);
            throw new Error(errorMessage || 'Outlook Calendar sync failed (server error). Try reconnecting.');
          }

          throw error;
        }

        return data;
      } catch (err: any) {
        const errorMessage = err?.message || '';
        if (errorMessage.includes('not connected')) {
          return { imported: 0, skipped: 0 };
        }
        throw err;
      }
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
      await queryClient.refetchQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['outlook-calendar-integration'] });

      const importedCount = data?.imported || 0;
      if (importedCount > 0) {
        toast({
          title: "Calendar Synced",
          description: `Imported ${importedCount} new event${importedCount > 1 ? 's' : ''} from Outlook Calendar`,
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || '';
      if (errorMessage.includes('not connected')) return;

      toast({
        title: "Outlook Calendar Sync Error",
        description: errorMessage || "Failed to sync from Outlook Calendar. Try reconnecting.",
        variant: "destructive",
      });
    },
  });

  const syncAllToOutlook = useMutation({
    mutationFn: async () => {
      const { data: appointments, error: fetchError } = await supabase
        .from('appointments')
        .select('id, outlook_event_id')
        .is('outlook_event_id', null);

      if (fetchError) throw fetchError;

      const results = { success: 0, failed: 0 };

      for (const appointment of appointments || []) {
        try {
          const { error } = await supabase.functions.invoke('sync-to-outlook-calendar', {
            body: { appointmentId: appointment.id }
          });
          if (error) {
            results.failed++;
          } else {
            results.success++;
          }
        } catch {
          results.failed++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Batch Sync Complete",
        description: `Synced ${results.success} appointments to Outlook. ${results.failed > 0 ? `${results.failed} failed.` : ''}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to batch sync appointments to Outlook",
        variant: "destructive",
      });
    },
  });

  return {
    syncToOutlook: syncToOutlook.mutate,
    syncFromOutlook: syncFromOutlook.mutate,
    syncAllToOutlook: syncAllToOutlook.mutate,
    isSyncingToOutlook: syncToOutlook.isPending,
    isSyncingFromOutlook: syncFromOutlook.isPending,
    isSyncingAll: syncAllToOutlook.isPending,
  };
};
