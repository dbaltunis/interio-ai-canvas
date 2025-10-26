import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Settings, Link2, Clock, Users, ChevronLeft, ChevronRight, MapPin, Palette, UserPlus, Video, Share, Bell, SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday, addWeeks, subWeeks } from "date-fns";
import { MobileCalendarView } from "./MobileCalendarView";
import { useHasPermission } from "@/hooks/usePermissions";
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
// Two-way sync removed - using Google Calendar OAuth only
import { ConflictDialog } from "./ConflictDialog";
import { useCompactMode } from "@/hooks/useCompactMode";
import { TimezoneSettingsDialog } from "./timezone/TimezoneSettingsDialog";
import { useTimezone } from "@/hooks/useTimezone";
import { TimezoneUtils } from "@/utils/timezoneUtils";
import { CalendarSyncToolbar } from "./CalendarSyncToolbar";

type CalendarView = 'month' | 'week' | 'day';

interface CalendarViewProps {
  projectId?: string;
}

const CalendarView = ({ projectId }: CalendarViewProps = {}) => {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Pre-select today
  const [view, setView] = useState<CalendarView>('week'); // Default to week view
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [showSchedulerSlider, setShowSchedulerSlider] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  // CalDAV sync removed
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
  const [filters, setFilters] = useState<CalendarFilterState>({
    searchTerm: "",
    userIds: [],
    eventTypes: [],
    statuses: []
  });
  
  // Log on every render to debug
  console.log('[CalendarView] Component rendering, searchParams:', Object.fromEntries(searchParams.entries()));
  
  // Enable real-time updates
  useRealtimeBookings();
  
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: schedulers } = useAppointmentSchedulers();
  const { data: teamMembers } = useTeamMembers();
  const { data: clients } = useClients();
  const { getColorForSource, getVisibilityForSource, addCalendarSource } = useCalendarColors();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();
  const { userTimezone, isTimezoneDifferent } = useTimezone();

  // Handle eventId from URL or sessionStorage (for opening specific events from dashboard)
  useEffect(() => {
    // Check URL first
    let eventId = searchParams.get('eventId');
    
    // If not in URL, check sessionStorage
    if (!eventId) {
      eventId = sessionStorage.getItem('openEventId');
    }
    
    console.log('[CalendarView] Effect running - eventId:', eventId, 'appointments:', appointments?.length);
    
    if (eventId && appointments && appointments.length > 0) {
      const appointment = appointments.find(apt => apt.id === eventId);
      
      if (appointment) {
        console.log('[CalendarView] Opening event:', appointment.title);
        setSelectedAppointment(appointment);
        setShowEditDialog(true);
        
        // Clear from both URL and sessionStorage
        sessionStorage.removeItem('openEventId');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('eventId');
        setSearchParams(newParams, { replace: true });
      } else {
        console.log('[CalendarView] Event not found:', eventId);
      }
    } else if (eventId && (!appointments || appointments.length === 0)) {
      // Store in sessionStorage if appointments aren't loaded yet
      console.log('[CalendarView] Storing eventId in sessionStorage, waiting for appointments');
      sessionStorage.setItem('openEventId', eventId);
    }
  }, [appointments, searchParams, setSearchParams]);

  // Return mobile view for mobile devices (AFTER all hooks are called)
  if (isMobile) {
    return <MobileCalendarView />;
  }

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
    console.log("handleCreateEvent called", newEvent);
    try {
      const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);
      
      console.log("Start time:", startDateTime);
      console.log("End time:", endDateTime);
      
      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        console.log("Validation failed: end time before start time");
        toast({
          title: "Invalid Time",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Validation passed, creating appointment...");
      
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
        invited_client_emails: newEvent.inviteClientEmail ? [newEvent.inviteClientEmail] : undefined,
        notification_enabled: newEvent.enableNotifications,
        notification_minutes: parseInt(newEvent.notificationTiming),
        project_id: projectId || undefined
      });

      // Show success message
      toast({
        title: "Event Created",
        description: `Event "${newEvent.title}" has been created successfully. ${
          newEvent.selectedTeamMembers.length > 0 || newEvent.inviteClientEmail || newEvent.videoMeetingLink
            ? 'Additional features like team invitations and video links will be fully integrated soon.'
            : ''
        }`,
      });
      
      setShowNewEventDialog(false);
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
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create appointment",
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
        case 'call': return 'bg-primary';
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
                  setShowNewEventDialog(true);
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
                        <div className="truncate text-foreground group-hover:text-foreground/80 flex-1">
                          <span className="font-semibold">
                            {format(new Date(event.start_time), 'HH:mm')}
                          </span>
                          <span className="ml-1 font-medium">
                            {event.title}
                          </span>
                        </div>
                        {event.notification_enabled && (
                          <Bell className="h-3 w-3 text-primary flex-shrink-0" />
                        )}
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
    setShowNewEventDialog(true);
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
      {/* Collapsible Sidebar - manages its own collapse state */}
      <CalendarSidebar 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onBookingLinks={() => setShowSchedulerSlider(true)}
      />

      {/* Main Calendar with proper scroll hierarchy */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
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
          />
        </div>

        {/* Scrollable Calendar Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
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

      {/* New Event Dialog */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary" />
              Create New Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
            {/* Event Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select value={newEvent.appointmentType} onValueChange={(value: any) => setNewEvent({ ...newEvent, appointmentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DurationPicker
                startTime={newEvent.startTime}
                endTime={newEvent.endTime}
                onStartTimeChange={(time) => setNewEvent({ ...newEvent, startTime: time })}
                onEndTimeChange={(time) => setNewEvent({ ...newEvent, endTime: time })}
              />

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Enter meeting location"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              {/* Event Color Selection */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Event Color
                </Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { name: 'Primary', value: '#415e6b', bg: 'bg-primary' },
                    { name: 'Secondary', value: '#9bb6bc', bg: 'bg-secondary' },
                    { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
                    { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
                    { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500' },
                    { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
                    { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newEvent.color === color.value 
                          ? 'border-foreground scale-110' 
                          : 'border-muted hover:border-muted-foreground'
                      } ${color.bg}`}
                      onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Video Meeting Link */}
              <div>
                <Label htmlFor="videoMeetingLink" className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  Video Meeting Link
                </Label>
                <Input
                  id="videoMeetingLink"
                  value={newEvent.videoMeetingLink}
                  onChange={(e) => setNewEvent({ ...newEvent, videoMeetingLink: e.target.value })}
                  placeholder="https://meet.google.com/... or https://zoom.us/..."
                />
              </div>
            </div>

            {/* Team Members and Client Invitation */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees
              </h3>

              {/* Team Members Selection */}
              {teamMembers && teamMembers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Invite Team Members</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                           onClick={() => {
                             const isSelected = newEvent.selectedTeamMembers.includes(member.id);
                             setNewEvent({
                               ...newEvent,
                               selectedTeamMembers: isSelected 
                                 ? newEvent.selectedTeamMembers.filter(id => id !== member.id)
                                 : [...newEvent.selectedTeamMembers, member.id]
                             });
                           }}>
                        <Checkbox 
                          checked={newEvent.selectedTeamMembers.includes(member.id)}
                          onChange={() => {}}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm flex-1">{member.name}</span>
                          <Badge variant="outline" className="text-xs">{member.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Invitation */}
              <div>
                <Label htmlFor="inviteClientEmail" className="text-sm font-medium mb-2 block">Invite Client</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteClientEmail"
                    value={newEvent.inviteClientEmail}
                    onChange={(e) => setNewEvent({ ...newEvent, inviteClientEmail: e.target.value })}
                    placeholder="client@example.com"
                    className="flex-1"
                  />
                  {clients && clients.length > 0 && (
                    <Select onValueChange={(email) => setNewEvent({ ...newEvent, inviteClientEmail: email })}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients
                          .filter(client => client.email && client.email.trim() !== '')
                          .map(client => (
                            <SelectItem key={client.id} value={client.email!}>
                              {client.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableNotifications" className="text-sm">Enable notifications for this event</Label>
                  <Switch
                    id="enableNotifications"
                    checked={newEvent.enableNotifications || false}
                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, enableNotifications: checked })}
                  />
                </div>

                {newEvent.enableNotifications && (
                  <div className="space-y-3 ml-4 pl-4 border-l-2 border-muted">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Notification methods</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="emailNotification"
                            checked={newEvent.notificationMethods?.includes('email') || false}
                            onCheckedChange={(checked) => {
                              const methods = newEvent.notificationMethods || [];
                              setNewEvent({
                                ...newEvent,
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
                            checked={newEvent.notificationMethods?.includes('sms') || false}
                            onCheckedChange={(checked) => {
                              const methods = newEvent.notificationMethods || [];
                              setNewEvent({
                                ...newEvent,
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
                            checked={newEvent.notificationMethods?.includes('in_app') || false}
                            onCheckedChange={(checked) => {
                              const methods = newEvent.notificationMethods || [];
                              setNewEvent({
                                ...newEvent,
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
                        value={newEvent.notificationTiming || '15'}
                        onValueChange={(value) => setNewEvent({ ...newEvent, notificationTiming: value })}
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
                        value={newEvent.customNotificationMessage || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, customNotificationMessage: e.target.value })}
                        placeholder="Add a custom message to the notification..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title}>
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Appointment Scheduler Slider */}
      <AppointmentSchedulerSlider 
        isOpen={showSchedulerSlider}
        onClose={() => setShowSchedulerSlider(false)}
      />

      {/* Unified Appointment Dialog for both create and edit */}
      <UnifiedAppointmentDialog
        open={showEventDetails || showEditDialog}
        onOpenChange={(open) => {
          setShowEventDetails(open);
          setShowEditDialog(open);
          if (!open) setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
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
            // Create a "Busy" event
            setNewEvent({
              ...newEvent,
              title: 'Busy',
              description: 'Time slot marked as busy',
              date: format(conflictData.proposedSlot.date, 'yyyy-MM-dd'),
              startTime: conflictData.proposedSlot.time,
              endTime: `${(parseInt(conflictData.proposedSlot.time.split(':')[0]) + 1).toString().padStart(2, '0')}:${conflictData.proposedSlot.time.split(':')[1]}`
            });
            setShowNewEventDialog(true);
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