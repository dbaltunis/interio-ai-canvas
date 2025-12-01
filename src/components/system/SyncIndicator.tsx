import { WifiOff, Cloud } from 'lucide-react';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';

export const SyncIndicator = () => {
  const { isOnline, queueStatus } = useOfflineSupport();
  
  const hasPendingOperations = queueStatus.pendingOperations > 0;

  // Only show for meaningful states:
  // 1. User is offline
  // 2. There are pending offline operations
  if (isOnline && !hasPendingOperations) {
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
