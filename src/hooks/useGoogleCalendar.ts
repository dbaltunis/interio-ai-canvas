
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoogleCalendarIntegration {
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

export const useGoogleCalendarIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
    queryKey: ['google-calendar-integration'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'google_calendar')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      // Map integration_settings to GoogleCalendarIntegration format
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
      } as GoogleCalendarIntegration;
    },
  });

  // Fetch account owner's integration if user is not owner
  const { data: accountOwnerIntegration } = useQuery({
    queryKey: ['google-calendar-integration-owner'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || integration) return null;

      // Get account owner
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
        .eq('integration_type', 'google_calendar')
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
      } as GoogleCalendarIntegration;
    },
    enabled: !integration && !isLoading,
  });

  const connect = useMutation({
    mutationFn: async ({ useRedirect = false }: { useRedirect?: boolean } = {}) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: urlData, error: urlError } = await supabase.functions.invoke('google-oauth-initiate', {
        body: { userId: user.id }
      });

      if (urlError) {
        throw new Error(urlError.message || 'Failed to generate OAuth URL');
      }

      const googleAuthUrl = urlData.authUrl;

      // Try popup first, with automatic redirect fallback if blocked
      if (!useRedirect) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          googleAuthUrl,
          'Google Calendar Authorization',
          `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
        );

        // If popup is blocked, automatically redirect instead
        if (!popup || popup.closed) {
          window.location.href = googleAuthUrl;
          return new Promise(() => {}); // Never resolves as page redirects
        }

        // Listen for messages from the popup with multiple fallback methods
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
            console.log(`Google Calendar auth success detected via ${source}`);
            cleanup();
            resolve({ type: 'GOOGLE_AUTH_SUCCESS', source });
          };
          
          const handleError = (error: string) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            reject(new Error(error));
          };
          
          // Method 1: Listen for postMessage from popup
          const messageHandler = (event: MessageEvent) => {
            // Accept messages from Supabase origins (relaxed check for cross-origin popups)
            const isValidOrigin = event.origin.includes('supabase.co') || 
                                  event.origin.includes('supabase.in') ||
                                  event.origin === window.location.origin;
            
            if (!isValidOrigin) {
              console.log('Ignoring message from origin:', event.origin);
              return;
            }

            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
              handleSuccess('postMessage');
            } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
              handleError(event.data.error || 'Authentication failed');
            }
          };

          // Method 2: Listen for localStorage changes (fallback for same-origin)
          const storageHandler = (event: StorageEvent) => {
            if (event.key === 'google_calendar_auth_success' && event.newValue) {
              try {
                const data = JSON.parse(event.newValue);
                if (data.success) {
                  handleSuccess('localStorage');
                  // Clean up the storage key
                  try { localStorage.removeItem('google_calendar_auth_success'); } catch(e) {}
                }
              } catch(e) {
                console.log('Failed to parse storage event:', e);
              }
            }
          };
          
          // Method 3: Poll database for connection status (ultimate fallback)
          const checkDatabaseForConnection = async () => {
            if (resolved) return;
            try {
              const { data } = await supabase
                .from('integration_settings')
                .select('active, updated_at')
                .eq('user_id', user.id)
                .eq('integration_type', 'google_calendar')
                .single();
              
              if (data?.active) {
                // Check if this is a recent update (within last 30 seconds)
                const updatedAt = new Date(data.updated_at).getTime();
                const now = Date.now();
                if (now - updatedAt < 30000) {
                  handleSuccess('database_poll');
                }
              }
            } catch(e) {
              // Ignore polling errors
            }
          };

          window.addEventListener('message', messageHandler);
          window.addEventListener('storage', storageHandler);
          
          // Start polling database every 2 seconds
          pollDatabaseInterval = setInterval(checkDatabaseForConnection, 2000);

          // Check if popup is closed
          checkClosedInterval = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosedInterval);
              
              // Give a grace period for other detection methods to work
              // The popup might have closed after successful auth
              closeGracePeriodTimeout = setTimeout(async () => {
                if (resolved) return;
                
                // One final database check before giving up
                try {
                  const { data } = await supabase
                    .from('integration_settings')
                    .select('active, updated_at')
                    .eq('user_id', user.id)
                    .eq('integration_type', 'google_calendar')
                    .single();
                  
                  if (data?.active) {
                    const updatedAt = new Date(data.updated_at).getTime();
                    const now = Date.now();
                    // If updated in last 60 seconds, consider it a success
                    if (now - updatedAt < 60000) {
                      handleSuccess('final_database_check');
                      return;
                    }
                  }
                } catch(e) {
                  // Ignore
                }
                
                handleError('Authentication cancelled');
              }, 3000); // 3 second grace period
            }
          }, 500);
          
          // Overall timeout after 5 minutes
          setTimeout(() => {
            if (!resolved) {
              handleError('Authentication timed out');
            }
          }, 300000);
        });
      } else {
        // Direct redirect mode
        window.location.href = googleAuthUrl;
        return new Promise(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      toast({
        title: "Success",
        description: "Google Calendar connected successfully",
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Failed to connect Google Calendar";
      const isUserCancelled = errorMessage.includes('cancelled') || errorMessage.includes('canceled');
      
      toast({
        title: isUserCancelled ? "Connection Cancelled" : "Connection Failed",
        description: isUserCancelled 
          ? "You can try connecting again anytime."
          : "Please try again. If you see a security warning, click 'Advanced' → 'Go to InterioApp' to proceed.",
        variant: isUserCancelled ? "default" : "destructive",
      });
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Step 1: Find the integration record to get integration_id
      const { data: integration } = await supabase
        .from('integration_settings')
        .select('id')
        .eq('user_id', user.id)
        .eq('integration_type', 'google_calendar')
        .maybeSingle();

      // Step 2: Get sync records to identify events pulled FROM Google
      // Table uses integration_id (not user_id) as per schema
      if (integration?.id) {
        const { data: syncRecords } = await supabase
          .from('google_calendar_sync_events' as any)
          .select('appointment_id, sync_direction')
          .eq('integration_id', integration.id);

        // Step 3: Delete appointments that were pulled FROM Google (not user-created)
        const fromGoogleIds = (syncRecords || [])
          .filter((r: any) => r.sync_direction === 'from_google')
          .map((r: any) => r.appointment_id);

        if (fromGoogleIds.length > 0) {
          await supabase
            .from('appointments')
            .delete()
            .in('id', fromGoogleIds);
        }
      }

      // Step 4: Clear google_event_id from remaining appointments (user-created events pushed to Google)
      await supabase
        .from('appointments')
        .update({ google_event_id: null } as any)
        .eq('user_id', user.id)
        .not('google_event_id', 'is', null);

      // Step 5: Delete the integration (CASCADE will clean up sync records)
      const { error } = await supabase
        .from('integration_settings')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_type', 'google_calendar');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.refetchQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Google Calendar disconnected. Synced events have been cleaned up.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    },
  });

  const toggleSync = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('integration_settings')
        .update({ 
          configuration: { sync_enabled: enabled },
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('integration_type', 'google_calendar');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
    },
  });

  return {
    integration,
    accountOwnerIntegration,
    isLoading,
    isConnected: !!integration || !!accountOwnerIntegration,
    connect: connect.mutate,
    disconnect: disconnect.mutate,
    toggleSync: toggleSync.mutate,
    isConnecting: connect.isPending,
    isDisconnecting: disconnect.isPending,
  };
};

export const useGoogleCalendarSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useGoogleCalendarIntegration();

  const syncToGoogle = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-to-google-calendar', {
        body: { appointmentId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success",
        description: "Event synced to Google Calendar",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to sync to Google Calendar",
        variant: "destructive",
      });
    },
  });

  const syncFromGoogle = useMutation({
    mutationFn: async () => {
      // Don't call the function if not connected
      if (!isConnected) {
        console.log('Google Calendar not connected, skipping sync');
        return { imported: 0, skipped: 0 };
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('sync-from-google-calendar');
        
        // First check if the response data contains an error (Supabase functions return errors in data)
        if (data && typeof data === 'object' && 'error' in data) {
          const responseError = (data as any).error;
          const errorMessage = typeof responseError === 'string' ? responseError : JSON.stringify(responseError);
          
          // Check if error is about Google Calendar not being connected or needing reconnection
          if (errorMessage.includes('Google Calendar not connected') || 
              errorMessage.includes('not connected') ||
              (data as any).reconnect_required) {
            // Invalidate integration query so UI updates to show disconnected state
            queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
            if ((data as any).reconnect_required) {
              toast({
                title: "Calendar Disconnected",
                description: "Your Google Calendar token expired. Please reconnect in Settings.",
                variant: "destructive",
              });
            }
            return { imported: 0, skipped: 0 };
          }
          // If it's a different error, throw it
          throw new Error(errorMessage);
        }
        
        // Check network/connection errors (including 500 errors)
        if (error) {
          // When edge function returns non-2xx, supabase puts response body in error.context
          // Try to parse reconnect_required from the error context
          let errorBody: any = null;
          try {
            if (error.context && typeof error.context === 'object') {
              errorBody = error.context;
            }
          } catch {}
          
          // Check for reconnect_required in error body
          if (errorBody?.reconnect_required || errorBody?.error?.includes?.('reconnect') || errorBody?.error?.includes?.('token expired')) {
            queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
            toast({
              title: "Calendar Disconnected",
              description: "Your Google Calendar token expired. Please reconnect in Settings.",
              variant: "destructive",
            });
            return { imported: 0, skipped: 0 };
          }

          const errorMessage = error.message || '';
          const errorString = JSON.stringify(error);
          
          // Silently handle "not connected" errors
          if (errorMessage.includes('Google Calendar not connected') || 
              errorMessage.includes('not connected') ||
              errorString.includes('Google Calendar not connected') ||
              errorString.includes('not connected')) {
            return { imported: 0, skipped: 0 };
          }

          // Handle token refresh failures gracefully
          if (errorMessage.includes('refresh') || errorMessage.includes('token') ||
              errorString.includes('refresh') || errorString.includes('Failed to refresh')) {
            queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
            toast({
              title: "Calendar Disconnected",
              description: "Your Google Calendar token is invalid. Please reconnect in Settings.",
              variant: "destructive",
            });
            return { imported: 0, skipped: 0 };
          }
          
          // For any other 500 errors, show toast but don't crash
          console.error('Google Calendar sync error:', errorMessage || errorString);
          throw new Error(errorMessage || 'Google Calendar sync failed. Try reconnecting your calendar.');
        }
        
        return data;
      } catch (err: any) {
        const errorMessage = err?.message || err?.error || JSON.stringify(err) || '';
        
        // Silently handle "not connected" and token errors
        if (errorMessage.includes('Google Calendar not connected') || 
            errorMessage.includes('not connected') ||
            errorMessage.includes('refresh') ||
            errorMessage.includes('token')) {
          return { imported: 0, skipped: 0 };
        }
        
        // Re-throw other errors (will be caught by onError)
        throw err;
      }
    },
    onSuccess: async (data) => {
      // Aggressive query invalidation and refetch
      await queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
      await queryClient.refetchQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      
      // Only show toast if events were actually imported
      const importedCount = data?.imported || 0;
      if (importedCount > 0) {
        toast({
          title: "Calendar Synced",
          description: `Imported ${importedCount} new event${importedCount > 1 ? 's' : ''} from Google Calendar`,
          importance: 'important',
        });
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || '';

      // Silently ignore "not connected" and token errors (already handled above)
      if (errorMessage.includes('Google Calendar not connected') ||
          errorMessage.includes('not connected') ||
          errorMessage.includes('refresh') ||
          errorMessage.includes('token')) {
        return;
      }

      // Show other errors as toast (not crash)
      toast({
        title: "Google Calendar Sync Error",
        description: errorMessage || "Failed to sync from Google Calendar. Try reconnecting.",
        variant: "destructive",
      });
    },
  });

  const syncAllToGoogle = useMutation({
    mutationFn: async () => {
      const { data: appointments, error: fetchError } = await supabase
        .from('appointments')
        .select('id, google_event_id')
        .is('google_event_id', null);

      if (fetchError) throw fetchError;

      const results = { success: 0, failed: 0 };
      
      for (const appointment of appointments || []) {
        try {
          const { error } = await supabase.functions.invoke('sync-to-google-calendar', {
            body: { appointmentId: appointment.id }
          });
          if (error) {
            results.failed++;
          } else {
            results.success++;
          }
        } catch (error) {
          results.failed++;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Batch Sync Complete",
        description: `Synced ${results.success} appointments. ${results.failed > 0 ? `${results.failed} failed.` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to batch sync appointments",
        variant: "destructive",
      });
    },
  });

  return {
    syncToGoogle: syncToGoogle.mutate,
    syncFromGoogle: syncFromGoogle.mutate,
    syncAllToGoogle: syncAllToGoogle.mutate,
    isSyncingToGoogle: syncToGoogle.isPending,
    isSyncingFromGoogle: syncFromGoogle.isPending,
    isSyncingAll: syncAllToGoogle.isPending,
  };
};
