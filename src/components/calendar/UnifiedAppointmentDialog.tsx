import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, MapPin, FileText, Loader2, Trash2, Share, Plus, Minus, Palette, Users, Video, UserPlus, Bell, User } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useAppointmentCalDAVSync } from "@/hooks/useAppointmentCalDAVSync";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useUserProfile } from "@/hooks/useUserProfile";
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
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    appointment_type: "meeting" as "meeting" | "consultation" | "measurement" | "installation" | "follow_up" | "reminder" | "call",
    color: "",
    video_meeting_link: "",
    selectedTeamMembers: [] as string[],
    inviteClientEmail: "",
    notification_enabled: false,
    notification_minutes: 15,
    notificationMethods: [] as string[],
    customNotificationMessage: ""
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [syncToCalendars, setSyncToCalendars] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const { syncableCalendars, syncAppointmentToCalDAV } = useAppointmentCalDAVSync();
  const { isOnline, queueOfflineOperation } = useOfflineSupport();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { defaultColors } = useCalendarColors();
  
  // Fetch event owner profile if editing an appointment
  const { data: eventOwnerProfile } = useUserProfile(appointment?.user_id);

  useEffect(() => {
    if (appointment) {
      const startDate = new Date(appointment.start_time);
      const endDate = new Date(appointment.end_time);
      
      setEvent({
        title: appointment.title || "",
        description: appointment.description || "",
        date: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        location: appointment.location || "",
        appointment_type: appointment.appointment_type || "meeting",
        color: appointment.color || defaultColors[0],
        video_meeting_link: appointment.video_meeting_link || "",
        selectedTeamMembers: appointment.team_member_ids || [],
        inviteClientEmail: appointment.invited_client_emails?.join(', ') || "",
        notification_enabled: appointment.notification_enabled || false,
        notification_minutes: appointment.notification_minutes || 15,
        notificationMethods: appointment.notification_methods || [],
        customNotificationMessage: appointment.custom_notification_message || ""
      });
    } else if (selectedDate) {
      setEvent({
        title: "",
        description: "",
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        appointment_type: "meeting",
        color: defaultColors[0],
        video_meeting_link: "",
        selectedTeamMembers: [],
        inviteClientEmail: "",
        notification_enabled: true, // Enable notifications by default for new events
        notification_minutes: 15,
        notificationMethods: [],
        customNotificationMessage: ""
      });
    }
  }, [appointment, selectedDate, defaultColors]);

  const handleSubmit = async () => {
    console.log('handleSubmit called with event:', event);
    console.log('isEditing:', isEditing);
    console.log('appointment:', appointment);
    
    if (!event.title || !event.date || !event.startTime || !event.endTime) {
      console.log('Validation failed:', {
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime
      });
      return;
    }

    const startDateTime = new Date(`${event.date}T${event.startTime}`);
    const endDateTime = new Date(`${event.date}T${event.endTime}`);

    const appointmentData = {
      title: event.title,
      description: event.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: event.location,
      appointment_type: event.appointment_type,
      color: event.color,
      video_meeting_link: event.video_meeting_link,
      team_member_ids: event.selectedTeamMembers,
      invited_client_emails: event.inviteClientEmail ? event.inviteClientEmail.split(',').map(email => email.trim()) : [],
      notification_enabled: event.notification_enabled,
      notification_minutes: event.notification_minutes,
      notification_methods: event.notificationMethods,
      custom_notification_message: event.customNotificationMessage
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
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      appointment_type: "meeting",
      color: defaultColors[0],
      video_meeting_link: "",
      selectedTeamMembers: [],
      inviteClientEmail: "",
      notification_enabled: false,
      notification_minutes: 15,
      notificationMethods: [],
      customNotificationMessage: ""
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

  const handleTeamMemberToggle = (memberId: string, checked: boolean) => {
    setEvent(prev => ({
      ...prev,
      selectedTeamMembers: checked 
        ? [...prev.selectedTeamMembers, memberId]
        : prev.selectedTeamMembers.filter(id => id !== memberId)
    }));
  };

  const adjustTime = (field: 'startTime' | 'endTime', minutes: number) => {
    setEvent(prev => {
      const currentTime = prev[field];
      const [hours, mins] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const clampedMinutes = Math.max(0, Math.min(1439, totalMinutes)); // 0-1439 minutes in a day
      const newHours = Math.floor(clampedMinutes / 60);
      const newMins = clampedMinutes % 60;
      return {
        ...prev,
        [field]: `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
      };
    });
  };

  const setQuickDuration = (minutes: number) => {
    if (!event.startTime) return;
    const [hours, mins] = event.startTime.split(':').map(Number);
    const startMinutes = hours * 60 + mins;
    const endMinutes = startMinutes + minutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    setEvent(prev => ({
      ...prev,
      endTime: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
    }));
  };

  const isLoading = createAppointment.isPending || updateAppointment.isPending || deleteAppointment.isPending || syncAppointmentToCalDAV.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {isEditing ? 'Edit Appointment' : 'Create New Event'}
            </div>
            {appointment?.project_id && (
              <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  Job #{appointment.project_id.slice(0, 8)}
                </Badge>
                {appointment.notification_enabled && (
                  <Badge variant="secondary" className="font-normal flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Notification {appointment.notification_minutes}min before
                  </Badge>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="What's this event about?"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={event.date}
                  onChange={(e) => setEvent({ ...event, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startTime" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Start Time *
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => adjustTime('startTime', -15)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    id="startTime"
                    type="time"
                    value={event.startTime}
                    onChange={(e) => setEvent({ ...event, startTime: e.target.value })}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => adjustTime('startTime', 15)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => adjustTime('endTime', -15)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    id="endTime"
                    type="time"
                    value={event.endTime}
                    onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => adjustTime('endTime', 15)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Bell className="w-4 w-4" />
                  Notifications
                </Label>
                
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableNotifications" className="text-sm">Enable notifications for this event</Label>
                    <Switch
                      id="enableNotifications"
                      checked={event.notification_enabled || false}
                      onCheckedChange={(checked) => setEvent({ ...event, notification_enabled: checked })}
                    />
                  </div>

                  {event.notification_enabled && (
                    <div className="space-y-3 ml-4 pl-4 border-l-2 border-muted">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Notification methods</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="emailNotification"
                              checked={event.notificationMethods?.includes('email') || false}
                              onCheckedChange={(checked) => {
                                const methods = event.notificationMethods || [];
                                setEvent({
                                  ...event,
                                  notificationMethods: checked
                                    ? [...methods.filter(m => m !== 'email'), 'email']
                                    : methods.filter(m => m !== 'email')
                                });
                              }}
                            />
                            <Label htmlFor="emailNotification" className="text-sm">Email</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="smsNotification"
                              checked={event.notificationMethods?.includes('sms') || false}
                              onCheckedChange={(checked) => {
                                const methods = event.notificationMethods || [];
                                setEvent({
                                  ...event,
                                  notificationMethods: checked
                                    ? [...methods.filter(m => m !== 'sms'), 'sms']
                                    : methods.filter(m => m !== 'sms')
                                });
                              }}
                            />
                            <Label htmlFor="smsNotification" className="text-sm">SMS</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="inAppNotification"
                              checked={event.notificationMethods?.includes('in_app') || false}
                              onCheckedChange={(checked) => {
                                const methods = event.notificationMethods || [];
                                setEvent({
                                  ...event,
                                  notificationMethods: checked
                                    ? [...methods.filter(m => m !== 'in_app'), 'in_app']
                                    : methods.filter(m => m !== 'in_app')
                                });
                              }}
                            />
                            <Label htmlFor="inAppNotification" className="text-sm">In-app notification</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notificationTiming" className="text-sm font-medium">Notify before event</Label>
                        <Select 
                          value={event.notification_minutes?.toString() || '15'}
                          onValueChange={(value) => setEvent({ ...event, notification_minutes: parseInt(value) })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">At event time</SelectItem>
                            <SelectItem value="5">5 minutes before</SelectItem>
                            <SelectItem value="15">15 minutes before</SelectItem>
                            <SelectItem value="30">30 minutes before</SelectItem>
                            <SelectItem value="60">1 hour before</SelectItem>
                            <SelectItem value="120">2 hours before</SelectItem>
                            <SelectItem value="1440">1 day before</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="customMessage" className="text-sm font-medium">Custom message (optional)</Label>
                        <Textarea
                          id="customMessage"
                          value={event.customNotificationMessage || ''}
                          onChange={(e) => setEvent({ ...event, customNotificationMessage: e.target.value })}
                          placeholder="Add a custom message to the notification..."
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Duration Buttons */}
            <div className="flex flex-wrap gap-2">
              <Label className="text-sm font-medium w-full">Quick Duration:</Label>
              {[15, 30, 60, 90, 120].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDuration(minutes)}
                >
                  {minutes}m
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Event Type</Label>
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
                <Label className="flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  Color
                </Label>
                <div className="flex gap-2 pt-2">
                  {defaultColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${
                        event.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEvent({ ...event, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Video Meeting */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Where is this happening?"
                value={event.location}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="videoLink" className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                Video Meeting Link
              </Label>
              <Input
                id="videoLink"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={event.video_meeting_link}
                onChange={(e) => setEvent({ ...event, video_meeting_link: e.target.value })}
              />
            </div>
          </div>

          {/* Team Members */}
          {teamMembers && teamMembers.length > 0 && (
            <div className="space-y-3">
              <Label className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Team Members
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={event.selectedTeamMembers.includes(member.id)}
                      onCheckedChange={(checked) => 
                        handleTeamMemberToggle(member.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`member-${member.id}`} className="text-sm">
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Invitations */}
          <div>
            <Label htmlFor="clientEmails" className="flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              Invite Clients (emails)
            </Label>
            <Input
              id="clientEmails"
              placeholder="client1@email.com, client2@email.com"
              value={event.inviteClientEmail}
              onChange={(e) => setEvent({ ...event, inviteClientEmail: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details about this event..."
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
                {/* Event Owner Information */}
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Event Owner:
                  </span>
                  <span className="text-foreground font-medium">
                    {eventOwnerProfile?.display_name || appointment?.user_email || 'Unknown User'}
                  </span>
                </div>
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
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!event.title || !event.date || !event.startTime || !event.endTime || isLoading}
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
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
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