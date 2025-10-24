import { GoogleCalendarSetup } from "@/components/calendar/GoogleCalendarSetup";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Google Calendar to sync appointments automatically.
        </p>
      </div>

      <GoogleCalendarSetup />
    </div>
  );
};
