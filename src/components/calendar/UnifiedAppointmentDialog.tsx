import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarDays, Clock, MapPin, FileText, Loader2, Trash2, Video, UserPlus, Bell, AlertCircle, Mail, Briefcase, Users } from "lucide-react";
import { TimeSelect, DurationBadge } from "./TimeSelect";
import { DatePickerButton } from "./DatePickerButton";
import { useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useSendCalendarInvitation } from "@/hooks/useSendCalendarInvitation";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useVideoMeetingProviders } from "@/hooks/useVideoMeetingProviders";
import { useUserProfile } from "@/hooks/useUserProfile";
// EventVisibilitySelector removed - visibility auto-determined by team selection
import { TeamMemberPicker } from "./TeamMemberPicker";
import { useCalendarPreferences } from "@/hooks/useCalendarPreferences";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { supabase } from "@/integrations/supabase/client";
import { useHasPermission } from "@/hooks/usePermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface EventPrefill {
  title?: string;
  description?: string;
  appointment_type?: string;
  client_id?: string;
  project_id?: string;
}

interface UnifiedAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedStartTime?: string;
  selectedEndTime?: string;
  appointment?: any;
  prefill?: EventPrefill;
}

export const UnifiedAppointmentDialog = ({
  open,
  onOpenChange,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  appointment,
  prefill,
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
    visibility: "private" as "private" | "team" | "organization",
    shared_with_organization: false,
    client_id: "" as string,
    project_id: "" as string,
  });

  // All form fields are always visible (no collapsible sections)
  const [addVideoMeeting, setAddVideoMeeting] = useState(false);
  const [videoProvider, setVideoProvider] = useState<string>('google_meet');
  const [videoLink, setVideoLink] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [syncToCalendars, setSyncToCalendars] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const sendInvitation = useSendCalendarInvitation();
  const { isOnline, queueOfflineOperation } = useOfflineSupport();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { defaultColors, colorOptions } = useCalendarColors();
  const { providers, generateMeetingLink, isGenerating } = useVideoMeetingProviders();
  const { data: preferences } = useCalendarPreferences();
  
  const { data: eventOwnerProfile } = useUserProfile(appointment?.user_id);

  // Permission check using centralized hook
  const canCreateAppointments = useHasPermission('create_appointments') !== false;

  // Filter projects by selected client (if one is selected)
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!event.client_id) return projects;
    return projects.filter((p: any) => p.client_id === event.client_id);
  }, [projects, event.client_id]);

  const connectedProviders = providers.filter(p => p.connected);
  const selectedProvider = providers.find(p => p.provider === videoProvider);

  useEffect(() => {
    const loadAppointment = async () => {
      if (appointment) {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) return;

        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('timezone')
          .eq('user_id', user.id)
          .maybeSingle();

        const userTimezone = prefs?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        const startDate = new Date(appointment.start_time);
        const endDate = new Date(appointment.end_time);
        
        const zonedStart = TimezoneUtils.toTimezone(startDate, userTimezone);
        const zonedEnd = TimezoneUtils.toTimezone(endDate, userTimezone);
        
        setEvent({
          title: appointment.title || "",
          description: appointment.description || "",
          date: format(zonedStart, 'yyyy-MM-dd'),
          startTime: format(zonedStart, 'HH:mm'),
          endTime: format(zonedEnd, 'HH:mm'),
          location: appointment.location || "",
          appointment_type: appointment.appointment_type || "meeting",
          color: appointment.color || defaultColors[0],
          video_meeting_link: appointment.video_meeting_link || "",
          selectedTeamMembers: appointment.team_member_ids || [],
          inviteClientEmail: appointment.invited_client_emails?.join(', ') || "",
          notification_enabled: appointment.notification_enabled || false,
          notification_minutes: appointment.notification_minutes || 15,
          visibility: appointment.visibility || "private",
          shared_with_organization: appointment.shared_with_organization || false,
          client_id: appointment.client_id || "",
          project_id: appointment.project_id || "",
        });
        
        // All fields always visible - no expand needed
      }
    };
    
    loadAppointment();
    
    if (!appointment && selectedDate) {
      setEvent({
        title: prefill?.title || "",
        description: prefill?.description || "",
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedStartTime || "09:00",
        endTime: selectedEndTime || "09:30",
        location: "",
        appointment_type: (prefill?.appointment_type || "meeting") as any,
        color: defaultColors[0],
        video_meeting_link: "",
        selectedTeamMembers: [],
        inviteClientEmail: "",
        notification_enabled: true,
        notification_minutes: 15,
        visibility: preferences?.default_event_visibility || "private",
        shared_with_organization: false,
        client_id: prefill?.client_id || "",
        project_id: prefill?.project_id || "",
      });
    }
  }, [appointment, selectedDate, selectedStartTime, selectedEndTime, defaultColors, preferences, prefill]);

  const isValidDateRange = useMemo(() => {
    if (!event.date || !event.startTime || !event.endTime) return true;
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    return end > start;
  }, [event.date, event.startTime, event.endTime]);

  const handleSubmit = async () => {
    if (!isEditing && !canCreateAppointments) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create appointments.",
        variant: "destructive",
      });
      return;
    }
    
    if (!event.title || !event.date || !event.startTime || !event.endTime) {
      return;
    }

    if (!isValidDateRange) {
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const currentUser = authData.user;

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('timezone')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    const userTimezone = prefs?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get browser's timezone for comparison
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const [year, month, day] = event.date.split('-').map(Number);
    const [startHours, startMinutes] = event.startTime.split(':').map(Number);
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);
    
    // Create date objects in browser's local timezone
    const localStartDate = new Date(year, month - 1, day, startHours, startMinutes, 0);
    const localEndDate = new Date(year, month - 1, day, endHours, endMinutes, 0);
    
    // If browser timezone matches user preference, use local dates directly
    // Otherwise, apply timezone conversion for users who set a different timezone
    let startDateTime: Date;
    let endDateTime: Date;
    
    if (browserTimezone === userTimezone) {
      // Browser timezone matches preference - no conversion needed
      // new Date() already creates time in browser's local timezone
      startDateTime = localStartDate;
      endDateTime = localEndDate;
    } else {
      // User has set a different timezone than their browser
      // fromZonedTime converts "time as displayed in userTimezone" to UTC
      startDateTime = fromZonedTime(localStartDate, userTimezone);
      endDateTime = fromZonedTime(localEndDate, userTimezone);
    }

    const appointmentData = {
      title: event.title,
      description: event.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: event.location,
      appointment_type: event.appointment_type,
      color: event.color,
      video_meeting_link: videoProvider === 'manual' ? videoLink : event.video_meeting_link,
      video_provider: addVideoMeeting ? videoProvider : null,
      team_member_ids: event.selectedTeamMembers,
      invited_client_emails: event.inviteClientEmail ? event.inviteClientEmail.split(',').map(email => email.trim()) : [],
      notification_enabled: event.notification_enabled,
      notification_minutes: event.notification_minutes,
      visibility: event.selectedTeamMembers.length > 0 ? 'team' : 'private',
      shared_with_organization: event.shared_with_organization,
      client_id: event.client_id || null,
      project_id: event.project_id || null,
    };

    try {
      if (isOnline) {
        if (isEditing) {
          await updateAppointment.mutateAsync({ 
            id: appointment.id, 
            ...appointmentData 
          } as any);
        } else {
          const newAppointment = await createAppointment.mutateAsync(appointmentData as any);
          
          if (addVideoMeeting && videoProvider !== 'manual' && newAppointment?.id) {
            const duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
            Promise.resolve().then(() => {
              generateMeetingLink({
                appointmentId: newAppointment.id,
                provider: videoProvider as any,
                title: event.title,
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                duration
              });
            });
          }
        }
        
        onOpenChange(false);
        resetForm();
      } else {
        if (isEditing) {
          queueOfflineOperation('update', 'appointments', { id: appointment.id, ...appointmentData });
        } else {
          queueOfflineOperation('create', 'appointments', appointmentData);
        }
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      // Error handled by React Query's onError
    }
  };

  const handleDelete = async () => {
    if (!appointment || !appointment.id || deleteAppointment.isPending) {
      return;
    }
    
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error handled by React Query's onError
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
      visibility: "private",
      shared_with_organization: false,
      client_id: "",
      project_id: "",
    });
    setSelectedCalendars([]);
    setSyncToCalendars(false);
    setAddVideoMeeting(false);
    setVideoProvider('google_meet');
    setVideoLink("");
    setCopiedLink(false);
    setInviteEmail("");
    setInviteName("");
  };

  const adjustTime = (field: 'startTime' | 'endTime', minutes: number) => {
    setEvent(prev => {
      const currentTime = prev[field];
      const [hours, mins] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const clampedMinutes = Math.max(0, Math.min(1439, totalMinutes));
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

  const isSaving = createAppointment.isPending || updateAppointment.isPending;

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-radix-popper-content-wrapper]')) return;
      if (target.closest('[data-radix-scroll-area-viewport]')) return;
      if (target.closest('[data-radix-select-content]')) return;
      if (target.closest('[role="alertdialog"]')) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        onOpenChange(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
      <div
        ref={panelRef}
        className="pointer-events-auto max-w-md w-[calc(100%-2rem)] rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col"
        style={{ maxHeight: '85vh' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Color header bar */}
        <div className="h-2 flex-shrink-0 rounded-t-xl" style={{ backgroundColor: event.color || '#6366F1' }} />

        {/* Compact Header */}
        <div className="px-4 py-3">
          <div className="text-sm font-medium flex items-center gap-2">
            <div
              className="w-3 h-3 rounded flex-shrink-0"
              style={{ backgroundColor: event.color || '#6366F1' }}
            />
            {isEditing ? 'Edit Event' : 'New Event'}
            {event.date && (
              <span className="text-muted-foreground font-normal">
                • {format(new Date(event.date), 'MMM d')}
              </span>
            )}
          </div>
        </div>
        <ScrollArea style={{ maxHeight: 'calc(85vh - 120px)' }}>
        <div className="px-4 py-3 space-y-3">
          {/* Permission Warning */}
          {!isEditing && (() => {
            if (!canCreateAppointments) {
              return (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="text-xs">
                    You don't have permission to create appointments.
                  </AlertDescription>
                </Alert>
              );
            }
            return null;
          })()}
          
          {/* Title - Large and prominent */}
          <Input
            placeholder="Add title"
            value={event.title}
            onChange={useCallback((e) => setEvent(prev => ({ ...prev, title: e.target.value })), [])}
            className="text-base font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          />

          {/* Date & Time - Polished pickers */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <DatePickerButton
              value={event.date}
              onChange={useCallback((value) => setEvent(prev => ({ ...prev, date: value })), [])}
            />
            <div className="flex items-center gap-1.5">
              <TimeSelect
                value={event.startTime}
                onChange={useCallback((value) => setEvent(prev => ({ ...prev, startTime: value })), [])}
              />
              <span className="text-muted-foreground text-xs">–</span>
              <TimeSelect
                value={event.endTime}
                onChange={useCallback((value) => setEvent(prev => ({ ...prev, endTime: value })), [])}
              />
              <DurationBadge startTime={event.startTime} endTime={event.endTime} />
            </div>
          </div>

          {/* Quick duration chips */}
          <div className="flex items-center gap-1">
            {[25, 30, 45, 60, 90].map((minutes) => (
              <Button
                key={minutes}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDuration(minutes)}
                className="h-6 px-2 text-[10px]"
              >
                {minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}
              </Button>
            ))}
          </div>

          {!isValidDateRange && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">End time must be after start time</AlertDescription>
            </Alert>
          )}

          {/* Event Type & Color indicator */}
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1 block">Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "meeting", label: "Meeting", color: "#3B82F6" },
                { value: "consultation", label: "Consult", color: "#22C55E" },
                { value: "measurement", label: "Measure", color: "#8B5CF6" },
                { value: "installation", label: "Install", color: "#F59E0B" },
                { value: "follow_up", label: "Follow-up", color: "#06B6D4" },
                { value: "reminder", label: "Reminder", color: "#F97316" },
                { value: "call", label: "Call", color: "#EF4444" },
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    event.appointment_type === type.value
                      ? 'ring-2 ring-offset-1 shadow-sm'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: `${type.color}20`,
                    color: type.color,
                  }}
                  onClick={() => setEvent(prev => ({
                    ...prev,
                    appointment_type: type.value as any,
                    // Only set color from type when no team group is selected
                    ...(prev.selectedTeamMembers.length === 0 ? { color: type.color } : {}),
                  }))}

                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Client & Job Linking — always visible for reception workflow */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" /> Client
              </Label>
              <Select
                value={event.client_id || "none"}
                onValueChange={(value) => {
                  const newClientId = value === "none" ? "" : value;
                  setEvent(prev => ({
                    ...prev,
                    client_id: newClientId,
                    project_id: newClientId !== prev.client_id ? "" : prev.project_id,
                  }));
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none"><span className="text-muted-foreground">None</span></SelectItem>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Job
              </Label>
              <Select
                value={event.project_id || "none"}
                onValueChange={(value) => setEvent(prev => ({ ...prev, project_id: value === "none" ? "" : value }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none"><span className="text-muted-foreground">None</span></SelectItem>
                  {filteredProjects?.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name || project.title || `Job #${project.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members — always visible for delegation */}
          <div>
            <TeamMemberPicker
              selectedMembers={event.selectedTeamMembers}
              onChange={(members) => setEvent(prev => ({ ...prev, selectedTeamMembers: members }))}
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Add location"
              value={event.location}
              onChange={useCallback((e) => setEvent(prev => ({ ...prev, location: e.target.value })), [])}
              className="h-8 text-xs"
            />
          </div>

          {/* Note */}
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
            <Textarea
              placeholder="Add a note..."
              value={event.description}
              onChange={useCallback((e) => setEvent(prev => ({ ...prev, description: e.target.value })), [])}
              rows={2}
              className="resize-none text-xs"
            />
          </div>

          {/* Video Meeting Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Add video conferencing</span>
            </div>
            <Switch
              checked={addVideoMeeting}
              onCheckedChange={setAddVideoMeeting}
            />
          </div>

          {addVideoMeeting && (
            <div className="pl-6 space-y-2">
              <Select value={videoProvider} onValueChange={setVideoProvider}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{selectedProvider?.icon}</span>
                      <span>{selectedProvider?.name}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {connectedProviders.map((provider) => (
                    <SelectItem key={provider.provider} value={provider.provider!}>
                      <div className="flex items-center gap-2 text-xs">
                        <span>{provider.icon}</span>
                        <span>{provider.name}</span>
                        {provider.connected && provider.provider !== 'manual' && (
                          <Badge variant="secondary" className="text-[10px] h-4">Auto</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {videoProvider === 'manual' && (
                <Input
                  placeholder="Paste meeting link..."
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="h-8 text-xs"
                />
              )}
            </div>
          )}

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">Reminder</span>
            </div>
            <div className="flex items-center gap-2">
              {event.notification_enabled && (
                <Select
                  value={event.notification_minutes.toString()}
                  onValueChange={(v) => setEvent(prev => ({ ...prev, notification_minutes: parseInt(v) }))}
                >
                  <SelectTrigger className="h-7 w-20 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Switch
                checked={event.notification_enabled}
                onCheckedChange={(checked) => setEvent(prev => ({ ...prev, notification_enabled: checked }))}
              />
            </div>
          </div>

          {/* Send Email Invitation */}
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              type="email"
              placeholder="Invite by email..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="h-8 text-xs flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (inviteEmail && appointment?.id) {
                  sendInvitation.mutate({
                    appointmentId: appointment.id,
                    recipientEmail: inviteEmail,
                    recipientName: inviteName || undefined
                  });
                  setInviteEmail("");
                  setInviteName("");
                } else if (inviteEmail) {
                  setEvent(prev => ({ ...prev, inviteClientEmail: inviteEmail }));
                  setInviteEmail("");
                  toast({ title: "Email added", description: "Invitation will be sent when the event is saved." });
                }
              }}
              disabled={!inviteEmail || sendInvitation.isPending}
              className="h-8 text-xs"
            >
              {sendInvitation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        </ScrollArea>

        {/* Footer Actions - Clean and minimal */}
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between gap-2">
          {isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                  disabled={deleteAppointment.isPending}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this event. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!event.title || !event.date || !event.startTime || !event.endTime || !isValidDateRange || isSaving}
              size="sm"
              className="h-7 px-4 text-xs"
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                isEditing ? 'Save' : 'Create'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
