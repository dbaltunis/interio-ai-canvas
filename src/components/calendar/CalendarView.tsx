import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Settings, Link2, Clock, Users, ChevronLeft, ChevronRight, MapPin, Palette, UserPlus, Video, Share, Bell, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday, addWeeks, subWeeks } from "date-fns";
import { MobileCalendarView } from "./MobileCalendarView";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useBookedAppointments } from "@/hooks/useBookedAppointments";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { CalendarSidebar } from "./CalendarSidebar";
import { WeeklyCalendarView } from "./WeeklyCalendarView";
import { DailyCalendarView } from "./DailyCalendarView";
import { AppointmentSchedulerSlider } from "./AppointmentSchedulerSlider";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";

import { DurationPicker } from "./TimePicker";
// CalDAV imports removed - using Google Calendar OAuth only
import { UnifiedAppointmentDialog } from "./UnifiedAppointmentDialog";
import { OfflineIndicator } from "./OfflineIndicator";
import { CalendarSharingDialog } from "./sharing/CalendarSharingDialog";
import { CalendarColorPicker } from "./colors/CalendarColorPicker";
import { CalendarFilters, CalendarFilterState } from "./CalendarFilters";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useCalendarPreferences } from "@/hooks/useCalendarPreferences";
import { supabase } from "@/integrations/supabase/client";
// Two-way sync removed - using Google Calendar OAuth only
import { ConflictDialog } from "./ConflictDialog";
import { useCompactMode } from "@/hooks/useCompactMode";
import { TimezoneSettingsDialog } from "./timezone/TimezoneSettingsDialog";
import { useTimezone } from "@/hooks/useTimezone";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { CalendarSyncToolbar } from "./CalendarSyncToolbar";
import { SchedulerManagement } from "./SchedulerManagement";
import { formatUserTime, formatUserDate } from "@/utils/dateFormatUtils";
import { BookingManagement } from "./BookingManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { Shield, ListTodo } from "lucide-react";
import { TaskListView } from "@/components/tasks/TaskListView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalendarView = 'month' | 'week' | 'day';

interface CalendarViewProps {
  projectId?: string;
}

const CalendarView = ({ projectId }: CalendarViewProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const canViewCalendar = useHasPermission('view_calendar');
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = !isMobile && !isTablet;

  // Permission checks for creating appointments
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  const { data: userPermissions, isLoading: permissionsLoading } = useUserPermissions();
  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-calendar-view', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[CalendarView] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  // Check if create_appointments is explicitly in user_permissions table
  const hasCreateAppointmentsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_appointments'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  // Only allow create if user is System Owner OR (Owner/Admin *without* explicit permissions) OR (explicit permissions include create_appointments)
  const canCreateAppointments =
    userRoleData?.isSystemOwner
      ? true
      : (isOwner || isAdmin)
          ? !hasAnyExplicitPermissions || hasCreateAppointmentsPermission
          : hasCreateAppointmentsPermission;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Pre-select today
  const [selectedStartTime, setSelectedStartTime] = useState<string>("09:00");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("10:00");
  const [view, setView] = useState<CalendarView>('week'); // Default to week view
  const [showTasksView, setShowTasksView] = useState(false); // Toggle between calendar and tasks
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showSchedulerSlider, setShowSchedulerSlider] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  // Appointment scheduling dialogs
  const [showSchedulerManagement, setShowSchedulerManagement] = useState(false);
  const [showBookingManagement, setShowBookingManagement] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  // CalDAV sync removed
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Auto-switch from month view on tablet
  useEffect(() => {
    if (isTablet && view === 'month') {
      setView('week');
    }
  }, [isTablet, view]);
  const [showSharingDialog, setShowSharingDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showSlotConflictDialog, setShowSlotConflictDialog] = useState(false);
  const [showTimezoneDialog, setShowTimezoneDialog] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState<any[]>([]);
  const [conflictData, setConflictData] = useState<{
    conflictingEvents: any[];
    proposedSlot: { date: Date; time: string };
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filters, setFilters] = useState<CalendarFilterState>({
    searchTerm: "",
    userIds: [],
    eventTypes: [],
    statuses: []
  });
  
  // Enable real-time updates
  useRealtimeBookings();
  
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: schedulers } = useAppointmentSchedulers();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { getColorForSource, getVisibilityForSource, addCalendarSource } = useCalendarColors();
  const createAppointment = useCreateAppointment();
  const { userTimezone, isTimezoneDifferent } = useTimezone();
  const { data: preferences } = useCalendarPreferences();
  const { data: userPreferences } = useUserPreferences();
  
  // Get user's timezone for date conversions
  const displayTimezone = userPreferences?.timezone || userTimezone;
  
  // Get current user ID for visibility filtering
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // newEvent state removed - using UnifiedAppointmentDialog now

  // Check permissions BEFORE returning any view
  if (canViewCalendar === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-lg text-muted-foreground">Loading calendar...</div>
        </div>
      </div>
    );
  }

  if (!canViewCalendar) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Access Denied</h3>
              <p className="text-muted-foreground text-sm mt-1">
                You don't have permission to access the calendar. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Return mobile view for mobile devices (AFTER all hooks are called)
  if (isMobile) {
    return <MobileCalendarView />;
  }

  const getEventsForDate = (date: Date) => {
    if (!appointments) return [];
    return appointments.filter(appointment => {
      // Format both dates in user's timezone for comparison
      const appointmentDateStr = TimezoneUtils.formatInTimezone(appointment.start_time, displayTimezone, 'yyyy-MM-dd');
      const filterDateStr = TimezoneUtils.formatInTimezone(date.toISOString(), displayTimezone, 'yyyy-MM-dd');
      console.log('[CalendarView] Filtering for date:', {
        title: appointment.title,
        utcTime: appointment.start_time,
        displayTimezone,
        appointmentDateStr,
        filterDateStr,
        matches: appointmentDateStr === filterDateStr
      });
      return appointmentDateStr === filterDateStr;
    });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get the first day of the week that contains the first day of the month
    const calendarStart = new Date(monthStart);
    calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
    
    // Calculate minimum weeks needed for the current month
    const weeksNeeded = Math.ceil((monthEnd.getDate() + monthStart.getDay()) / 7);
    const daysToShow = Math.min(weeksNeeded * 7, 35); // Max 5 weeks to prevent overflow
    
    // Get only the necessary days to prevent scrolling
    const days = [];
    for (let i = 0; i < daysToShow; i++) {
      const day = new Date(calendarStart);
      day.setDate(calendarStart.getDate() + i);
      days.push(day);
    }

    // Get color dot for event type or custom color
    const getEventDotColor = (event: any) => {
      if (event.color) {
        return '';
      }
      
      switch (event.appointment_type) {
        case 'meeting': return 'bg-blue-500';
        case 'consultation': return 'bg-green-500';
        case 'call': return 'bg-primary';
        case 'follow-up': return 'bg-orange-500';
        default: return 'bg-primary';
      }
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Month header - lighter styling */}
        <div className="grid grid-cols-7 flex-shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-[11px] font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid - cleaner with lighter borders */}
        <div className={`flex-1 grid grid-cols-7 min-h-0`} style={{gridTemplateRows: `repeat(${Math.ceil(daysToShow / 7)}, 1fr)`}}>
          {days.map(day => {
            const events = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dayIsToday = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            
            return (
              <div
                key={day.toString()}
                className={`border-r border-b border-border/20 cursor-pointer transition-colors p-1.5 flex flex-col min-h-0 ${
                  isSelected ? 'bg-primary/5 ring-1 ring-primary/30 ring-inset' : ''
                } ${!isCurrentMonth ? 'text-muted-foreground/50' : ''} ${
                  isWeekend && isCurrentMonth ? 'bg-muted/20' : 'bg-background'
                } hover:bg-accent/30`}
                onClick={() => {
                  setSelectedDate(day);
                  setShowCreateEventDialog(true);
                }}
              >
                {/* Day number - refined today indicator */}
                <div className={`text-xs font-medium mb-0.5 flex-shrink-0 ${
                  dayIsToday 
                    ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]' 
                    : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Events list - cleaner pills */}
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-[10px] cursor-pointer hover:opacity-80 transition-opacity rounded px-1 py-0.5 truncate"
                      style={{
                        backgroundColor: event.color ? `${event.color}20` : 'hsl(var(--primary) / 0.1)',
                        borderLeft: `2px solid ${event.color || 'hsl(var(--primary))'}`,
                      }}
                      title={`${event.title}\n${TimezoneUtils.formatInTimezone(event.start_time, displayTimezone, 'HH:mm')} - ${TimezoneUtils.formatInTimezone(event.end_time, displayTimezone, 'HH:mm')}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id);
                      }}
                    >
                      <span className="font-medium text-foreground/70">
                        {TimezoneUtils.formatInTimezone(event.start_time, displayTimezone, 'HH:mm')}
                      </span>
                      <span className="ml-1 text-foreground">
                        {event.title}
                      </span>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-[10px] text-muted-foreground font-medium px-1">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    // Check if there are existing events or booked slots at this time
    const existingEvents = getEventsForDate(date);
    const clickDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${time.split('-')[0]}:00`);
    
    const hasConflict = existingEvents.some(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return clickDateTime >= eventStart && clickDateTime < eventEnd;
    });

    // If there's a conflict, show a dialog asking what to do
    if (hasConflict) {
      if (confirm("There's already an event at this time. Do you want to create an overlapping event anyway? Click OK to proceed or Cancel to choose a different time.")) {
        // Proceed with creating the event
        proceedWithEventCreation(date, time);
      }
      return;
    }

    // No conflict, proceed normally
    proceedWithEventCreation(date, time);
  };

  const proceedWithEventCreation = (date: Date, time: string) => {
    // Check permission before opening create dialog
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canCreateAppointments) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create appointments.",
        variant: "destructive",
      });
      return;
    }
    // Don't allow creation while permissions are loading
    if (!isPermissionLoaded) {
      toast({
        title: "Loading",
        description: "Please wait while permissions are being checked...",
      });
      return;
    }

    setSelectedDate(date);
    
    // Parse time range if it contains a dash (from drag creation)
    let startTime = time;
    let endTime = '10:00';
    
    if (time.includes('-')) {
      const [start, end] = time.split('-');
      startTime = start;
      endTime = end;
    } else {
      // For single time slot clicks, default to 1 hour duration
      const hour = parseInt(time.split(':')[0]);
      const minutes = time.split(':')[1];
      endTime = `${(hour + 1).toString().padStart(2, '0')}:${minutes}`;
    }
    
    // Store the selected times
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setShowCreateEventDialog(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowEditDialog(true);
  };

  const handleEventClick = (eventId: string) => {
    const appointment = appointments?.find(apt => apt.id === eventId);
    if (appointment) {
      handleAppointmentClick(appointment);
    }
  };

  const handleFiltersChange = (newFilters: CalendarFilterState) => {
    setFilters(newFilters);
  };

  // Two-way sync removed - using Google Calendar OAuth only

  // Filter appointments based on current filters
  const filteredAppointments = appointments?.filter(appointment => {
    // Visibility filter based on preferences
    if (preferences && currentUserId) {
      const visibility = appointment.visibility || 'private';
      const isOwner = appointment.user_id === currentUserId;
      const isTeamMember = appointment.team_member_ids?.includes(currentUserId);
      
      // Organization events - visible to all
      if (visibility === 'organization' || appointment.shared_with_organization) {
        if (!preferences.show_organization_events) return false;
      }
      // Team events - visible to team members
      else if (visibility === 'team') {
        if (!preferences.show_team_events) return false;
        // Only show if user is owner or in team_member_ids
        if (!isOwner && !isTeamMember) return false;
      }
      // Personal events - only visible to owner
      else if (visibility === 'private') {
        if (!isOwner) return false; // Hide other people's private events
        if (!preferences.show_personal_events) return false;
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        appointment.title.toLowerCase().includes(searchLower) ||
        appointment.description?.toLowerCase().includes(searchLower) ||
        appointment.location?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // User filter
    if (filters.userIds.length > 0 && appointment.user_id) {
      if (!filters.userIds.includes(appointment.user_id)) return false;
    }

    // Event type filter
    if (filters.eventTypes.length > 0 && appointment.appointment_type) {
      if (!filters.eventTypes.includes(appointment.appointment_type)) return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && appointment.status) {
      if (!filters.statuses.includes(appointment.status)) return false;
    }

    return true;
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Collapsible Sidebar - Hidden on desktop and tablets */}
      {!isDesktop && !isTablet && (
        <CalendarSidebar 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onBookingLinks={() => setShowSchedulerSlider(true)}
        />
      )}

      {/* Main Calendar with proper scroll hierarchy */}
      <div className="flex-1 flex flex-col min-h-0 overflow-visible">
        {/* Sticky Header Container - Single consolidated row */}
        <div className="sticky top-0 z-20 bg-background border-b flex-shrink-0">
          <CalendarSyncToolbar
            currentDate={currentDate}
            view={view}
            onTodayClick={() => setCurrentDate(new Date())}
            onPrevClick={() => navigateWeek('prev')}
            onNextClick={() => navigateWeek('next')}
            onViewChange={(value: CalendarView) => setView(value)}
            onFiltersChange={setFilters}
            onSchedulerClick={() => setShowSchedulerSlider(true)}
            onDateChange={setCurrentDate}
            onManageTemplates={() => setShowSchedulerManagement(true)}
            onViewBookings={() => setShowBookingManagement(true)}
            onViewAnalytics={() => setShowAnalytics(true)}
            onTasksClick={() => setShowTasksView(!showTasksView)}
            showTasksView={showTasksView}
          />
        </div>

        {/* Scrollable Content - Calendar or Tasks */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {showTasksView ? (
            <TaskListView />
          ) : (
            <>
              {view === 'week' && (
                <WeeklyCalendarView 
                  currentDate={currentDate}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                  filteredAppointments={filteredAppointments}
                />
              )}
              {view === 'month' && (
                <div className="h-full flex flex-col overflow-hidden">
                  {renderMonthView()}
                </div>
              )}
              {view === 'day' && (
                <DailyCalendarView 
                  currentDate={currentDate}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showSchedulerManagement} onOpenChange={setShowSchedulerManagement}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Booking Templates</DialogTitle>
          </DialogHeader>
          <SchedulerManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={showBookingManagement} onOpenChange={setShowBookingManagement}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Management</DialogTitle>
          </DialogHeader>
          <BookingManagement />
        </DialogContent>
      </Dialog>

      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analytics Dashboard</DialogTitle>
          </DialogHeader>
          <AnalyticsDashboard />
        </DialogContent>
      </Dialog>

      {/* Unified Appointment Dialog for both create and edit */}
      <UnifiedAppointmentDialog
        open={showEventDetails || showEditDialog || showCreateEventDialog}
        onOpenChange={(open) => {
          setShowEventDetails(open);
          setShowEditDialog(open);
          setShowCreateEventDialog(open);
          if (!open) {
            setSelectedAppointment(null);
            setSelectedDate(undefined);
            setSelectedStartTime("09:00");
            setSelectedEndTime("10:00");
          }
        }}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
      />

      {/* CalDAV Sync Dialog removed */}

      <CalendarSharingDialog
        open={showSharingDialog}
        onOpenChange={setShowSharingDialog}
        calendarId="default"
        calendarName="My Calendar"
      />

      <CalendarColorPicker
        open={showColorPicker}
        onOpenChange={setShowColorPicker}
      />

      {/* Conflict Resolution Dialog removed */}

      {/* Slot Conflict Dialog */}
      {conflictData && (
        <ConflictDialog
          open={showSlotConflictDialog}
          onOpenChange={setShowSlotConflictDialog}
          conflictingEvents={conflictData.conflictingEvents}
          proposedSlot={conflictData.proposedSlot}
          onCreateAnyway={() => {
            setShowSlotConflictDialog(false);
            proceedWithEventCreation(conflictData.proposedSlot.date, conflictData.proposedSlot.time);
          }}
          onMarkAsBusy={() => {
            setShowSlotConflictDialog(false);
            // Just open the dialog with the proposed slot selected
            setSelectedDate(conflictData.proposedSlot.date);
            setShowCreateEventDialog(true);
          }}
          onCancel={() => setShowSlotConflictDialog(false)}
        />
      )}

      <TimezoneSettingsDialog
        open={showTimezoneDialog}
        onOpenChange={setShowTimezoneDialog}
      />

      <AppointmentSchedulerSlider
        isOpen={showSchedulerSlider}
        onClose={() => setShowSchedulerSlider(false)}
      />

      <OfflineIndicator />
    </div>
  );
};

export default CalendarView;