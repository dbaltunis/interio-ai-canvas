
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

        // Listen for messages from the popup
        return new Promise((resolve, reject) => {
          const messageHandler = (event: MessageEvent) => {
            if (event.origin !== 'https://ldgrcodffsalkevafbkb.supabase.co') return;

            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
              window.removeEventListener('message', messageHandler);
              resolve(event.data);
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
              window.removeEventListener('message', messageHandler);
              reject(new Error(event.data.error || 'Authentication failed'));
            }
          };

          window.addEventListener('message', messageHandler);

          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageHandler);
              reject(new Error('Authentication cancelled'));
            }
          }, 1000);
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
      toast({
        title: "Error",
        description: error.message || "Failed to connect Google Calendar",
        variant: "destructive",
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
        .eq('integration_type', 'google_calendar');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully",
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
      const { data, error } = await supabase.functions.invoke('sync-from-google-calendar');
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Aggressive query invalidation and refetch
      await queryClient.invalidateQueries({ queryKey: ['appointments'], refetchType: 'all' });
      await queryClient.refetchQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      
      toast({
        title: "Success",
        description: data?.imported 
          ? `Imported ${data.imported} new events from Google Calendar`
          : "Synced from Google Calendar",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync from Google Calendar",
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
