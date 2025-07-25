import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Plus, Settings, Link2, Clock, Users } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday } from "date-fns";
import { useAppointments } from "@/hooks/useAppointments";
import { useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";

type CalendarView = 'month' | 'week' | 'day';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<CalendarView>('month');
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
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
            {day}
          </div>
        ))}
        {days.map(day => {
          const events = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <div
              key={day.toString()}
              className={`min-h-24 p-1 border border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                isSelected ? 'bg-primary/10 border-primary' : ''
              } ${!isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''} ${
                isToday(day) ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
              <div className="space-y-1">
                {events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 bg-primary/20 text-primary rounded truncate"
                    title={event.title}
                  >
                    {format(new Date(event.start_time), 'HH:mm')} {event.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-xs text-muted-foreground">+{events.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="h-full flex flex-col">
        {/* Week header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r"></div>
          {weekDays.map(day => (
            <div key={day.toString()} className="p-4 text-center border-r">
              <div className="text-sm font-medium text-muted-foreground">
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 min-h-full">
            {/* Time labels */}
            <div className="border-r">
              {timeSlots.map(time => (
                <div key={time} className="h-16 p-2 text-sm text-muted-foreground border-b flex items-start">
                  {time}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {weekDays.map(day => {
              const dayEvents = getEventsForDate(day);
              
              return (
                <div key={day.toString()} className="border-r relative">
                  {timeSlots.map((time, index) => (
                    <div 
                      key={time} 
                      className="h-16 border-b hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedDate(day);
                        setNewEvent({
                          ...newEvent,
                          date: format(day, 'yyyy-MM-dd'),
                          startTime: time
                        });
                        setShowNewEventDialog(true);
                      }}
                    />
                  ))}
                  
                  {/* Events */}
                  {dayEvents.map(event => {
                    const startTime = new Date(event.start_time);
                    const endTime = new Date(event.end_time);
                    const startHour = startTime.getHours();
                    const endHour = endTime.getHours();
                    const startMinutes = startTime.getMinutes();
                    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                    
                    // Calculate position
                    const startSlotIndex = timeSlots.findIndex(slot => 
                      parseInt(slot.split(':')[0]) === startHour
                    );
                    
                    if (startSlotIndex === -1) return null;
                    
                    const top = startSlotIndex * 64 + (startMinutes / 60) * 64;
                    const height = duration * 64;
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 bg-primary/80 text-primary-foreground rounded p-1 text-xs overflow-hidden cursor-pointer hover:bg-primary/90 transition-colors"
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 16)}px`,
                          zIndex: 10
                        }}
                        title={`${event.title}\n${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-90">
                          {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-primary">Calendar</h1>
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
              onClick={() => setCurrentDate(addDays(currentDate, -30))}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addDays(currentDate, 30))}
            >
              →
            </Button>
            <h2 className="text-xl font-semibold ml-4">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
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
            Booking Links
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1">
        <CardContent className="p-0">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && (
            <div className="p-4 text-center text-muted-foreground">
              Day view - Coming soon
            </div>
          )}
        </CardContent>
      </Card>

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