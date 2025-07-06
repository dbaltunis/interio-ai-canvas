import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarGrid } from "./CalendarGrid";
import { AppointmentBookingSystem } from "./AppointmentBookingSystem";
import { NotificationsPopup } from "./NotificationsPopup";
import { Search, Filter, Plus, Calendar as CalendarIcon, Users, Mail, Briefcase, Menu } from "lucide-react";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useEmails } from "@/hooks/useEmails";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'appointment' | 'reminder' | 'client_meeting';
  color: string;
  client_name?: string;
  location?: string;
  description?: string;
  project_name?: string;
}

export const GoogleCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const isMobile = useIsMobile();
  const { data: appointments, isLoading } = useAppointments();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { data: emails } = useEmails();
  const { data: notifications } = useNotifications();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  const calendarEvents: CalendarEvent[] = appointments?.map(appointment => {
    const client = clients?.find(c => c.id === appointment.client_id);
    const project = projects?.find(p => p.id === appointment.project_id);
    
    return {
      id: appointment.id,
      title: appointment.title,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      type: appointment.appointment_type as 'appointment' | 'reminder' | 'client_meeting',
      color: getTypeColor(appointment.appointment_type),
      client_name: client?.name,
      location: appointment.location,
      description: appointment.description,
      project_name: project?.name
    };
  }) || [];

  const emailEvents: CalendarEvent[] = emails?.filter(email => email.status === 'scheduled').map(email => ({
    id: `email-${email.id}`,
    title: `Email: ${email.subject}`,
    start_time: email.sent_at || new Date().toISOString(),
    end_time: email.sent_at || new Date().toISOString(),
    type: 'reminder' as const,
    color: 'bg-yellow-500'
  })) || [];

  const notificationEvents: CalendarEvent[] = notifications?.filter(n => !n.read).slice(0, 5).map(notification => ({
    id: `notification-${notification.id}`,
    title: `Reminder: ${notification.title}`,
    start_time: notification.created_at,
    end_time: notification.created_at,
    type: 'reminder' as const,
    color: 'bg-orange-500'
  })) || [];

  const allEvents = [...calendarEvents, ...emailEvents, ...notificationEvents];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.client_name && event.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  function getTypeColor(type: string) {
    switch (type) {
      case 'consultation': return 'bg-blue-500';
      case 'measurement': return 'bg-green-500';
      case 'installation': return 'bg-purple-500';
      case 'follow-up': return 'bg-orange-500';
      case 'reminder': return 'bg-yellow-500';
      case 'meeting': return 'bg-indigo-500';
      case 'call': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  }

  const handleBookAppointment = async (appointmentData: any) => {
    try {
      await createAppointment.mutateAsync({
        title: appointmentData.title,
        description: appointmentData.description,
        appointment_type: appointmentData.appointment_type,
        start_time: appointmentData.start_time,
        end_time: appointmentData.end_time,
        location: appointmentData.location,
        client_id: null
      });
      
      setIsBookingOpen(false);
      toast({
        title: "Appointment Booked",
        description: "The appointment has been successfully scheduled.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedDate(new Date(date.setHours(hour, 0, 0, 0)));
    setIsBookingOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  }

  const TodaysEvents = () => (
    <Card className="h-fit">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4">Today's Events</h3>
        <div className="space-y-2">
          {filteredEvents
            .filter(event => new Date(event.start_time).toDateString() === new Date().toDateString())
            .slice(0, 5)
            .map(event => (
              <div key={event.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          {filteredEvents.filter(event => new Date(event.start_time).toDateString() === new Date().toDateString()).length === 0 && (
            <p className="text-sm text-muted-foreground">No events today</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-none mx-0 px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="sm:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage appointments, reminders, and client meetings
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Quick Stats - Responsive */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Badge variant="secondary" className="flex items-center text-xs">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {appointments?.length || 0}
            </Badge>
            <Badge variant="secondary" className="flex items-center text-xs">
              <Users className="w-3 h-3 mr-1" />
              {clients?.length || 0}
            </Badge>
            <Badge variant="secondary" className="flex items-center text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              {projects?.length || 0}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <NotificationsPopup onScheduleNotification={(notificationId) => {
              setIsBookingOpen(true);
            }} />

            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Book
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Book Your Appointment</DialogTitle>
                  <DialogDescription>
                    Schedule a convenient time for your window covering consultation or service
                  </DialogDescription>
                </DialogHeader>
                <AppointmentBookingSystem onBookAppointment={handleBookAppointment} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search and Filters - Mobile Responsive */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments, clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="client_meeting">Client Meetings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Calendar Layout - Mobile Responsive */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Calendar Grid - Full width on mobile, 3/4 on desktop */}
        <div className="flex-1 w-full">
          <CalendarGrid
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>

        {/* Sidebar - Hidden on mobile by default, shown when toggled */}
        {(!isMobile || showSidebar) && (
          <div className={`w-full lg:w-80 ${isMobile ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Today's Events</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  ×
                </Button>
              </div>
            )}
            <TodaysEvents />
          </div>
        )}
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
              <DialogDescription className="text-sm">
                {new Date(selectedEvent.start_time).toLocaleDateString()} at{' '}
                {new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {selectedEvent.client_name && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.client_name}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center text-sm">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2 text-sm">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
