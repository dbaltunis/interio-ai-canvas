import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Settings, Link2, Clock, Users, ChevronLeft, ChevronRight, MapPin, Palette, UserPlus, Video, Share, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday, addWeeks, subWeeks } from "date-fns";
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
import { CalendarFilterState } from "./CalendarFilters";
import { DurationPicker } from "./TimePicker";
import { CalendarSyncStatus } from "./CalendarSyncStatus";
import { CalDAVSyncDialog } from "./CalDAVSyncDialog";
import { CalendarStatusIndicator } from "./CalendarStatusIndicator";
import { EventDialog } from "./EventDialog";
import { useEventDialog } from "@/hooks/useEventDialog";
import { OfflineIndicator } from "./OfflineIndicator";
import { CalendarSharingDialog } from "./sharing/CalendarSharingDialog";
import { CalendarColorPicker } from "./colors/CalendarColorPicker";
import { CalendarFilters } from "./filters/CalendarFilters";
import { useCalendarColors } from "@/hooks/useCalendarColors";
import { useTwoWaySync } from "@/hooks/useTwoWaySync";
import { ConflictResolutionDialog } from "./sync/ConflictResolutionDialog";
import { ConflictDialog } from "./ConflictDialog";
import { TimezoneSettingsDialog } from "./timezone/TimezoneSettingsDialog";
import { useTimezone } from "@/hooks/useTimezone";
import { TimezoneUtils } from "@/utils/timezoneUtils";

type CalendarView = 'month' | 'week' | 'day';

const CalendarView = () => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Pre-select today
  const [view, setView] = useState<CalendarView>('week'); // Default to week view
  const eventDialog = useEventDialog();
  const [showSchedulerSlider, setShowSchedulerSlider] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCalDAVSync, setShowCalDAVSync] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('calendar-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
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
  const twoWaySync = useTwoWaySync();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  const { userTimezone, isTimezoneDifferent } = useTimezone();

  // New appointment form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    appointmentType: 'meeting' as const,
    location: '',
    color: '',
    videoMeetingLink: '',
    selectedTeamMembers: [] as string[],
    inviteClientEmail: '',
    enableNotifications: false,
    notificationMethods: [] as string[],
    notificationTiming: '15',
    customNotificationMessage: ''
  });

  const handleCreateEvent = async () => {
    try {
      const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);
      
      // Helper function to check if a string is a valid UUID
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };

      // Filter out invalid UUIDs for team members (since we're using mock data)
      const validTeamMemberIds = newEvent.selectedTeamMembers.filter(isValidUUID);
      
      const newAppointment = await createAppointment.mutateAsync({
        title: newEvent.title,
        description: newEvent.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        appointment_type: newEvent.appointmentType,
        location: newEvent.location,
        status: 'scheduled',
        color: newEvent.color || undefined,
        team_member_ids: validTeamMemberIds.length > 0 ? validTeamMemberIds : undefined,
        invited_client_emails: newEvent.inviteClientEmail ? [newEvent.inviteClientEmail] : undefined
      });

      // Show CalDAV sync dialog for new appointment
      setSelectedAppointment(newAppointment as any);
      setShowCalDAVSync(true);

      // Show success message with additional features note
      toast({
        title: "Event Created",
        description: `Event "${newEvent.title}" has been created successfully. ${
          newEvent.selectedTeamMembers.length > 0 || newEvent.inviteClientEmail || newEvent.videoMeetingLink
            ? 'Additional features like team invitations and video links will be fully integrated soon.'
            : ''
        }`,
      });
      
      eventDialog.close();
      setNewEvent({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        appointmentType: 'meeting',
        location: '',
        color: '',
        videoMeetingLink: '',
        selectedTeamMembers: [],
        inviteClientEmail: '',
        enableNotifications: false,
        notificationMethods: [],
        notificationTiming: '15',
        customNotificationMessage: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    }
  };

  const getEventsForDate = (date: Date) => {
    if (!appointments) return [];
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.start_time), date)
    );
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
        case 'call': return 'bg-purple-500';
        case 'follow-up': return 'bg-orange-500';
        default: return 'bg-primary';
      }
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Month header */}
        <div className="grid grid-cols-7 border-b flex-shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid - fixed height, no scrolling */}
        <div className={`flex-1 grid grid-cols-7 min-h-0`} style={{gridTemplateRows: `repeat(${Math.ceil(daysToShow / 7)}, 1fr)`}}>
          {days.map(day => {
            const events = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dayIsToday = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={`border border-border cursor-pointer transition-colors p-2 flex flex-col min-h-0 ${
                  isSelected ? 'bg-primary/10 border-primary' : ''
                } ${!isCurrentMonth ? 'text-muted-foreground bg-muted/10' : 'bg-background'}`}
                onClick={() => {
                  setSelectedDate(day);
                  setNewEvent({
                    ...newEvent,
                    date: format(day, 'yyyy-MM-dd')
                  });
                   eventDialog.openCreate(day);
                }}
              >
                {/* Day number */}
                <div className={`text-sm font-medium mb-1 flex-shrink-0 ${
                  dayIsToday 
                    ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs' 
                    : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Events list */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {events.slice(0, 3).map((event, index) => (
                    <div
                      key={event.id}
                      className="text-sm cursor-pointer hover:bg-accent/30 transition-colors rounded p-1 group"
                      title={`${event.title}\n${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id);
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${getEventDotColor(event)}`}
                          style={{
                            backgroundColor: event.color || undefined
                          }}
                        />
                        <div className="truncate text-foreground group-hover:text-foreground/80">
                          <span className="font-semibold">
                            {format(new Date(event.start_time), 'HH:mm')}
                          </span>
                          <span className="ml-1 font-medium">
                            {event.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-muted-foreground font-medium pl-3.5">
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
    
    setNewEvent({
      ...newEvent,
      date: format(date, 'yyyy-MM-dd'),
      startTime: startTime,
      endTime: endTime
    });
    eventDialog.openCreate();
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

  const handleTwoWaySync = async () => {
    try {
      // For demo, sync with the first available CalDAV calendar
      // In real app, user would select which calendar to sync
      const result = await twoWaySync.mutateAsync('default-calendar-id');
      
      if (result.conflicts.length > 0) {
        setSyncConflicts(result.conflicts);
        setShowConflictDialog(true);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Filter appointments based on current filters
  const filteredAppointments = appointments?.filter(appointment => {
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
      {/* Sidebar */}
      <CalendarSidebar 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onBookingLinks={() => setShowSchedulerSlider(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => {
          const newState = !sidebarCollapsed;
          setSidebarCollapsed(newState);
          localStorage.setItem('calendar-sidebar-collapsed', JSON.stringify(newState));
        }}
      />

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background p-2 md:p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Left section - Title and Navigation */}
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-lg md:text-2xl font-bold text-primary">Calendar</h1>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className={isMobile ? "px-2" : ""}
                >
                  {isMobile ? <Clock className="h-4 w-4" /> : "Today"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  className="px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {!isMobile && (
                  <h2 className="text-lg font-semibold ml-2">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                )}
              </div>
            </div>
            
            {/* Right section - View selector */}
            <div className="flex items-center">
              <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                <SelectTrigger className={isMobile ? "w-20" : "w-32"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden min-h-0">
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
        </div>
      </div>

      {/* Unified Event Dialog */}
      <EventDialog
        mode={eventDialog.mode}
        open={eventDialog.isOpen}
        onOpenChange={eventDialog.close}
        appointment={eventDialog.selectedAppointment}
        selectedDate={eventDialog.selectedDate}
        onSave={(appointment) => {
          // Handle save logic here - same as handleCreateEvent
          console.log('Saving appointment:', appointment);
          eventDialog.close();
        }}
        onDelete={(appointmentId) => {
          // Handle delete logic here
          console.log('Deleting appointment:', appointmentId);
          eventDialog.close();
        }}
        onModeChange={eventDialog.changeMode}
      />


      {/* Appointment Scheduler Slider */}
      <AppointmentSchedulerSlider 
        isOpen={showSchedulerSlider}
        onClose={() => setShowSchedulerSlider(false)}
      />


      {/* CalDAV Sync Dialog */}
      <CalDAVSyncDialog
        open={showCalDAVSync}
        onOpenChange={setShowCalDAVSync}
        appointment={selectedAppointment}
        onSyncComplete={() => setSelectedAppointment(null)}
      />

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

      <ConflictResolutionDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        conflicts={syncConflicts}
      />

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
            // Create a "Busy" event
            setNewEvent({
              ...newEvent,
              title: 'Busy',
              description: 'Time slot marked as busy',
              date: format(conflictData.proposedSlot.date, 'yyyy-MM-dd'),
              startTime: conflictData.proposedSlot.time,
              endTime: `${(parseInt(conflictData.proposedSlot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:${conflictData.proposedSlot.time.split(':')[1]}`
            });
            eventDialog.openCreate();
          }}
          onCancel={() => setShowSlotConflictDialog(false)}
        />
      )}

      <TimezoneSettingsDialog
        open={showTimezoneDialog}
        onOpenChange={setShowTimezoneDialog}
      />

      <OfflineIndicator />
    </div>
  );
};

export default CalendarView;