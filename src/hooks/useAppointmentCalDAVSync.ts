import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { caldavService } from "@/services/caldavService";
import { useToast } from "@/hooks/use-toast";

export const useAppointmentCalDAVSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available CalDAV calendars for sync selection
  const { data: syncableCalendars, isLoading: loadingCalendars } = useQuery({
    queryKey: ['caldav-syncable-calendars'],
    queryFn: async () => {
      const accounts = await caldavService.getAccounts();
      const allCalendars = [];
      
      for (const account of accounts) {
        if (account.sync_enabled && account.active) {
          const calendars = await caldavService.getCalendars(account.id);
          allCalendars.push(
            ...calendars
              .filter(cal => cal.sync_enabled && !cal.read_only)
              .map(cal => ({
                ...cal,
                account_name: account.account_name,
                account_email: account.email,
              }))
          );
        }
      }
      
      return allCalendars;
    },
  });

  // Sync appointment to selected CalDAV calendars
  const syncAppointmentToCalDAV = useMutation({
    mutationFn: async ({ appointment, calendarIds }: { appointment: any; calendarIds: string[] }) => {
      for (const calendarId of calendarIds) {
        await caldavService.syncAppointmentToCalDAV(appointment, calendarId);
      }
    },
    onSuccess: () => {
      toast({
        title: "Sync Successful",
        description: "Appointment has been synced to your calendars.",
      });
    },
    onError: (error: Error) => {
      console.error('Error syncing appointment:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync appointment to calendars.",
        variant: "destructive",
      });
    },
  });

  // Auto-sync all calendars
  const autoSyncAllCalendars = useMutation({
    mutationFn: async () => {
      const accounts = await caldavService.getAccounts();
      const syncPromises = [];
      
      for (const account of accounts) {
        if (account.sync_enabled && account.active) {
          const calendars = await caldavService.getCalendars(account.id);
          for (const calendar of calendars) {
            if (calendar.sync_enabled) {
              syncPromises.push(caldavService.syncEventsFromCalDAV(calendar.id));
            }
          }
        }
      }
      
      await Promise.all(syncPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Sync Completed",
        description: "All connected calendars have been synchronized.",
      });
    },
    onError: (error: Error) => {
      console.error('Error during auto-sync:', error);
      toast({
        title: "Sync Failed",
        description: "Some calendars failed to sync. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    syncableCalendars: syncableCalendars || [],
    loadingCalendars,
    syncAppointmentToCalDAV,
    autoSyncAllCalendars,
  };
};