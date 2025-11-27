import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Loader2, Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { cn } from '@/lib/utils';

export const SyncIndicator = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { isOnline, queueStatus } = useOfflineSupport();
  
  const isSyncing = isFetching > 0 || isMutating > 0;
  const hasPendingOperations = queueStatus.pendingOperations > 0;

  // Don't show anything if online and not syncing
  if (isOnline && !isSyncing && !hasPendingOperations) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur border rounded-lg shadow-lg text-xs">
      {!isOnline && (
        <>
          <WifiOff className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-muted-foreground">Offline</span>
        </>
      )}
      
      {isOnline && isSyncing && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-muted-foreground">Syncing...</span>
        </>
      )}
      
      {hasPendingOperations && (
        <>
          <Cloud className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-muted-foreground">
            {queueStatus.pendingOperations} pending
          </span>
        </>
      )}
    </div>
  );
};
