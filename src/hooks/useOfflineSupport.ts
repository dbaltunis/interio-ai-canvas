import { useState, useEffect } from "react";
import { offlineQueueService } from "@/services/offlineQueueService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStatus, setQueueStatus] = useState(offlineQueueService.getQueueStatus());
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Invalidate queries when back online to refresh data
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['caldav-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['caldav-calendars'] });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Update queue status periodically
    const interval = setInterval(() => {
      setQueueStatus(offlineQueueService.getQueueStatus());
    }, 1000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [queryClient]);

  const queueOfflineOperation = (type: 'create' | 'update' | 'delete', table: string, data: any) => {
    offlineQueueService.queueOperation(type, table, data);
    setQueueStatus(offlineQueueService.getQueueStatus());
  };

  const getCachedData = (type: 'appointments' | 'calendars' | 'accounts') => {
    return offlineQueueService.getCachedData(type);
  };

  const updateCache = (type: 'appointments' | 'calendars' | 'accounts', data: any[]) => {
    offlineQueueService.updateCache(type, data);
  };

  const isDataStale = (maxAgeMs?: number) => {
    return offlineQueueService.isDataStale(maxAgeMs);
  };

  return {
    isOnline,
    queueStatus,
    queueOfflineOperation,
    getCachedData,
    updateCache,
    isDataStale,
  };
};