import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, MapPin, FileText, Loader2, Trash2, Share, Plus, Minus, Palette, Users, Video, UserPlus, Bell, User, AlertCircle } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
// CalDAV sync removed - using Google Calendar OAuth only
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AppointmentSharingDialog } from "./sharing/AppointmentSharingDialog";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";

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
    notification_minutes: 15
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [syncToCalendars, setSyncToCalendars] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  // CalDAV sync removed
  const { isOnline, queueOfflineOperation } = useOfflineSupport();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { defaultColors, colorOptions } = useCalendarColors();
  
  // Fetch event owner profile if editing an appointment
  const { data: eventOwnerProfile } = useUserProfile(appointment?.user_id);

  useEffect(() => {
    if (appointment) {
      // Parse times in UTC to prevent timezone conversion on display
      const startDate = new Date(appointment.start_time);
      const endDate = new Date(appointment.end_time);
      
      setEvent({
        title: appointment.title || "",
        description: appointment.description || "",
        // Format in UTC timezone to preserve the stored time
        date: formatInTimeZone(startDate, 'UTC', 'yyyy-MM-dd'),
        startTime: formatInTimeZone(startDate, 'UTC', 'HH:mm'),
        endTime: formatInTimeZone(endDate, 'UTC', 'HH:mm'),
        location: appointment.location || "",
        appointment_type: appointment.appointment_type || "meeting",
        color: appointment.color || defaultColors[0],
        video_meeting_link: appointment.video_meeting_link || "",
        selectedTeamMembers: appointment.team_member_ids || [],
        inviteClientEmail: appointment.invited_client_emails?.join(', ') || "",
        notification_enabled: appointment.notification_enabled || false,
        notification_minutes: appointment.notification_minutes || 15
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
        notification_minutes: 15
      });
    }
  }, [appointment, selectedDate, defaultColors]);

  // Validate date range
  const isValidDateRange = useMemo(() => {
    if (!event.date || !event.startTime || !event.endTime) return true;
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    return end > start;
  }, [event.date, event.startTime, event.endTime]);

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

    // Additional validation for date range
    if (!isValidDateRange) {
      console.log('Invalid date range: end time must be after start time');
      return;
    }

    // Create dates in UTC to avoid timezone conversion issues
    const startDateTime = new Date(`${event.date}T${event.startTime}:00.000Z`);
    const endDateTime = new Date(`${event.date}T${event.endTime}:00.000Z`);

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
      notification_minutes: event.notification_minutes
    };

    try {
      if (isOnline) {
        if (isEditing) {
          await updateAppointment.mutateAsync({ 
            id: appointment.id, 
            ...appointmentData 
          } as any);

          // CalDAV sync removed
        } else {
          const newAppointment = await createAppointment.mutateAsync(appointmentData as any);
          
          // CalDAV sync removed
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
      notification_minutes: 15
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

  const isLoading = createAppointment.isPending || updateAppointment.isPending || deleteAppointment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {isEditing ? 'Edit Event' : 'New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Event Title *</Label>
            <Input
              id="title"
              placeholder="What's this event about?"
              value={event.title}
              onChange={useCallback((e) => setEvent(prev => ({ ...prev, title: e.target.value })), [])}
              className="h-10"
            />
          </div>

          {/* Date and Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <CalendarDays className="w-3.5 h-3.5" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={event.date}
                onChange={useCallback((e) => setEvent(prev => ({ ...prev, date: e.target.value })), [])}
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5" />
                Start Time *
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => adjustTime('startTime', -15)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="startTime"
                  type="time"
                  value={event.startTime}
                  onChange={useCallback((e) => setEvent(prev => ({ ...prev, startTime: e.target.value })), [])}
                  className="h-10 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => adjustTime('startTime', 15)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="endTime" className="text-sm font-medium flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5" />
                End Time *
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => adjustTime('endTime', -15)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="endTime"
                  type="time"
                  min={event.startTime}
                  value={event.endTime}
                  onChange={useCallback((e) => setEvent(prev => ({ ...prev, endTime: e.target.value })), [])}
                  className="h-10 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => adjustTime('endTime', 15)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Date validation error */}
          {!isValidDateRange && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>End time must be after start time</AlertDescription>
            </Alert>
          )}

          {/* Quick Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Duration</Label>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 60, 90, 120].map((minutes) => (
                <Button
                  key={minutes}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickDuration(minutes)}
                  className="h-8"
                >
                  {minutes}m
                </Button>
              ))}
            </div>
          </div>

          {/* Type and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Event Type</Label>
              <Select value={event.appointment_type} onValueChange={(value) => setEvent({ ...event, appointment_type: value as any })}>
                <SelectTrigger className="h-10">
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
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Color
              </Label>
              <Select 
                value={event.color || defaultColors[0]} 
                onValueChange={(value) => setEvent({ ...event, color: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-border"
                        style={{ backgroundColor: event.color || defaultColors[0] }}
                      />
                      <span>{colorOptions.find(c => c.value === event.color)?.name || 'Select'}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border-2 border-border"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location and Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Where?"
                value={event.location}
                onChange={useCallback((e) => setEvent(prev => ({ ...prev, location: e.target.value })), [])}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoLink" className="text-sm font-medium flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                Video Link
              </Label>
              <Input
                id="videoLink"
                placeholder="https://meet.google.com/..."
                value={event.video_meeting_link}
                onChange={useCallback((e) => setEvent(prev => ({ ...prev, video_meeting_link: e.target.value })), [])}
                className="h-10"
              />
            </div>
          </div>

          {/* Team Members with Avatars */}
          {teamMembers && teamMembers.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Team Members
              </Label>
              <div className="flex flex-wrap gap-3">
                {teamMembers.map((member) => {
                  const isSelected = event.selectedTeamMembers.includes(member.id);
                  const initials = getInitials(member.name);
                  const avatarColor = getAvatarColor(member.id);
                  
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleTeamMemberToggle(member.id, !isSelected)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white transition-all ${
                          isSelected
                            ? `${avatarColor} ring-2 ring-offset-2 ring-primary scale-110`
                            : `${avatarColor} opacity-60 group-hover:opacity-100 group-hover:scale-105`
                        }`}
                      >
                        {initials}
                      </div>
                      <span className="text-xs max-w-[60px] truncate">{member.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client Invitations */}
          <div className="space-y-2">
            <Label htmlFor="clientEmails" className="text-sm font-medium flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Invite Clients
            </Label>
            <Input
              id="clientEmails"
              placeholder="client@email.com, another@email.com"
              value={event.inviteClientEmail}
              onChange={useCallback((e) => setEvent(prev => ({ ...prev, inviteClientEmail: e.target.value })), [])}
              className="h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add details..."
              value={event.description}
              onChange={useCallback((e) => setEvent(prev => ({ ...prev, description: e.target.value })), [])}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Notifications */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </Label>
              <Switch
                id="notifications"
                checked={event.notification_enabled || false}
                onCheckedChange={(checked) => setEvent({ ...event, notification_enabled: checked })}
              />
            </div>
            {event.notification_enabled && (
              <Select 
                value={event.notification_minutes?.toString() || '15'}
                onValueChange={(value) => setEvent({ ...event, notification_minutes: parseInt(value) })}
              >
                <SelectTrigger className="h-10">
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
            )}
          </div>

          {/* Google Calendar Badge */}
          {isEditing && appointment?.google_event_id && (
            <Badge variant="secondary" className="w-fit">
              <CalendarDays className="w-3 h-3 mr-1" />
              Synced with Google Calendar
            </Badge>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!event.title || !event.date || !event.startTime || !event.endTime || !isValidDateRange || isLoading}
              className="flex-1 h-10"
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
                  className="h-10 w-10"
                >
                  <Share className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isLoading} className="h-10 w-10">
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
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
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