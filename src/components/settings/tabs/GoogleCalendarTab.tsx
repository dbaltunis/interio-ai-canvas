
import { CalDAVAccountManager } from "@/components/calendar/CalDAVAccountManager";

export const GoogleCalendarTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your calendar accounts to sync events with InteriorApp. Works with Google Calendar, 
          Apple Calendar, Outlook, Yahoo, and any CalDAV-compatible calendar service.
        </p>
      </div>
      <CalDAVAccountManager />
    </div>
  );
};
