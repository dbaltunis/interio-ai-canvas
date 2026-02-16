import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Clock, ChevronRight, ChevronUp, MapPin, Video, Briefcase, Bell, Mail } from "lucide-react";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useCalendarPermissions } from "@/hooks/useCalendarPermissions";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { DURATION_CHIPS, EVENT_TYPES } from "./calendarConstants";
import { useCalendarTeamGroups } from "@/hooks/useCalendarTeamGroups";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TeamMemberPicker } from "./TeamMemberPicker";

interface QuickAddPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  startTime: string;
  endTime?: string;
  onMoreOptions?: (prefill: { title: string; date: Date; startTime: string; endTime: string; color: string; type: string }) => void;
  anchorPosition?: { x: number; y: number };
  children?: React.ReactNode;
}

export const QuickAddPopover = ({
  open,
  onOpenChange,
  date,
  startTime,
  endTime: initialEndTime,
  onMoreOptions,
  anchorPosition,
}: QuickAddPopoverProps) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Expanded fields
  const [appointmentType, setAppointmentType] = useState("meeting");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [addVideoMeeting, setAddVideoMeeting] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationMinutes, setNotificationMinutes] = useState(15);
  const [inviteEmail, setInviteEmail] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const createAppointment = useCreateAppointment();
  const { canCreateAppointments, isPermissionLoaded } = useCalendarPermissions();
  const { toast } = useToast();
  const { data: teamMembers } = useTeamMembers();
  const { data: teamGroups = [] } = useCalendarTeamGroups();
  const { data: clients = [] } = useClients(expanded);
  const { data: projects = [] } = useProjects({ enabled: expanded });

  // Determine effective color from team group
  const selectedGroup = teamGroups.find(g => g.id === selectedGroupId);
  const effectiveColor = selectedGroup?.color || "#6366F1";

  // Dynamic positioning state
  const [position, setPosition] = useState({ left: 0, top: 0, maxH: 480 });

  // Calculate initial duration from startTime-endTime range
  useEffect(() => {
    if (initialEndTime && startTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = initialEndTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0 && diff <= 180) {
        setSelectedDuration(diff);
      }
    }
  }, [startTime, initialEndTime]);

  // Auto-focus input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setTitle("");
      setNote("");
      setSelectedDuration(30);
      setSelectedGroupId(null);
      setExpanded(false);
      setAppointmentType("meeting");
      setClientId("");
      setProjectId("");
      setSelectedTeamMembers([]);
      setLocation("");
      setAddVideoMeeting(false);
      setVideoLink("");
      setNotificationEnabled(false);
      setNotificationMinutes(15);
      setInviteEmail("");
    }
  }, [open]);

  // Measure popover and clamp to viewport after render
  useLayoutEffect(() => {
    if (!open || !popoverRef.current) return;
    const popoverWidth = expanded ? 384 : 320;
    const padding = 16;

    let left = anchorPosition?.x ?? 200;
    let top = anchorPosition?.y ?? 200;

    if (typeof window !== 'undefined') {
      // Horizontal clamping
      if (left + popoverWidth > window.innerWidth - padding) {
        left = Math.max(padding, (anchorPosition?.x ?? 200) - popoverWidth - 8);
      }

      const maxAllowed = expanded ? window.innerHeight * 0.85 : 480;
      // Vertical clamping: ensure footer stays in viewport
      const availableHeight = window.innerHeight - top - padding;
      const maxH = Math.max(200, Math.min(maxAllowed, availableHeight));

      // If not enough space even with clamped height, move popover up
      if (maxH < 280) {
        top = Math.max(padding, window.innerHeight - 400 - padding);
        setPosition({ left, top, maxH: Math.min(maxAllowed, window.innerHeight - top - padding) });
      } else {
        setPosition({ left, top, maxH });
      }
    }
  }, [open, anchorPosition, expanded]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close when clicking inside radix popovers, scroll areas, or select content
      if (target.closest('[data-radix-popper-content-wrapper]')) return;
      if (target.closest('[data-radix-scroll-area-viewport]')) return;
      if (target.closest('[data-radix-select-content]')) return;
      if (popoverRef.current && !popoverRef.current.contains(target)) {
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

  const computedEndTime = useCallback(() => {
    const parts = startTime.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const totalMinutes = h * 60 + m + selectedDuration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  }, [startTime, selectedDuration]);

  const handleSave = async () => {
    if (!title.trim()) {
      inputRef.current?.focus();
      return;
    }

    if (isPermissionLoaded && !canCreateAppointments) {
      toast({ title: "Permission Denied", description: "You don't have permission to create appointments.", variant: "destructive" });
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const end = computedEndTime();

    const [year, month, day] = dateStr.split('-').map(Number);
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startDate = new Date(year, month - 1, day, startH || 0, startM || 0, 0);
    const endDate = new Date(year, month - 1, day, endH || 0, endM || 0, 0);

    try {
      await createAppointment.mutateAsync({
        title: title.trim(),
        description: note.trim() || undefined,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        color: effectiveColor,
        team_member_ids: selectedTeamMembers.length > 0 ? selectedTeamMembers : (selectedGroup?.member_ids || []),
        visibility: selectedGroup || selectedTeamMembers.length > 0 ? 'team' : 'private',
        calendar_group_id: selectedGroupId || undefined,
        ...(expanded && {
          appointment_type: appointmentType,
          client_id: clientId || undefined,
          project_id: projectId || undefined,
          location: location.trim() || undefined,
          video_meeting_link: addVideoMeeting ? videoLink.trim() || undefined : undefined,
          notification_enabled: notificationEnabled,
          notification_minutes: notificationEnabled ? notificationMinutes : undefined,
          invited_client_emails: inviteEmail.trim() ? [inviteEmail.trim()] : undefined,
        }),
      } as any);
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!open) return null;

  const endTimeStr = computedEndTime();

  return (
    <div
      ref={popoverRef}
      className={`fixed z-[10000] rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col transition-all duration-200 ${expanded ? 'w-96' : 'w-80'}`}
      style={{ left: position.left, top: position.top, maxHeight: `${position.maxH}px` }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Color header bar */}
      <div className="h-2 flex-shrink-0" style={{ backgroundColor: effectiveColor }} />

      {/* Date/time header */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2 text-sm flex-shrink-0">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold text-foreground">{format(date, 'EEE, MMM d')}</span>
        <span className="text-muted-foreground">&middot;</span>
        <span className="tabular-nums text-muted-foreground">{startTime} &ndash; {endTimeStr}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-auto" style={{ maxHeight: `calc(${position.maxH}px - 96px)` }}>
        <div className="px-3 pb-3 space-y-3">
          {/* Title input */}
          <Input
            ref={inputRef}
            placeholder="Event title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-10 text-base font-medium border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
            autoComplete="off"
          />

          {/* Duration chips */}
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Duration</div>
            <div className="flex gap-1.5">
              {DURATION_CHIPS.map(chip => (
                <button
                  key={chip.minutes}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selectedDuration === chip.minutes
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setSelectedDuration(chip.minutes)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Group Selector */}
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Calendar</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  !selectedGroupId
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setSelectedGroupId(null)}
              >
                My Calendar
              </button>
              {teamGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    selectedGroupId === group.id
                      ? 'ring-2 ring-offset-1 shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  style={selectedGroupId === group.id ? { backgroundColor: `${group.color}20`, color: group.color } : {}}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                  {group.name}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Note</div>
            <Textarea
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={expanded ? 3 : 2}
              className="resize-none text-xs min-h-[52px]"
            />
          </div>

          {/* ===== EXPANDED FIELDS ===== */}
          {expanded && (
            <div className="space-y-3 pt-1 border-t border-border/40">
              {/* Client Selector */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3" /> Client
                </div>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select client..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project/Job Selector */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3" /> Job
                </div>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select job..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No job</SelectItem>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Members */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Team Members</div>
                <TeamMemberPicker
                  selectedMembers={selectedTeamMembers}
                  onChange={setSelectedTeamMembers}
                />
              </div>

              {/* Location */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Location
                </div>
                <Input
                  placeholder="Add location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Video Meeting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Video className="h-3.5 w-3.5" />
                  <span>Video meeting</span>
                </div>
                <Switch checked={addVideoMeeting} onCheckedChange={setAddVideoMeeting} />
              </div>
              {addVideoMeeting && (
                <Input
                  placeholder="Paste video link..."
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="h-9 text-xs"
                />
              )}

              {/* Reminders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Reminder</span>
                </div>
                <Switch checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />
              </div>
              {notificationEnabled && (
                <Select value={String(notificationMinutes)} onValueChange={(v) => setNotificationMinutes(Number(v))}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Email Invite */}
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email Invite
                </div>
                <Input
                  type="email"
                  placeholder="client@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions - sticky at bottom */}
      <div className="px-3 py-2 border-t bg-popover flex items-center gap-2 flex-shrink-0">
        <Button
          size="default"
          className="flex-1 h-9"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSave();
          }}
          disabled={createAppointment.isPending || !title.trim()}
        >
          {createAppointment.isPending ? 'Creating...' : 'Save'}
        </Button>
        <Button
          size="default"
          variant="ghost"
          className="h-9 text-sm text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setExpanded(!expanded);
          }}
        >
          {expanded ? 'Less options' : 'More options'}
          {expanded ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronRight className="h-3.5 w-3.5 ml-1" />}
        </Button>
      </div>
    </div>
  );
};
