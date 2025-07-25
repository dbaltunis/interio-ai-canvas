import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caldavService, CalDAVAccount, CalDAVCalendar } from "@/services/caldavService";
import { useToast } from "@/hooks/use-toast";

export const useCalDAVAccounts = () => {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['caldav-accounts'],
    queryFn: () => caldavService.getAccounts(),
  });

  return {
    accounts: accounts || [],
    isLoading,
  };
};

export const useCalDAVCalendars = (accountId: string | null) => {
  const { data: calendars, isLoading } = useQuery({
    queryKey: ['caldav-calendars', accountId],
    queryFn: () => accountId ? caldavService.getCalendars(accountId) : Promise.resolve([]),
    enabled: !!accountId,
  });

  return {
    calendars: calendars || [],
    isLoading,
  };
};

export const useAddCalDAVAccount = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData: {
      account_name: string;
      email: string;
      username: string;
      password: string;
      server_url?: string;
    }) => {
      return await caldavService.addAccount(accountData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caldav-accounts'] });
      toast({
        title: "Account Added",
        description: "CalDAV account has been successfully connected.",
      });
    },
    onError: (error: Error) => {
      console.error('Error adding CalDAV account:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to CalDAV server. Please check your credentials.",
        variant: "destructive",
      });
    },
  });
};

export const useTestCalDAVConnection = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: CalDAVAccount) => {
      return await caldavService.testConnection(account);
    },
    onSuccess: (success) => {
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? "CalDAV server connection is working properly."
          : "Failed to connect to CalDAV server.",
        variant: success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      console.error('Error testing CalDAV connection:', error);
      toast({
        title: "Connection Test Failed",
        description: "Unable to test connection. Please check your settings.",
        variant: "destructive",
      });
    },
  });
};

export const useSyncCalDAVCalendar = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calendarId: string) => {
      return await caldavService.syncEventsFromCalDAV(calendarId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Sync Completed",
        description: "Calendar events have been synchronized.",
      });
    },
    onError: (error: Error) => {
      console.error('Error syncing calendar:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync calendar events.",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveCalDAVAccount = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      return await caldavService.removeAccount(accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caldav-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['caldav-calendars'] });
      toast({
        title: "Account Removed",
        description: "CalDAV account has been disconnected.",
      });
    },
    onError: (error: Error) => {
      console.error('Error removing CalDAV account:', error);
      toast({
        title: "Error",
        description: "Failed to remove CalDAV account.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCalDAVAccount = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, updates }: { accountId: string; updates: Partial<CalDAVAccount> }) => {
      return await caldavService.updateAccount(accountId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caldav-accounts'] });
      toast({
        title: "Account Updated",
        description: "CalDAV account settings have been saved.",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating CalDAV account:', error);
      toast({
        title: "Error",
        description: "Failed to update CalDAV account.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCalDAVCalendar = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ calendarId, updates }: { calendarId: string; updates: Partial<CalDAVCalendar> }) => {
      return await caldavService.updateCalendar(calendarId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caldav-calendars'] });
      toast({
        title: "Calendar Updated",
        description: "Calendar settings have been saved.",
      });
    },
    onError: (error: Error) => {
      console.error('Error updating CalDAV calendar:', error);
      toast({
        title: "Error",
        description: "Failed to update calendar settings.",
        variant: "destructive",
      });
    },
  });
};