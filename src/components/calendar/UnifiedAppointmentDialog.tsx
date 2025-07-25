import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, MapPin, FileText, Loader2, Trash2, Share } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useAppointmentCalDAVSync } from "@/hooks/useAppointmentCalDAVSync";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { AppointmentSharingDialog } from "./sharing/AppointmentSharingDialog";
import { format } from "date-fns";

interface UnifiedAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  appointment?: any;
}

export const UnifiedAppointmentDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate,
  appointment 
}: UnifiedAppointmentDialogProps) => {
  const isEditing = !!appointment;
  const [event, setEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    appointment_type: "meeting" as "meeting" | "consultation" | "measurement" | "installation" | "follow_up" | "reminder" | "call",
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [syncToCalendars, setSyncToCalendars] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const { syncableCalendars, syncAppointmentToCalDAV } = useAppointmentCalDAVSync();
  const { isOnline, queueOfflineOperation } = useOfflineSupport();

  useEffect(() => {
    if (appointment) {
      setEvent({
        title: appointment.title || "",
        description: appointment.description || "",
        start_time: appointment.start_time ? new Date(appointment.start_time).toISOString().slice(0, 16) : "",
        end_time: appointment.end_time ? new Date(appointment.end_time).toISOString().slice(0, 16) : "",
        location: appointment.location || "",
        appointment_type: appointment.appointment_type || "meeting",
      });
    } else if (selectedDate) {
      setEvent({
        title: "",
        description: "",
        start_time: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 9, 0).toISOString().slice(0, 16),
        end_time: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 0).toISOString().slice(0, 16),
        location: "",
        appointment_type: "meeting",
      });
    }
  }, [appointment, selectedDate]);

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
          } as any);

          // Sync to selected calendars if enabled for editing
          if (syncToCalendars && selectedCalendars.length > 0) {
            await syncAppointmentToCalDAV.mutateAsync({
              appointment: { ...appointment, ...appointmentData },
              calendarIds: selectedCalendars
            });
          }
        } else {
          const newAppointment = await createAppointment.mutateAsync(appointmentData as any);
          
          // Auto-sync to selected calendars if enabled for creation
          if (syncToCalendars && selectedCalendars.length > 0) {
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

  const handleDelete = async () => {
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
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
    setSyncToCalendars(false);
  };

  const handleCalendarToggle = (calendarId: string, checked: boolean) => {
    setSelectedCalendars(prev => 
      checked 
        ? [...prev, calendarId]
        : prev.filter(id => id !== calendarId)
    );
  };

  const isLoading = createAppointment.isPending || updateAppointment.isPending || deleteAppointment.isPending || syncAppointmentToCalDAV.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {isEditing ? 'Edit Appointment' : 'Create New Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <Label htmlFor="title">Appointment Title *</Label>
            <Input
              id="title"
              placeholder="Enter appointment title"
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
            <Label htmlFor="type">Appointment Type</Label>
            <Select value={event.appointment_type} onValueChange={(value) => setEvent({ ...event, appointment_type: value as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="measurement">Measurement</SelectItem>
                <SelectItem value="installation">Installation</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="call">Call</SelectItem>
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
              placeholder="Enter appointment description"
              value={event.description}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Appointment Metadata - only show when editing */}
          {isEditing && appointment && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{format(new Date(appointment.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span>{format(new Date(appointment.updated_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Calendar Sync Options */}
          {syncableCalendars.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sync-calendars"
                    checked={syncToCalendars}
                    onCheckedChange={(checked) => setSyncToCalendars(checked === true)}
                  />
                  <Label htmlFor="sync-calendars" className="text-sm font-medium">
                    {isEditing ? 'Update in connected calendars' : 'Sync to connected calendars'}
                  </Label>
                </div>
                
                {syncToCalendars && (
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
            </>
          )}

          {/* Action Buttons */}
          <Separator />
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
                isEditing ? 'Update Appointment' : 'Create Appointment'
              )}
            </Button>

            {isEditing && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSharingDialog(true)}
                  disabled={isLoading}
                >
                  <Share className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isLoading}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{appointment?.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>

        {isEditing && (
          <AppointmentSharingDialog
            open={showSharingDialog}
            onOpenChange={setShowSharingDialog}
            appointmentId={appointment?.id || ""}
            appointmentTitle={event?.title || ""}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};