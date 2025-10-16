import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Loader2 } from "lucide-react";
import { useAppointmentCalDAVSync } from "@/hooks/useAppointmentCalDAVSync";

interface CalDAVSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSyncComplete?: () => void;
}

export const CalDAVSyncDialog = ({ 
  open, 
  onOpenChange, 
  appointment, 
  onSyncComplete 
}: CalDAVSyncDialogProps) => {
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const { 
    syncableCalendars, 
    loadingCalendars, 
    syncAppointmentToCalDAV 
  } = useAppointmentCalDAVSync();

  const handleCalendarToggle = (calendarId: string, checked: boolean) => {
    setSelectedCalendars(prev => 
      checked 
        ? [...prev, calendarId]
        : prev.filter(id => id !== calendarId)
    );
  };

  const handleSync = async () => {
    if (selectedCalendars.length === 0) return;

    try {
      await syncAppointmentToCalDAV.mutateAsync({
        appointment,
        calendarIds: selectedCalendars
      });
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      // Always close dialog and reset state, regardless of success or failure
      setSelectedCalendars([]);
      onSyncComplete?.();
      onOpenChange(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedCalendars.length === syncableCalendars.length) {
      setSelectedCalendars([]);
    } else {
      setSelectedCalendars(syncableCalendars.map(cal => cal.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Sync to Calendars
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Appointment: {appointment?.title}
            </Label>
            <p className="text-sm text-muted-foreground">
              {appointment?.start_time && new Date(appointment.start_time).toLocaleString()}
            </p>
          </div>

          {loadingCalendars ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading calendars...</span>
            </div>
          ) : syncableCalendars.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No calendars available for sync</p>
              <p className="text-sm">Connect a calendar account in Settings → Calendar</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Select calendars to sync to:
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedCalendars.length === syncableCalendars.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {syncableCalendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox
                      id={calendar.id}
                      checked={selectedCalendars.includes(calendar.id)}
                      onCheckedChange={(checked) => 
                        handleCalendarToggle(calendar.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={calendar.id} className="text-sm font-medium cursor-pointer">
                        {calendar.display_name}
                      </Label>
                      <p className="text-xs text-muted-foreground truncate">
                        {calendar.account_name} • {calendar.account_email}
                      </p>
                    </div>
                    {calendar.color && (
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: calendar.color }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSync}
                  disabled={selectedCalendars.length === 0 || syncAppointmentToCalDAV.isPending}
                  className="flex-1"
                >
                  {syncAppointmentToCalDAV.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    `Sync to ${selectedCalendars.length} calendar${selectedCalendars.length !== 1 ? 's' : ''}`
                  )}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};