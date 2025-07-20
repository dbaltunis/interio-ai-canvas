
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

// Mock data store
let mockIntegration: GoogleCalendarIntegration | null = null;

export const useGoogleCalendarIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
    queryKey: ['google-calendar-integration'],
    queryFn: async () => {
      // Mock implementation
      return mockIntegration;
    },
  });

  const connect = useMutation({
    mutationFn: async () => {
      // Mock implementation
      mockIntegration = {
        id: 'integration-1',
        user_id: 'mock-user',
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        calendar_id: 'mock-calendar',
        sync_enabled: true,
        token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockIntegration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      toast({
        title: "Success",
        description: "Google Calendar connected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive",
      });
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      // Mock implementation
      mockIntegration = null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-integration'] });
      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    },
  });

  const toggleSync = useMutation({
    mutationFn: async (enabled: boolean) => {
      // Mock implementation
      if (mockIntegration) {
        mockIntegration.sync_enabled = enabled;
        mockIntegration.updated_at = new Date().toISOString();
      }
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
      // Mock implementation
      console.log('Mock sync to Google:', appointmentId);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event synced to Google Calendar",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to sync to Google Calendar",
        variant: "destructive",
      });
    },
  });

  const syncFromGoogle = useMutation({
    mutationFn: async () => {
      // Mock implementation
      console.log('Mock sync from Google');
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Events synced from Google Calendar",
      });
    },
    onError: (error) => {
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
