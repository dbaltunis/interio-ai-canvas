import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, FileText, Loader2 } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { useAppointmentCalDAVSync } from "@/hooks/useAppointmentCalDAVSync";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";

interface QuickEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  appointment?: any;
}

export const QuickEventDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate,
  appointment 
}: QuickEventDialogProps) => {
  const isEditing = !!appointment;
  const [event, setEvent] = useState({
    title: appointment?.title || "",
    description: appointment?.description || "",
    start_time: appointment?.start_time || 
      (selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0).toISOString().slice(0, 16) : ""),
    end_time: appointment?.end_time || 
      (selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 0).toISOString().slice(0, 16) : ""),
    location: appointment?.location || "",
    appointment_type: appointment?.appointment_type || "meeting",
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [autoSync, setAutoSync] = useState(true);

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const { syncableCalendars, syncAppointmentToCalDAV } = useAppointmentCalDAVSync();
  const { isOnline, queueOfflineOperation } = useOfflineSupport();

  const handleSubmit = async () => {
    if (!event.title || !event.start_time || !event.end_time) return;

    const appointmentData = {
      ...event,
      start_time: new Date(event.start_time).toISOString(),
      end_time: new Date(event.end_time).toISOString(),
    };

    try {
      if (isOnline) {
        if (isEditing) {
          await updateAppointment.mutateAsync({ 
            id: appointment.id, 
            ...appointmentData 
          });
        } else {
          const newAppointment = await createAppointment.mutateAsync(appointmentData);
          
          // Auto-sync to selected calendars if enabled
          if (autoSync && selectedCalendars.length > 0) {
            await syncAppointmentToCalDAV.mutateAsync({
              appointment: newAppointment,
              calendarIds: selectedCalendars
            });
          }
        }
      } else {
        // Queue for offline processing
        if (isEditing) {
          queueOfflineOperation('update', 'appointments', { id: appointment.id, ...appointmentData });
        } else {
          queueOfflineOperation('create', 'appointments', appointmentData);
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  };

  const resetForm = () => {
    setEvent({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      appointment_type: "meeting",
    });
    setSelectedCalendars([]);
    setAutoSync(true);
  };

  const handleCalendarToggle = (calendarId: string, checked: boolean) => {
    setSelectedCalendars(prev => 
      checked 
        ? [...prev, calendarId]
        : prev.filter(id => id !== calendarId)
    );
  };

  const isLoading = createAppointment.isPending || updateAppointment.isPending || syncAppointmentToCalDAV.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={event.start_time}
                onChange={(e) => setEvent({ ...event, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                End Time *
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={event.end_time}
                onChange={(e) => setEvent({ ...event, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Event Type</Label>
            <Select value={event.appointment_type} onValueChange={(value) => setEvent({ ...event, appointment_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="measurement">Measurement</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Enter location"
              value={event.location}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              rows={3}
            />
          </div>

          {!isEditing && syncableCalendars.length > 0 && (
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={(checked) => setAutoSync(checked === true)}
                />
                <Label htmlFor="auto-sync" className="text-sm font-medium">
                  Sync to calendars
                </Label>
              </div>
              
              {autoSync && (
                <div className="space-y-2 ml-6">
                  {syncableCalendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`calendar-${calendar.id}`}
                        checked={selectedCalendars.includes(calendar.id)}
                        onCheckedChange={(checked) => 
                          handleCalendarToggle(calendar.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`calendar-${calendar.id}`} className="text-xs flex items-center gap-2">
                        {calendar.color && (
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: calendar.color }}
                          />
                        )}
                        {calendar.display_name}
                        <Badge variant="outline" className="text-xs">
                          {calendar.account_name}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!event.title || !event.start_time || !event.end_time || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Event' : 'Create Event'
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};