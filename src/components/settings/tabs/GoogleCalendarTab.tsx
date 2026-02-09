import { GoogleCalendarSetup } from "@/components/calendar/GoogleCalendarSetup";
import { OutlookCalendarSetup } from "@/components/calendar/OutlookCalendarSetup";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendars to sync appointments automatically. You can connect both Google and Outlook calendars simultaneously.
        </p>
      </div>

      <GoogleCalendarSetup />
      <OutlookCalendarSetup />
    </div>
  );
};
