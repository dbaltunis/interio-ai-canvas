import { SimpleCalendarSetup } from "@/components/calendar/SimpleCalendarSetup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Clock, Info } from "lucide-react";
import { useCalendarSync } from "@/contexts/CalendarSyncContext";

export const GoogleCalendarTab = () => {
  const { isSyncing, lastSyncTime } = useCalendarSync();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendar in seconds - works with Google, Apple iCloud, Outlook, and more.
        </p>
      </div>

      {/* Sync Status */}
      {isSyncing && (
        <Alert>
          <Clock className="h-4 w-4 animate-pulse" />
          <AlertTitle>Syncing...</AlertTitle>
          <AlertDescription>
            Your calendar is syncing now. This usually takes a few seconds.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          Simply enter your email and password (or app-specific password for Google/Apple), 
          and we'll automatically connect to your calendar. Your events will sync in both directions.
        </AlertDescription>
      </Alert>

      <SimpleCalendarSetup />
    </div>
  );
};
