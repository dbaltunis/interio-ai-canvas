import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle, XCircle, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useCalDAVAccounts } from "@/hooks/useCalDAV";
import { backgroundSyncService } from "@/services/backgroundSyncService";
import { formatDistanceToNow } from "date-fns";

export const CalendarStatusIndicator = () => {
  const { accounts } = useCalDAVAccounts();
  const [syncStatus, setSyncStatus] = useState(backgroundSyncService.getSyncStatus());
  const [isForceSync, setIsForceSync] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(backgroundSyncService.getSyncStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleForceSync = async () => {
    setIsForceSync(true);
    try {
      await backgroundSyncService.forceSyncAll();
    } finally {
      setIsForceSync(false);
    }
  };

  const activeAccounts = accounts.filter(account => account.active && account.sync_enabled);
  const totalAccounts = accounts.length;
  
  const getStatusColor = () => {
    if (!syncStatus.isOnline) return "destructive";
    if (activeAccounts.length === 0) return "secondary";
    return "default";
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return "Offline";
    if (activeAccounts.length === 0) return "No sync";
    if (syncStatus.isRunning) return "Syncing";
    return "Ready";
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return WifiOff;
    if (activeAccounts.length === 0) return XCircle;
    if (syncStatus.isRunning) return Clock;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <StatusIcon className="w-4 h-4 mr-1" />
          <Badge variant={getStatusColor()} className="text-xs">
            {getStatusText()}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar Sync Status
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleForceSync}
              disabled={isForceSync || !syncStatus.isOnline}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isForceSync ? 'animate-spin' : ''}`} />
              {isForceSync ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network Status</span>
              <div className="flex items-center gap-1">
                {syncStatus.isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span className="text-sm text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connected Accounts</span>
              <Badge variant="outline">
                {activeAccounts.length}/{totalAccounts}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Background Sync</span>
              <div className="flex items-center gap-1">
                {syncStatus.isRunning ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span className="text-sm text-red-600">Inactive</span>
                  </>
                )}
              </div>
            </div>

            {syncStatus.nextSyncIn && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Sync</span>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(Date.now() + syncStatus.nextSyncIn), { 
                    addSuffix: true 
                  })}
                </span>
              </div>
            )}
          </div>

          {activeAccounts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="text-sm font-medium">Active Accounts</span>
                {activeAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between text-xs">
                    <span className="truncate">{account.account_name}</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {account.last_sync_at && (
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(account.last_sync_at), { 
                            addSuffix: true 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {totalAccounts === 0 && (
            <>
              <Separator />
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  No calendar accounts connected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Go to Settings → Calendar to add accounts
                </p>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};