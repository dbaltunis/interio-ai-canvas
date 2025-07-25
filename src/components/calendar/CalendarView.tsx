import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, Settings, Link2, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday, addWeeks, subWeeks } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { CalendarSidebar } from "./CalendarSidebar";
import { WeeklyCalendarView } from "./WeeklyCalendarView";
import { DailyCalendarView } from "./DailyCalendarView";

type CalendarView = 'month' | 'week' | 'day';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<CalendarView>('week'); // Default to week view
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [showSchedulerDialog, setShowSchedulerDialog] = useState(false);
  
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: schedulers } = useAppointmentSchedulers();
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
    location: ''
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
      
      setShowNewEventDialog(false);
      setNewEvent({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        appointmentType: 'meeting',
        location: ''
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
    
    // Get 42 days (6 weeks) to ensure we always show complete weeks
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(calendarStart);
      day.setDate(calendarStart.getDate() + i);
      days.push(day);
    }

    return (
      <div className="h-full flex flex-col">
        {/* Month header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6">
          {days.map(day => {
            const events = getEventsForDate(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dayIsToday = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={`border border-border cursor-pointer hover:bg-accent/50 transition-colors p-2 flex flex-col min-h-0 ${
                  isSelected ? 'bg-primary/10 border-primary' : ''
                } ${!isCurrentMonth ? 'text-muted-foreground bg-muted/10' : 'bg-background'}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  dayIsToday 
                    ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs' 
                    : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="flex-1 space-y-1 overflow-hidden">
                  {events.slice(0, 4).map((event, index) => {
                    // Color coding by appointment type
                    const getEventColor = (type: string) => {
                      switch (type) {
                        case 'meeting': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
                        case 'consultation': return 'bg-green-500/20 text-green-700 border-green-500/30';
                        case 'call': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
                        case 'follow-up': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
                        default: return 'bg-primary/20 text-primary border-primary/30';
                      }
                    };
                    
                    return (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded border truncate cursor-pointer hover:shadow-sm transition-shadow ${
                          getEventColor(event.appointment_type || 'meeting')
                        }`}
                        title={`${event.title}\n${format(new Date(event.start_time), 'HH:mm')} - ${format(new Date(event.end_time), 'HH:mm')}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                      >
                        <div className="font-medium truncate leading-tight">
                          {format(new Date(event.start_time), 'HH:mm')} {event.title}
                        </div>
                      </div>
                    );
                  })}
                  {events.length > 4 && (
                    <div className="text-xs text-muted-foreground font-medium">
                      +{events.length - 4} more
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
    setNewEvent({
      ...newEvent,
      date: format(date, 'yyyy-MM-dd'),
      startTime: time
    });
    setShowNewEventDialog(true);
  };

  const handleEventClick = (eventId: string) => {
    // Handle event click - could open edit dialog
    console.log('Event clicked:', eventId);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <CalendarSidebar 
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onBookingLinks={() => setShowSchedulerDialog(true)}
      />

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
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

              <Button onClick={() => setShowNewEventDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
              
              <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Meeting location"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
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

              <Button variant="outline" onClick={() => setShowSchedulerDialog(true)}>
                <Link2 className="h-4 w-4 mr-2" />
                Appointment Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'week' && (
            <WeeklyCalendarView 
              currentDate={currentDate}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}
          {view === 'month' && (
            <div className="h-full p-4">
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


      {/* Booking Links Dialog */}
      <Dialog open={showSchedulerDialog} onOpenChange={setShowSchedulerDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Link2 className="h-5 w-5 mr-2" />
              Appointment Booking Links
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {schedulers && schedulers.length > 0 ? (
              <div className="space-y-3">
                {schedulers.map(scheduler => (
                  <Card key={scheduler.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{scheduler.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {scheduler.duration} min • {scheduler.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {scheduler.duration} minutes
                          <Users className="h-3 w-3 ml-3 mr-1" />
                          1-on-1
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/book/${scheduler.slug}`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Link copied!",
                              description: "Booking link copied to clipboard",
                            });
                          }}
                        >
                          <Link2 className="h-3 w-3 mr-1" />
                          Copy Link
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No booking links yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create appointment schedulers to generate shareable booking links
                </p>
                <Button onClick={() => {
                  setShowSchedulerDialog(false);
                  // Navigate to scheduler management - you might want to add routing here
                }}>
                  Create Booking Link
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;