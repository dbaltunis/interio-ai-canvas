
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
      // Start OAuth flow
      const redirectUrl = `${window.location.origin}/auth/google/callback`;
      const scope = "https://www.googleapis.com/auth/calendar";
      const clientId = "YOUR_GOOGLE_CLIENT_ID"; // This should be from environment
      
      const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      window.location.href = authUrl;
    },
    onError: (error) => {
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
