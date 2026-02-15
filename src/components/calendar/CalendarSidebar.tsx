import { ChevronLeft, ChevronRight, Clock, MapPin, Eye, EyeOff, Plus, MoreHorizontal, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { format, isToday, isSameDay } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { useGoogleCalendarIntegration } from "@/hooks/useGoogleCalendar";
import { useOutlookCalendarIntegration } from "@/hooks/useOutlookCalendar";
import { useNylasCalendarIntegration } from "@/hooks/useNylasCalendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendarTeamGroups, type CalendarTeamGroup } from "@/hooks/useCalendarTeamGroups";
import { TeamGroupManager } from "./TeamGroupManager";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CalendarSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onBookingLinks: () => void;
  onHiddenSourcesChange?: (hiddenSources: Set<string>) => void;
}

// Calendar source definition
interface CalendarSource {
  id: string;
  label: string;
  color: string;
  connected: boolean;
}

export const CalendarSidebar = ({ currentDate, onDateChange, onBookingLinks, onHiddenSourcesChange }: CalendarSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("calendar.sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const [sidebarDate, setSidebarDate] = useState<Date | undefined>(currentDate);

  // Keep sidebar mini-calendar in sync when parent navigates (toolbar arrows, Today button)
  useEffect(() => {
    setSidebarDate(currentDate);
  }, [currentDate]);

  const [hiddenSources, setHiddenSources] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("calendar.hiddenSources");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const { data: appointments } = useAppointments();
  const { data: bookedAppointments } = useAppointmentBookings();
  const { isConnected: googleConnected } = useGoogleCalendarIntegration();
  const { isConnected: outlookConnected } = useOutlookCalendarIntegration();
  const { isConnected: nylasConnected } = useNylasCalendarIntegration();

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem("calendar.sidebarCollapsed", String(next)); } catch {}
      return next;
    });
  };

  const toggleSource = (sourceId: string) => {
    setHiddenSources(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      try { localStorage.setItem("calendar.hiddenSources", JSON.stringify([...next])); } catch {}
      onHiddenSourcesChange?.(next);
      return next;
    });
  };

  // Notify parent of initial hidden sources on mount
  useEffect(() => {
    if (hiddenSources.size > 0) {
      onHiddenSourcesChange?.(hiddenSources);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSidebarDate(date);
      onDateChange(date);
    }
  };

  // Dates that have events (for mini calendar dot indicators)
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    appointments?.forEach(apt => {
      const d = new Date(apt.start_time);
      if (!isNaN(d.getTime())) dates.add(format(d, 'yyyy-MM-dd'));
    });
    bookedAppointments?.forEach(b => {
      if (b.appointment_date) dates.add(b.appointment_date);
    });
    return dates;
  }, [appointments, bookedAppointments]);

  // Next up event
  const nextUpEvent = useMemo(() => {
    if (!appointments) return null;
    const now = new Date();
    const todayEvents = appointments
      .filter(a => {
        const s = new Date(a.start_time);
        return !isNaN(s.getTime()) && isToday(s) && new Date(a.end_time) > now;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return todayEvents[0] || null;
  }, [appointments]);

  // Calendar sources list
  const calendarSources: CalendarSource[] = useMemo(() => {
    const sources: CalendarSource[] = [
      { id: 'personal', label: 'My Calendar', color: '#6366F1', connected: true },
      { id: 'bookings', label: 'Bookings', color: '#3B82F6', connected: (bookedAppointments?.length ?? 0) > 0 },
    ];
    if (googleConnected) sources.push({ id: 'google', label: 'Google Calendar', color: '#4285F4', connected: true });
    if (outlookConnected) sources.push({ id: 'outlook', label: 'Outlook', color: '#0078D4', connected: true });
    if (nylasConnected) sources.push({ id: 'nylas', label: 'Nylas Calendar', color: '#0052CC', connected: true });
    return sources;
  }, [googleConnected, outlookConnected, nylasConnected, bookedAppointments]);

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="w-12 min-w-12 border-r bg-background flex flex-col h-full flex-shrink-0 transition-all duration-300 overflow-hidden">
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="w-8 h-8"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[280px] min-w-[280px] max-w-[280px] border-r bg-background flex flex-col h-full flex-shrink-0 transition-all duration-300 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0" style={{ overflowX: 'hidden' }}>
        <div className="flex flex-col px-3 py-4 overflow-x-hidden" style={{ width: '256px', maxWidth: '256px' }}>
          {/* Header with collapse */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Calendar</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="h-7 w-7 p-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Mini Calendar — no card wrapper, cleaner look */}
          <div className="mb-4">
            <Calendar
              mode="single"
              selected={sidebarDate}
              onSelect={handleDateSelect}
              className="rounded-lg border-0 p-0 w-full"
              modifiers={{
                hasEvent: (date) => eventDates.has(format(date, 'yyyy-MM-dd')),
              }}
              modifiersClassNames={{
                hasEvent: 'has-event-dot',
              }}
              classNames={{
                months: "flex flex-col space-y-3 w-full",
                month: "space-y-3 w-full",
                caption: "flex justify-center pt-0.5 relative items-center",
                caption_label: "text-sm font-semibold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-accent",
                nav_button_previous: "absolute left-0",
                nav_button_next: "absolute right-0",
                table: "w-full border-collapse",
                head_row: "grid grid-cols-7 w-full",
                head_cell: "text-muted-foreground/60 rounded-md flex-1 text-center font-medium text-[10px] uppercase tracking-wider",
                row: "grid grid-cols-7 w-full mt-1",
                cell: "relative p-0 text-center text-sm flex-1 min-w-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-md",
                day: "h-8 w-8 p-0 text-xs font-normal hover:bg-accent hover:text-accent-foreground rounded-md aria-selected:opacity-100 mx-auto transition-colors",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground/30",
                day_disabled: "text-muted-foreground/30",
                day_hidden: "invisible",
              }}
            />
          </div>

          {/* Next Up */}
          {nextUpEvent && (
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5 px-0.5">
                Next Up
              </div>
              <div
                className="rounded-lg p-2.5 cursor-pointer hover:bg-accent/40 transition-colors"
                style={{
                  backgroundColor: `${nextUpEvent.color || '#6366F1'}08`,
                }}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse"
                    style={{ backgroundColor: nextUpEvent.color || '#6366F1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{nextUpEvent.title}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="tabular-nums">
                        {format(new Date(nextUpEvent.start_time), 'h:mm a')}
                        {nextUpEvent.end_time && ` – ${format(new Date(nextUpEvent.end_time), 'h:mm a')}`}
                      </span>
                    </div>
                    {nextUpEvent.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{nextUpEvent.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendars List - Apple/Google style source toggles */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-0.5">
              Calendars
            </div>
            <div className="space-y-0.5">
              {calendarSources.map(source => {
                const isVisible = !hiddenSources.has(source.id);
                return (
                  <button
                    key={source.id}
                    type="button"
                    className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors text-left group"
                    onClick={() => toggleSource(source.id)}
                  >
                    {/* Checkbox with source color */}
                    <div
                      className={`w-3.5 h-3.5 rounded flex-shrink-0 border transition-all flex items-center justify-center ${
                        isVisible ? 'border-transparent' : 'border-muted-foreground/30 bg-transparent'
                      }`}
                      style={isVisible ? { backgroundColor: source.color } : {}}
                    >
                      {isVisible && (
                        <svg width="8" height="8" viewBox="0 0 10 10" className="text-white">
                          <path d="M2 5l2.5 2.5L8 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${isVisible ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {source.label}
                    </span>
                    {/* Connected indicator dot */}
                    {source.connected && source.id !== 'personal' && source.id !== 'bookings' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* My Teams - Apple Calendar style groups */}
          <TeamGroupsSidebar
            hiddenSources={hiddenSources}
            toggleSource={toggleSource}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

// Sub-component for team groups section
const TeamGroupsSidebar = ({
  hiddenSources,
  toggleSource,
}: {
  hiddenSources: Set<string>;
  toggleSource: (id: string) => void;
}) => {
  const { data: teamGroups = [] } = useCalendarTeamGroups();
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CalendarTeamGroup | null>(null);

  return (
    <div className="mt-4 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          My Teams
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => { setEditingGroup(null); setShowGroupManager(true); }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-0.5">
        {teamGroups.map(group => {
          const sourceId = `team-group-${group.id}`;
          const isVisible = !hiddenSources.has(sourceId);
          return (
            <div
              key={group.id}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md hover:bg-accent/40 transition-colors group"
            >
              <button
                type="button"
                className="flex items-center gap-2.5 flex-1 text-left"
                onClick={() => toggleSource(sourceId)}
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex-shrink-0 border transition-all flex items-center justify-center ${
                    isVisible ? 'border-transparent' : 'border-muted-foreground/30 bg-transparent'
                  }`}
                  style={isVisible ? { backgroundColor: group.color } : {}}
                >
                  {isVisible && (
                    <svg width="8" height="8" viewBox="0 0 10 10" className="text-white">
                      <path d="M2 5l2.5 2.5L8 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 ${isVisible ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                  {group.name}
                </span>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                  {group.member_ids?.length || 0}
                </span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => { setEditingGroup(group); setShowGroupManager(true); }}>
                    Edit group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {teamGroups.length === 0 && (
          <div
            className="rounded-lg border border-dashed border-border/60 p-3 text-center cursor-pointer hover:bg-accent/30 transition-colors"
            onClick={() => { setEditingGroup(null); setShowGroupManager(true); }}
          >
            <Users className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1.5" />
            <div className="text-xs font-medium text-foreground/70">Create a team group</div>
            <div className="text-[10px] text-muted-foreground/50 mt-0.5">Share events with your team automatically</div>
          </div>
        )}
      </div>

      <TeamGroupManager
        open={showGroupManager}
        onOpenChange={setShowGroupManager}
        editGroup={editingGroup}
      />
    </div>
  );
};
