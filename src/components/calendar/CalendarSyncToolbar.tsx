import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useGoogleCalendarIntegration, useGoogleCalendarSync } from "@/hooks/useGoogleCalendar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const CalendarSyncToolbar = () => {
  const { integration, isConnected } = useGoogleCalendarIntegration();
  const { syncFromGoogle, syncAllToGoogle, isSyncingFromGoogle, isSyncingAll } = useGoogleCalendarSync();

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
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
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
