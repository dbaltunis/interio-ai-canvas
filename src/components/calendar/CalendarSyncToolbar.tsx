import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

export const CalendarSyncToolbar = () => {
  const { integration, isConnected } = useGoogleCalendarIntegration();
  const { syncFromGoogle, syncAllToGoogle, isSyncingFromGoogle, isSyncingAll } = useGoogleCalendarSync();
  
  // Auto-sync state
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(() => {
    const saved = localStorage.getItem('autoSyncEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default: enabled
  });

  // Save auto-sync preference
  useEffect(() => {
    localStorage.setItem('autoSyncEnabled', JSON.stringify(autoSyncEnabled));
  }, [autoSyncEnabled]);

  // Auto-sync interval - every 5 minutes
  useEffect(() => {
    if (!isConnected || !autoSyncEnabled) return;

    // Sync immediately on mount if last sync > 5 minutes ago
    const lastSyncTime = integration?.last_sync;
    if (!lastSyncTime || Date.now() - new Date(lastSyncTime).getTime() > 5 * 60 * 1000) {
      console.log('Initial auto-sync triggered');
      syncFromGoogle();
    }

    // Set up interval for background sync every 5 minutes
    const interval = setInterval(() => {
      console.log('Background auto-sync triggered');
      syncFromGoogle();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isConnected, autoSyncEnabled, syncFromGoogle]);

  if (!isConnected) {
    return null;
  }

  const lastSyncTime = integration?.last_sync 
    ? formatDistanceToNow(new Date(integration.last_sync), { addSuffix: true })
    : 'Never';

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 border-b">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5">
          {integration?.active ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              <span>Google Calendar Connected</span>
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 text-destructive" />
              <span>Not Connected</span>
            </>
          )}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Last sync: {lastSyncTime}
        </span>
        {isSyncingFromGoogle && autoSyncEnabled && (
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Auto-syncing...
          </Badge>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Auto-sync toggle */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/50">
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={setAutoSyncEnabled}
            className="scale-90"
          />
          <Label htmlFor="auto-sync" className="text-xs cursor-pointer whitespace-nowrap">
            Auto-sync (5m)
          </Label>
        </div>

        {/* Manual sync buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncFromGoogle()}
          disabled={isSyncingFromGoogle || isSyncingAll}
          className="gap-2"
        >
          {isSyncingFromGoogle ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Sync from Google
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => syncAllToGoogle()}
          disabled={isSyncingFromGoogle || isSyncingAll}
          className="gap-2"
        >
          {isSyncingAll ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Sync All to Google
        </Button>
      </div>
    </div>
  );
};
