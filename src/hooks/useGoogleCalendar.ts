
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type GoogleCalendarIntegration = Tables<"google_calendar_integrations">;

export const useGoogleCalendarIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
    queryKey: ["google-calendar-integration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("google_calendar_integrations")
        .select("*")
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use the actual Supabase URL for the redirect
      const redirectUrl = `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/google-oauth-callback`;
      const scope = "https://www.googleapis.com/auth/calendar";
      const clientId = "1080600437939-9ct52n3q0qj362tgq2je28uhp9bof29p.apps.googleusercontent.com";
      
      const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.id}`;
      
      console.log('Opening Google auth URL:', authUrl);
      
      // Open popup window
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
      
      if (!popup) {
        throw new Error('Failed to open authentication window. Please allow popups for this site.');
      }
      
      return new Promise((resolve, reject) => {
        const messageListener = (event: MessageEvent) => {
          console.log('Received message:', event.data);
          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            window.removeEventListener('message', messageListener);
            queryClient.invalidateQueries({ queryKey: ["google-calendar-integration"] });
            resolve(undefined);
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            window.removeEventListener('message', messageListener);
            reject(new Error(event.data.error));
          }
        };
        
        window.addEventListener('message', messageListener);
        
        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Connected",
        description: "Google Calendar has been successfully connected.",
      });
    },
    onError: (error) => {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!integration) throw new Error("No integration found");
      
      const { error } = await supabase
        .from("google_calendar_integrations")
        .delete()
        .eq("id", integration.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-integration"] });
      toast({
        title: "Disconnected",
        description: "Google Calendar integration has been disconnected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Disconnection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSyncMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!integration) throw new Error("No integration found");
      
      const { error } = await supabase
        .from("google_calendar_integrations")
        .update({ sync_enabled: enabled })
        .eq("id", integration.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-integration"] });
      toast({
        title: "Sync Updated",
        description: "Calendar sync settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    integration,
    isLoading,
    isConnected: !!integration,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    toggleSync: toggleSyncMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
  };
};

export const useGoogleCalendarSync = () => {
  const { toast } = useToast();

  const syncToGoogle = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data, error } = await supabase.functions.invoke("sync-to-google-calendar", {
        body: { appointmentId, action: "create" }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Synced to Google",
        description: "Appointment has been synced to Google Calendar.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncFromGoogle = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-from-google-calendar");
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Synced from Google",
        description: "Events have been synced from Google Calendar.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
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
