import { createContext, useContext, useEffect, useState } from "react";
import { backgroundSyncService } from "@/services/backgroundSyncService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CalendarSyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
}

const CalendarSyncContext = createContext<CalendarSyncContextType>({
  isSyncing: false,
  lastSyncTime: null,
  syncErrors: [],
});

export const useCalendarSync = () => useContext(CalendarSyncContext);

export const CalendarSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeSync = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) return;

        // Start the background sync service
        console.log("[CalendarSync] Starting background sync service...");
        backgroundSyncService.startPeriodicSync();

        // Listen for sync status changes
        const checkSyncStatus = () => {
          if (!mounted) return;
          const status = backgroundSyncService.getSyncStatus();
          setIsSyncing(status.isRunning && status.isOnline);
          // Note: backgroundSyncService doesn't track lastSyncTime
          // We'll track it via the sync log subscription instead
        };

        // Check sync status every 30 seconds
        const interval = setInterval(checkSyncStatus, 30000);
        checkSyncStatus();

        // Subscribe to sync log for both errors and successes
        const syncLogSubscription = supabase
          .channel('caldav_sync_log_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'caldav_sync_log'
            },
            (payload) => {
              const log = payload.new as any;
              
              if (!log.success) {
                const errorMessage = `Sync failed: ${log.error_message || 'Unknown error'}`;
                setSyncErrors((prev) => [...prev.slice(-4), errorMessage]);
                
                toast({
                  title: "Calendar Sync Error",
                  description: errorMessage,
                  variant: "destructive",
                });
              } else {
                // Update last sync time on successful sync
                setLastSyncTime(new Date(log.synced_at));
              }
            }
          )
          .subscribe();

        return () => {
          mounted = false;
          clearInterval(interval);
          supabase.removeChannel(syncLogSubscription);
          backgroundSyncService.stopPeriodicSync();
        };
      } catch (error) {
        console.error("[CalendarSync] Failed to initialize:", error);
      }
    };

    initializeSync();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <CalendarSyncContext.Provider value={{ isSyncing, lastSyncTime, syncErrors }}>
      {children}
    </CalendarSyncContext.Provider>
  );
};
