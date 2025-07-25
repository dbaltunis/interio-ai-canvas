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
import { CalendarDays, Clock, MapPin, FileText, Loader2, Trash2, ExternalLink, Share } from "lucide-react";
import { useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { AppointmentSharingDialog } from "./sharing/AppointmentSharingDialog";
import { useAppointmentCalDAVSync } from "@/hooks/useAppointmentCalDAVSync";
import { format } from "date-fns";

interface AppointmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
}

export const AppointmentEditDialog = ({ 
  open, 
  onOpenChange, 
  appointment 
}: AppointmentEditDialogProps) => {
  const [editedAppointment, setEditedAppointment] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    appointment_type: "meeting",
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [syncToCalendars, setSyncToCalendars] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);

  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const { syncableCalendars, syncAppointmentToCalDAV } = useAppointmentCalDAVSync();

  useEffect(() => {
    if (appointment) {
      setEditedAppointment({
        title: appointment.title || "",
        description: appointment.description || "",
        start_time: appointment.start_time ? new Date(appointment.start_time).toISOString().slice(0, 16) : "",
        end_time: appointment.end_time ? new Date(appointment.end_time).toISOString().slice(0, 16) : "",
        location: appointment.location || "",
        appointment_type: appointment.appointment_type || "meeting",
      });
    }
  }, [appointment]);

  const handleUpdate = async () => {
    if (!editedAppointment.title || !editedAppointment.start_time || !editedAppointment.end_time) return;

    try {
      const updatedData = {
        ...editedAppointment,
        start_time: new Date(editedAppointment.start_time).toISOString(),
        end_time: new Date(editedAppointment.end_time).toISOString(),
      };

      await updateAppointment.mutateAsync({ 
        id: appointment.id, 
        ...updatedData 
      } as any);

      // Sync to selected calendars if enabled
      if (syncToCalendars && selectedCalendars.length > 0) {
        await syncAppointmentToCalDAV.mutateAsync({
          appointment: { ...appointment, ...updatedData },
          calendarIds: selectedCalendars
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const handleCalendarToggle = (calendarId: string, checked: boolean) => {
    setSelectedCalendars(prev => 
      checked 
        ? [...prev, calendarId]
        : prev.filter(id => id !== calendarId)
    );
  };

  const isLoading = updateAppointment.isPending || deleteAppointment.isPending || syncAppointmentToCalDAV.isPending;

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Edit Appointment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <Label htmlFor="title">Appointment Title *</Label>
            <Input
              id="title"
              placeholder="Enter appointment title"
              value={editedAppointment.title}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, title: e.target.value })}
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
                value={editedAppointment.start_time}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, start_time: e.target.value })}
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
                value={editedAppointment.end_time}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Appointment Type</Label>
            <Select value={editedAppointment.appointment_type} onValueChange={(value) => setEditedAppointment({ ...editedAppointment, appointment_type: value })}>
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
              value={editedAppointment.location}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, location: e.target.value })}
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
              value={editedAppointment.description}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Appointment Metadata */}
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
                    Update in connected calendars
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
              onClick={handleUpdate}
              disabled={!editedAppointment.title || !editedAppointment.start_time || !editedAppointment.end_time || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Appointment'
              )}
            </Button>

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
                    Are you sure you want to delete "{appointment.title}"? This action cannot be undone.
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
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>

        <AppointmentSharingDialog
          open={showSharingDialog}
          onOpenChange={setShowSharingDialog}
          appointmentId={appointment?.id || ""}
          appointmentTitle={editedAppointment?.title || ""}
        />
      </DialogContent>
    </Dialog>
  );
};