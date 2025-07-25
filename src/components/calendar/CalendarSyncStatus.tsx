import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Settings, Calendar } from "lucide-react";
import { useAppointmentCalDAVSync } from "@/hooks/useAppointmentCalDAVSync";
import { useCalDAVAccounts } from "@/hooks/useCalDAV";
import { Link } from "react-router-dom";

export const CalendarSyncStatus = () => {
  const { accounts } = useCalDAVAccounts();
  const { autoSyncAllCalendars } = useAppointmentCalDAVSync();

  const activeAccounts = accounts.filter(account => account.active && account.sync_enabled);
  const totalAccounts = accounts.length;

  const handleAutoSync = () => {
    autoSyncAllCalendars.mutate();
  };

  return (
    <div className="flex items-center gap-2">
      {totalAccounts > 0 ? (
        <>
          <Badge variant={activeAccounts.length > 0 ? "default" : "secondary"}>
            <Calendar className="w-3 h-3 mr-1" />
            {activeAccounts.length}/{totalAccounts} synced
          </Badge>
          
          {activeAccounts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoSync}
              disabled={autoSyncAllCalendars.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoSyncAllCalendars.isPending ? 'animate-spin' : ''}`} />
              {autoSyncAllCalendars.isPending ? 'Syncing...' : 'Sync All'}
            </Button>
          )}
        </>
      ) : (
        <Badge variant="outline">
          <Calendar className="w-3 h-3 mr-1" />
          No calendars
        </Badge>
      )}
      
      <Link to="/?tab=settings&subtab=google_calendar">
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 mr-1" />
          Calendar Settings
        </Button>
      </Link>
    </div>
  );
};