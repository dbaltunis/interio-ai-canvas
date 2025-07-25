import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Settings, Link2, Clock, Users, ChevronLeft, ChevronRight, MapPin, Palette, UserPlus, Video } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday, addWeeks, subWeeks } from "date-fns";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useClients } from "@/hooks/useClients";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { CalendarSidebar } from "./CalendarSidebar";
import { WeeklyCalendarView } from "./WeeklyCalendarView";
import { DailyCalendarView } from "./DailyCalendarView";
import { AppointmentSchedulerSlider } from "./AppointmentSchedulerSlider";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import { CalendarFilters, CalendarFilterState } from "./CalendarFilters";
import { CalendarEventDialog } from "./CalendarEventDialog";
import { DurationPicker } from "./TimePicker";

type CalendarView = 'month' | 'week' | 'day';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<CalendarView>('week'); // Default to week view
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [showSchedulerSlider, setShowSchedulerSlider] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
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
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

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
    inviteClientEmail: ''
  });

  const handleCreateEvent = async () => {
    try {
      const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
      const endDateTime = new Date(`${newEvent.date}T${newEvent.endTime}`);
      
      await createAppointment.mutateAsync({
        title: newEvent.title,
        description: newEvent.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        appointment_type: newEvent.appointmentType,
        location: newEvent.location,
        status: 'scheduled'
      });

      // Show success message with additional features note
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
        inviteClientEmail: ''
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

    // Get color dot for event type
    const getEventDotColor = (type: string) => {
      switch (type) {
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
                      className="text-xs cursor-pointer hover:bg-accent/30 transition-colors rounded p-1 group"
                      title={`${event.title}\n${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id);
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getEventDotColor(event.appointment_type || 'meeting')}`} />
                        <div className="truncate text-foreground group-hover:text-foreground/80">
                          <span className="font-medium">
                            {format(new Date(event.start_time), 'HH:mm')}
                          </span>
                          <span className="ml-1">
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

  const handleEventClick = (eventId: string) => {
    const appointment = appointments?.find(apt => apt.id === eventId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowEventDetails(true);
    }
  };

  const handleFiltersChange = (newFilters: CalendarFilterState) => {
    setFilters(newFilters);
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
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <CalendarSidebar 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onBookingLinks={() => setShowSchedulerSlider(true)}
      />

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Calendar</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold ml-4">
                  {view === 'week' 
                    ? format(currentDate, 'MMMM yyyy')
                    : format(currentDate, 'MMMM yyyy')
                  }
                </h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>

              <CalendarFilters onFiltersChange={handleFiltersChange} />

              <Button onClick={() => setShowNewEventDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
              
              <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  Create New Event
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
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
                        { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
                        { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
                        { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
                        { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500' },
                        { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
                        { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
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


      {/* Appointment Scheduler Slider */}
      <AppointmentSchedulerSlider 
        isOpen={showSchedulerSlider}
        onClose={() => setShowSchedulerSlider(false)}
      />

      {/* Event Details Modal */}
      <CalendarEventDialog
        open={showEventDetails}
        onOpenChange={(open) => {
          setShowEventDetails(open);
          if (!open) setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default CalendarView;