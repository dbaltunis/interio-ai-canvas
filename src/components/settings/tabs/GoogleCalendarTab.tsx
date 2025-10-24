
import { CalDAVAccountManager } from "@/components/calendar/CalDAVAccountManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useCalendarSync } from "@/contexts/CalendarSyncContext";
import { Badge } from "@/components/ui/badge";

export const GoogleCalendarTab = () => {
  const { isSyncing, lastSyncTime, syncErrors } = useCalendarSync();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendar accounts to sync events with InteriorApp. Works with Google Calendar, 
          Apple Calendar, Outlook, Yahoo, and any CalDAV-compatible calendar service.
        </p>
      </div>

      {/* Sync Status */}
      <Alert>
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <>
              <Clock className="h-4 w-4 animate-pulse" />
              <AlertTitle>Syncing in progress...</AlertTitle>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Background sync active</AlertTitle>
            </>
          )}
        </div>
        <AlertDescription className="mt-2">
          {lastSyncTime ? (
            <span>Last sync: {lastSyncTime.toLocaleString()}</span>
          ) : (
            <span>Automatic sync runs every 15 minutes</span>
          )}
        </AlertDescription>
      </Alert>

      {/* Sync Errors */}
      {syncErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recent Sync Issues</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-sm">
              {syncErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Common issues: Invalid credentials, network problems, or calendar permissions.
              Try reconnecting your account or check your calendar provider settings.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Note about Google Calendar OAuth */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Google Calendar Not Connected</AlertTitle>
        <AlertDescription>
          Google Calendar requires OAuth setup. The "Not Connected" status is expected unless you've configured OAuth credentials in the Google Cloud Console. 
          For now, use the CalDAV integration below which works with Google Calendar, Apple Calendar, and other providers.
        </AlertDescription>
      </Alert>

      <CalDAVAccountManager />
    </div>
  );
};
