
import { GoogleCalendarIntegration } from "@/components/calendar/GoogleCalendarIntegration";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Google Calendar Integration</h3>
        <p className="text-sm text-muted-foreground">
          Connect and sync your appointments with Google Calendar
        </p>
      </div>
      
      <GoogleCalendarIntegration />
    </div>
  );
};
