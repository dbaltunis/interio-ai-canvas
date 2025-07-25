import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calDAVSyncService, SyncConflict, SyncResult } from "@/services/calDAVSyncService";
import { toast } from "sonner";

export const useTwoWaySync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calendarId: string): Promise<SyncResult> => {
      return await calDAVSyncService.performTwoWaySync(calendarId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["caldav-calendars"] });
      
      if (result.conflicts.length > 0) {
        toast.warning(`Sync completed with ${result.conflicts.length} conflicts that need resolution`);
      } else {
        toast.success(`Sync completed successfully. ${result.synced} changes applied.`);
      }
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
      }
    },
    onError: (error) => {
      toast.error("Sync failed: " + error.message);
    },
  });
};

export const useResolveConflict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conflict, 
      resolution 
    }: { 
      conflict: SyncConflict; 
      resolution: 'local' | 'remote' | 'merge';
    }) => {
      await calDAVSyncService.resolveConflict(conflict, resolution);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Conflict resolved successfully");
    },
    onError: (error) => {
      toast.error("Failed to resolve conflict: " + error.message);
    },
  });
};

export const useSyncStatus = (calendarId: string) => {
  return useQuery({
    queryKey: ["sync-status", calendarId],
    queryFn: async () => {
      // This would check if sync is in progress
      // For now, return a simple status
      return {
        isInProgress: false,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
};