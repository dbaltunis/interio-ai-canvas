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
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-b">
      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        {integration?.active ? (
          <CheckCircle2 className="h-3 w-3 text-green-500" />
        ) : (
          <XCircle className="h-3 w-3 text-destructive" />
        )}
        <span className="text-[11px] text-muted-foreground">
          {lastSyncTime}
        </span>
      </div>

      {/* Syncing indicator */}
      {isSyncingFromGoogle && autoSyncEnabled && (
        <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
      )}

      <div className="flex-1" />

      {/* Controls group */}
      <div className="flex items-center gap-1.5">
        {/* Auto-sync toggle */}
        <div className="flex items-center gap-1">
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={setAutoSyncEnabled}
            className="scale-75"
          />
          <Label htmlFor="auto-sync" className="text-[11px] cursor-pointer text-muted-foreground whitespace-nowrap">
            Auto (5m)
          </Label>
        </div>

        {/* Manual sync buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => syncFromGoogle()}
          disabled={isSyncingFromGoogle || isSyncingAll}
          className="h-6 px-2 gap-1 text-[11px]"
          title="Sync from Google Calendar"
        >
          {isSyncingFromGoogle ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">Import</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => syncAllToGoogle()}
          disabled={isSyncingFromGoogle || isSyncingAll}
          className="h-6 px-2 gap-1 text-[11px]"
          title="Sync all to Google Calendar"
        >
          {isSyncingAll ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
};
