import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, Clock, RefreshCw } from "lucide-react";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { offlineQueueService } from "@/services/offlineQueueService";

export const OfflineIndicator = () => {
  const { isOnline, queueStatus } = useOfflineSupport();

  const handleProcessQueue = () => {
    offlineQueueService.processQueue();
  };

  if (isOnline && queueStatus.pendingOperations === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!isOnline && (
        <Alert className="mb-2 border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You're offline. New events will be queued and synced when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      {queueStatus.pendingOperations > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between text-blue-800">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100">
                {queueStatus.pendingOperations} pending
              </Badge>
              {isOnline ? 'Operations queued' : 'Will sync when online'}
            </div>
            {isOnline && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleProcessQueue}
                className="h-6 text-blue-600 hover:text-blue-800"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync Now
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};