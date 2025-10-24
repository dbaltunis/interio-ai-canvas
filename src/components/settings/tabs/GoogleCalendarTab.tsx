import { GoogleCalendarSetup } from "@/components/calendar/GoogleCalendarSetup";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Google Calendar with one click - secure OAuth2 authentication.
        </p>
      </div>

      <GoogleCalendarSetup />
    </div>
  );
};
