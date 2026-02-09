import { GoogleCalendarSetup } from "@/components/calendar/GoogleCalendarSetup";
import { OutlookCalendarSetup } from "@/components/calendar/OutlookCalendarSetup";
import { NylasCalendarSetup } from "@/components/calendar/NylasCalendarSetup";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendars to sync appointments automatically. Use Nylas for the easiest Google & Outlook setup, or connect directly.
        </p>
      </div>

      <NylasCalendarSetup />
      <GoogleCalendarSetup />
      <OutlookCalendarSetup />
    </div>
  );
};
