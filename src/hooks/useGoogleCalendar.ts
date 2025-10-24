
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
  created_at: string;
  updated_at: string;
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
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as GoogleCalendarIntegration;
    },
  });

  const connect = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Real Google OAuth flow - opens in popup
      const clientId = '1080600437939-i9nb8ctb5dqvu59dvvtor9j6mt2n02ve.apps.googleusercontent.com';
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      const redirectUri = `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/google-oauth-callback`;
      const scope = 'https://www.googleapis.com/auth/calendar';
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.id}`;

      // Open OAuth in popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        googleAuthUrl,
        'Google Calendar Authorization',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

      // Listen for messages from the popup
      return new Promise((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          // Verify origin for security
          if (event.origin !== 'https://ldgrcodffsalkevafbkb.supabase.co') return;

          if (event.data.type === 'google-auth-success') {
            window.removeEventListener('message', messageHandler);
            resolve(event.data);
          } else if (event.data.type === 'google-auth-error') {
            window.removeEventListener('message', messageHandler);
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', messageHandler);

        // Check if popup was closed without completing auth
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);
      });
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
    isLoading,
    isConnected: !!integration,
    connect: connect.mutate,
    disconnect: disconnect.mutate,
    toggleSync: toggleSync.mutate,
    isConnecting: connect.isPending,
    isDisconnecting: disconnect.isPending,
  };
};

export const useGoogleCalendarSync = () => {
  const { toast } = useToast();

  const syncToGoogle = useMutation({
    mutationFn: async (appointmentId: string) => {
      // Call Supabase edge function to sync to Google Calendar
      const { data, error } = await supabase.functions.invoke('sync-to-google-calendar', {
        body: { appointmentId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
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
      // Call Supabase edge function to sync from Google Calendar
      const { data, error } = await supabase.functions.invoke('sync-from-google-calendar');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Events synced from Google Calendar",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to sync from Google Calendar",
        variant: "destructive",
      });
    },
  });

  return {
    syncToGoogle: syncToGoogle.mutate,
    syncFromGoogle: syncFromGoogle.mutate,
    isSyncingToGoogle: syncToGoogle.isPending,
    isSyncingFromGoogle: syncFromGoogle.isPending,
  };
};
