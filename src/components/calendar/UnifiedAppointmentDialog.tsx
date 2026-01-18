import { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CalendarDays, Clock, MapPin, FileText, Loader2, Trash2, Plus, Minus, Palette, Video, UserPlus, Bell, AlertCircle, Copy, Check, Mail, ChevronDown, Settings2 } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useSendCalendarInvitation } from "@/hooks/useSendCalendarInvitation";
import { useOfflineSupport } from "@/hooks/useOfflineSupport";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useVideoMeetingProviders } from "@/hooks/useVideoMeetingProviders";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EventVisibilitySelector } from "./EventVisibilitySelector";
import { TeamMemberPicker } from "./TeamMemberPicker";
import { useCalendarPreferences } from "@/hooks/useCalendarPreferences";
import { format } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface UnifiedAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedStartTime?: string;
  selectedEndTime?: string;
  appointment?: any;
}

export const UnifiedAppointmentDialog = ({ 
  open, 
  onOpenChange, 
  selectedDate,
  selectedStartTime,
  selectedEndTime,
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
    visibility: "private" as "private" | "team" | "organization",
    shared_with_organization: false
  });

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [syncToCalendars, setSyncToCalendars] = useState(false);
  const [addVideoMeeting, setAddVideoMeeting] = useState(false);
  const [videoProvider, setVideoProvider] = useState<string>('google_meet');
  const [videoLink, setVideoLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  const { user } = useAuth();
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const sendInvitation = useSendCalendarInvitation();
  const { isOnline, queueOfflineOperation } = useOfflineSupport();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { defaultColors, colorOptions } = useCalendarColors();
  const { providers, generateMeetingLink, isGenerating } = useVideoMeetingProviders();
  const { data: preferences } = useCalendarPreferences();
  
  const { data: eventOwnerProfile } = useUserProfile(appointment?.user_id);

  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-appointment-dialog', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[UnifiedAppointmentDialog] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  const hasCreateAppointmentsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_appointments'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  const canCreateAppointments =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasCreateAppointmentsPermission
          : hasCreateAppointmentsPermission;

  const connectedProviders = providers.filter(p => p.connected);
  const selectedProvider = providers.find(p => p.provider === videoProvider);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    const loadAppointment = async () => {
      if (appointment) {
        const { data: { user } } = await supabase.auth.getUser();
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
          shared_with_organization: appointment.shared_with_organization || false
        });
        
        // Expand more options if editing and there's data
        if (appointment.location || appointment.description) {
          setShowMoreOptions(true);
        }
      }
    };
    
    loadAppointment();
    
    if (!appointment && selectedDate) {
      setEvent({
        title: "",
        description: "",
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedStartTime || "09:00",
        endTime: selectedEndTime || "10:00",
        location: "",
        appointment_type: "meeting",
        color: defaultColors[0],
        video_meeting_link: "",
        selectedTeamMembers: [],
        inviteClientEmail: "",
        notification_enabled: true,
        notification_minutes: 15,
        visibility: preferences?.default_event_visibility || "private",
        shared_with_organization: false
      });
      setShowMoreOptions(false);
      setShowAdvanced(false);
    }
  }, [appointment, selectedDate, selectedStartTime, selectedEndTime, defaultColors, preferences]);

  const isValidDateRange = useMemo(() => {
    if (!event.date || !event.startTime || !event.endTime) return true;
    const start = new Date(`${event.date}T${event.startTime}`);
    const end = new Date(`${event.date}T${event.endTime}`);
    return end > start;
  }, [event.date, event.startTime, event.endTime]);

  const handleSubmit = async () => {
    if (!isEditing) {
      const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
      if (isPermissionLoaded && !canCreateAppointments) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to create appointments.",
          variant: "destructive",
        });
        return;
      }
      if (!isPermissionLoaded) {
        toast({
          title: "Loading",
          description: "Please wait while permissions are being checked...",
        });
        return;
      }
    }
    
    if (!event.title || !event.date || !event.startTime || !event.endTime) {
      return;
    }

    if (!isValidDateRange) {
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('timezone')
      .eq('user_id', user.id)
      .maybeSingle();

    const userTimezone = prefs?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const [year, month, day] = event.date.split('-').map(Number);
    const [startHours, startMinutes] = event.startTime.split(':').map(Number);
    const [endHours, endMinutes] = event.endTime.split(':').map(Number);
    
    const localStartDate = new Date(year, month - 1, day, startHours, startMinutes, 0);
    const localEndDate = new Date(year, month - 1, day, endHours, endMinutes, 0);
    
    const startDateTime = fromZonedTime(localStartDate, userTimezone);
    const endDateTime = fromZonedTime(localEndDate, userTimezone);

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
      visibility: event.visibility,
      shared_with_organization: event.visibility === 'organization' || event.shared_with_organization
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
      console.error('Failed to save appointment:', error);
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
      visibility: "private",
      shared_with_organization: false
    });
    setSelectedCalendars([]);
    setSyncToCalendars(false);
    setAddVideoMeeting(false);
    setVideoProvider('google_meet');
    setVideoLink("");
    setCopiedLink(false);
    setInviteEmail("");
    setInviteName("");
    setShowMoreOptions(false);
    setShowAdvanced(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        {/* Compact Header */}
        <DialogHeader className="px-4 py-3 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            {isEditing ? 'Edit Event' : 'New Event'}
            {event.date && (
              <span className="text-muted-foreground font-normal">
                • {format(new Date(event.date), 'MMM d')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-4 py-3 space-y-4">
          {/* Permission Warning */}
          {!isEditing && (() => {
            const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
            if (isPermissionLoaded && !canCreateAppointments) {
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

          {/* Date & Time - Compact inline */}
          <div className="flex items-center gap-2 text-sm">
            <Input
              type="date"
              value={event.date}
              onChange={useCallback((e) => setEvent(prev => ({ ...prev, date: e.target.value })), [])}
              className="w-auto h-8 text-xs"
            />
            <div className="flex items-center gap-1">
              <Input
                type="time"
                value={event.startTime}
                onChange={useCallback((e) => setEvent(prev => ({ ...prev, startTime: e.target.value })), [])}
                className="w-[90px] h-8 text-xs"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="time"
                value={event.endTime}
                onChange={useCallback((e) => setEvent(prev => ({ ...prev, endTime: e.target.value })), [])}
                className="w-[90px] h-8 text-xs"
              />
            </div>
          </div>

          {/* Quick duration chips */}
          <div className="flex items-center gap-1">
            {[30, 60, 90].map((minutes) => (
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

          {/* More Details - Collapsible */}
          <Collapsible open={showMoreOptions} onOpenChange={setShowMoreOptions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
                {showMoreOptions ? 'Less options' : 'Add location, description...'}
                <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
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

              {/* Description */}
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                <Textarea
                  placeholder="Add description"
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
            </CollapsibleContent>
          </Collapsible>

          {/* Advanced Options - Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground">
                <Settings2 className="h-3.5 w-3.5" />
                Advanced options
                <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2">
              {/* Event Type & Color */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Type</Label>
                  <Select value={event.appointment_type} onValueChange={(value) => setEvent({ ...event, appointment_type: value as any })}>
                    <SelectTrigger className="h-8 text-xs">
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
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Color</Label>
                  <Select 
                    value={event.color || defaultColors[0]} 
                    onValueChange={(value) => setEvent({ ...event, color: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: event.color || defaultColors[0] }}
                          />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-xs">{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Visibility</Label>
                <EventVisibilitySelector
                  value={event.visibility}
                  onChange={(value) => setEvent(prev => ({ ...prev, visibility: value }))}
                  hasTeamMembers={event.selectedTeamMembers.length > 0}
                />
              </div>

              {/* Team Members */}
              {(event.visibility === 'team' || event.visibility === 'organization') && (
                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block">Team Members</Label>
                  <TeamMemberPicker
                    selectedMembers={event.selectedTeamMembers}
                    onChange={(members) => setEvent(prev => ({ ...prev, selectedTeamMembers: members }))}
                  />
                </div>
              )}

              {/* Invite Clients */}
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Invite clients (email)"
                  value={event.inviteClientEmail}
                  onChange={useCallback((e) => setEvent(prev => ({ ...prev, inviteClientEmail: e.target.value })), [])}
                  className="h-8 text-xs"
                />
              </div>

              {/* Email Invitation for existing appointments */}
              {isEditing && appointment?.id && (
                <div className="p-2 rounded bg-muted/50 space-y-2">
                  <Label className="text-[10px] text-muted-foreground">Send Email Invitation</Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="recipient@email.com"
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
                        }
                      }}
                      disabled={!inviteEmail || sendInvitation.isPending}
                      className="h-8 text-xs"
                    >
                      {sendInvitation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Footer Actions - Sticky */}
        <div className="px-4 py-3 border-t bg-background sticky bottom-0 flex items-center justify-between gap-2">
          {isEditing && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
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
          
          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!event.title || !event.date || !event.startTime || !event.endTime || !isValidDateRange || isSaving}
              size="sm"
              className="h-8"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                isEditing ? 'Save' : 'Create'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
