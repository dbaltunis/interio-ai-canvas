import { useEffect, useState } from "react";
import { backgroundSyncService } from "@/services/backgroundSyncService";

export const useBackgroundSync = () => {
  const [syncStatus, setSyncStatus] = useState(backgroundSyncService.getSyncStatus());

  useEffect(() => {
    // Update sync status every second
    const interval = setInterval(() => {
      setSyncStatus(backgroundSyncService.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const forceSyncAll = async () => {
    await backgroundSyncService.forceSyncAll();
  };

  const syncSpecificCalendar = async (calendarId: string) => {
    await backgroundSyncService.syncSpecificCalendar(calendarId);
  };

  const startSync = () => {
    backgroundSyncService.startPeriodicSync();
  };

  const stopSync = () => {
    backgroundSyncService.stopPeriodicSync();
  };

  return {
    syncStatus,
    forceSyncAll,
    syncSpecificCalendar,
    startSync,
    stopSync,
  };
};