import { useIsMutating } from '@tanstack/react-query';
import { Loader2, WifiOff, Cloud } from 'lucide-react';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { cn } from '@/lib/utils';

export const SyncIndicator = () => {
  const isMutating = useIsMutating(); // Only track mutations (saves), not fetches
  const { isOnline, queueStatus } = useOfflineSupport();
  
  const hasPendingOperations = queueStatus.pendingOperations > 0;
  const isActivelySaving = isMutating > 0;

  // Only show for meaningful states:
  // 1. User is offline
  // 2. There are pending offline operations
  // 3. Actively saving data (mutations)
  if (isOnline && !hasPendingOperations && !isActivelySaving) {
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
      
      {isOnline && isActivelySaving && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span className="text-muted-foreground">Saving...</span>
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
