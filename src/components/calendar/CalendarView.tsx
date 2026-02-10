import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";
import { useState, useEffect, useCallback } from "react";
import { addDays, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { MobileCalendarView } from "./MobileCalendarView";
import { useHasPermission, useUserPermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { CalendarSidebar } from "./CalendarSidebar";
import { WeeklyCalendarView } from "./WeeklyCalendarView";
import { DailyCalendarView } from "./DailyCalendarView";
import { MonthlyCalendarView } from "./MonthlyCalendarView";
import { AppointmentSchedulerSlider } from "./AppointmentSchedulerSlider";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import { QuickAddPopover } from "./QuickAddPopover";
import { AnimatePresence, motion } from "framer-motion";
import { UnifiedAppointmentDialog } from "./UnifiedAppointmentDialog";
import { OfflineIndicator } from "./OfflineIndicator";
import { CalendarSharingDialog } from "./sharing/CalendarSharingDialog";
import { CalendarColorPicker } from "./colors/CalendarColorPicker";
import { CalendarFilterState } from "./CalendarFilters";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useCalendarPreferences } from "@/hooks/useCalendarPreferences";
import { supabase } from "@/integrations/supabase/client";
import { ConflictDialog } from "./ConflictDialog";
import { TimezoneSettingsDialog } from "./timezone/TimezoneSettingsDialog";
import { useTimezone } from "@/hooks/useTimezone";
import { useAutoTimezone } from "@/hooks/useAutoTimezone";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTimezoneToast } from "./TimezoneToastNotification";
import { CalendarSyncToolbar } from "./CalendarSyncToolbar";
import { SchedulerManagement } from "./SchedulerManagement";
import { BookingManagement } from "./BookingManagement";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { Shield, ListTodo } from "lucide-react";
import { TaskListView } from "@/components/tasks/TaskListView";

type CalendarView = 'month' | 'week' | 'day';

interface CalendarViewProps {
  projectId?: string;
}

const CalendarView = ({ projectId }: CalendarViewProps = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const canViewCalendar = useHasPermission('view_calendar');
  const canViewOwnCalendar = useHasPermission('view_own_calendar');
  const hasCalendarAccess = canViewCalendar !== false || canViewOwnCalendar !== false;
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

  // Keyboard shortcuts for calendar navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts when typing in inputs or dialogs are open
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    if (showCreateEventDialog || showEditDialog) return;

    switch (e.key) {
      case 't':
      case 'T':
        e.preventDefault();
        setCurrentDate(new Date());
        break;
      case 'd':
      case 'D':
        e.preventDefault();
        setView('day');
        break;
      case 'w':
      case 'W':
        e.preventDefault();
        setView('week');
        break;
      case 'm':
      case 'M':
        if (!isTablet) {
          e.preventDefault();
          setView('month');
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (view === 'day') setCurrentDate(prev => addDays(prev, -1));
        else if (view === 'week') setCurrentDate(prev => subWeeks(prev, 1));
        else setCurrentDate(prev => subMonths(prev, 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (view === 'day') setCurrentDate(prev => addDays(prev, 1));
        else if (view === 'week') setCurrentDate(prev => addWeeks(prev, 1));
        else setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  }, [view, isTablet, showCreateEventDialog, showEditDialog]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [hiddenSources, setHiddenSources] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("calendar.hiddenSources");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Quick add popover state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<Date>(new Date());
  const [quickAddStartTime, setQuickAddStartTime] = useState("09:00");
  const [quickAddEndTime, setQuickAddEndTime] = useState<string | undefined>();
  const [quickAddAnchorPosition, setQuickAddAnchorPosition] = useState<{ x: number; y: number } | undefined>();
  
  // Enable real-time updates
  useRealtimeBookings();
  
  const { data: appointments } = useAppointments();
  useAppointmentSchedulers(); // prefetch for child components
  useTeamMembers(); // prefetch for child components
  useClients(); // prefetch for child components
  const { getColorForSource, getVisibilityForSource, addCalendarSource } = useCalendarColors();
  const createAppointment = useCreateAppointment();
  const { userTimezone, isTimezoneDifferent } = useTimezone();
  const { data: preferences } = useCalendarPreferences();
  const { data: userPreferences } = useUserPreferences();
  
  // Auto-detect timezone and handle mismatches
  const { 
    timezoneMismatch, 
    browserTimezone, 
    savedTimezone, 
    updateToDeviceTimezone, 
    dismissMismatch,
    getTimezoneDisplayName 
  } = useAutoTimezone();
  
  // Show timezone mismatch as toast notification instead of inline banner
  useTimezoneToast({
    browserTimezone,
    savedTimezone,
    timezoneMismatch,
    onUpdate: updateToDeviceTimezone,
    onDismiss: dismissMismatch,
    getTimezoneDisplayName,
  });
  
  // Get user's timezone for date conversions
  const displayTimezone = userPreferences?.timezone || userTimezone;
  
  // Get current user ID for visibility filtering
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id || null);
    });
  }, []);

  // newEvent state removed - using UnifiedAppointmentDialog now

  // Check permissions BEFORE returning any view
  // Return null to let Suspense skeleton persist (single loading state)
  if (canViewCalendar === undefined && canViewOwnCalendar === undefined) {
    return null;
  }

  if (!hasCalendarAccess) {
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

  const handleTimeSlotClick = (date: Date, time: string, event?: React.MouseEvent) => {
    // Permission check
    const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;
    if (isPermissionLoaded && !canCreateAppointments) {
      toast({ title: "Permission Denied", description: "You don't have permission to create appointments.", variant: "destructive" });
      return;
    }
    if (!isPermissionLoaded) {
      toast({ title: "Loading", description: "Please wait while permissions are being checked..." });
      return;
    }

    // Parse time range (from drag creation) or single time
    let startT = time;
    let endT: string | undefined;
    if (time.includes('-')) {
      const [s, e] = time.split('-');
      startT = s;
      endT = e;
    }

    // Capture click position for popover anchoring
    if (event) {
      setQuickAddAnchorPosition({ x: event.clientX, y: event.clientY });
    } else {
      // Fallback: center of viewport if no mouse event
      setQuickAddAnchorPosition({ x: window.innerWidth / 2 - 160, y: window.innerHeight / 3 });
    }

    // Open QuickAddPopover
    setQuickAddDate(date);
    setQuickAddStartTime(startT);
    setQuickAddEndTime(endT);
    setQuickAddOpen(true);
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

  const handleQuickAddMoreOptions = (prefill: { title: string; date: Date; startTime: string; endTime: string }) => {
    setSelectedDate(prefill.date);
    setSelectedStartTime(prefill.startTime);
    setSelectedEndTime(prefill.endTime);
    setShowCreateEventDialog(true);
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

    // Staff member filter - show only events for selected staff member
    if (selectedStaffId) {
      const isStaffOwner = appointment.user_id === selectedStaffId;
      const isStaffTeamMember = appointment.team_member_ids?.includes(selectedStaffId);
      if (!isStaffOwner && !isStaffTeamMember) return false;
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

    // User filter — check both creator and assigned team members
    if (filters.userIds.length > 0) {
      const isCreator = appointment.user_id && filters.userIds.includes(appointment.user_id);
      const isAssigned = appointment.team_member_ids?.some((id: string) => filters.userIds.includes(id));
      if (!isCreator && !isAssigned) return false;
    }

    // Event type filter
    if (filters.eventTypes.length > 0 && appointment.appointment_type) {
      if (!filters.eventTypes.includes(appointment.appointment_type)) return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && appointment.status) {
      if (!filters.statuses.includes(appointment.status)) return false;
    }

    // Sidebar source visibility filter
    if (hiddenSources.has('personal')) {
      // Hide personal (non-synced) appointments owned by current user
      const isOwner = appointment.user_id === currentUserId;
      const isSynced = !!appointment.google_event_id || !!appointment.outlook_event_id || !!appointment.nylas_event_id;
      if (isOwner && !isSynced) return false;
    }
    if (hiddenSources.has('google') && appointment.google_event_id) return false;
    if (hiddenSources.has('outlook') && appointment.outlook_event_id) return false;
    if (hiddenSources.has('nylas') && appointment.nylas_event_id) return false;

    return true;
  });

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const delta = direction === 'prev' ? -1 : 1;
    if (view === 'day') {
      setCurrentDate(addDays(currentDate, delta));
    } else if (view === 'week') {
      setCurrentDate(delta === -1 ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, delta));
    }
  };

  return (
    <div className="h-[calc(100dvh-3.5rem)] flex overflow-hidden">
      {/* Collapsible Sidebar - Desktop only */}
      {isDesktop && (
        <CalendarSidebar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onBookingLinks={() => setShowSchedulerSlider(true)}
          onHiddenSourcesChange={setHiddenSources}
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
            onPrevClick={() => navigateCalendar('prev')}
            onNextClick={() => navigateCalendar('next')}
            onViewChange={(value: CalendarView) => setView(value)}
            filters={filters}
            onFiltersChange={setFilters}
            onStaffFilterChange={setSelectedStaffId}
            selectedStaffId={selectedStaffId}
            onSchedulerClick={() => setShowSchedulerSlider(true)}
            onDateChange={setCurrentDate}
            onManageTemplates={() => setShowSchedulerManagement(true)}
            onViewBookings={() => setShowBookingManagement(true)}
            onViewAnalytics={() => setShowAnalytics(true)}
            onTasksClick={() => setShowTasksView(!showTasksView)}
            showTasksView={showTasksView}
          />
        </div>

        {/* Timezone notification is now a toast - see useTimezoneToast hook */}

        {/* Scrollable Content - Calendar or Tasks */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <AnimatePresence mode="wait">
            {showTasksView ? (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <TaskListView />
              </motion.div>
            ) : (
              <motion.div
                key={`calendar-${view}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {view === 'week' && (
                  <WeeklyCalendarView
                    currentDate={currentDate}
                    onEventClick={handleEventClick}
                    onTimeSlotClick={handleTimeSlotClick}
                    onDayHeaderClick={(date) => { setCurrentDate(date); setView('day'); }}
                    filteredAppointments={filteredAppointments}
                    hiddenSources={hiddenSources}
                  />
                )}
                {view === 'month' && (
                  <MonthlyCalendarView
                    currentDate={currentDate}
                    filteredAppointments={filteredAppointments}
                    onEventClick={handleEventClick}
                    onDayClick={(date) => { setCurrentDate(date); setView('day'); }}
                    hiddenSources={hiddenSources}
                  />
                )}
                {view === 'day' && (
                  <DailyCalendarView
                    currentDate={currentDate}
                    onEventClick={handleEventClick}
                    onTimeSlotClick={handleTimeSlotClick}
                    filteredAppointments={filteredAppointments}
                    hiddenSources={hiddenSources}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Quick Add Popover for fast event creation */}
      <QuickAddPopover
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        date={quickAddDate}
        startTime={quickAddStartTime}
        endTime={quickAddEndTime}
        onMoreOptions={handleQuickAddMoreOptions}
        anchorPosition={quickAddAnchorPosition}
      />

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