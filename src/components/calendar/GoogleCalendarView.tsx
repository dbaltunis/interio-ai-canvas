
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarGrid } from "./CalendarGrid";
import { AppointmentScheduler } from "./AppointmentScheduler";
import { NotificationsPanelCard } from "./NotificationsPanelCard";
import { Search, Filter, Plus, Calendar as CalendarIcon, Users, Mail, Briefcase } from "lucide-react";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useEmails } from "@/hooks/useEmails";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

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
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const { data: appointments, isLoading } = useAppointments();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { data: emails } = useEmails();
  const { data: notifications } = useNotifications();
  const createAppointment = useCreateAppointment();
  const { toast } = useToast();

  // Transform appointments for calendar display
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

  // Add email reminders and notifications as events
  const emailEvents: CalendarEvent[] = emails?.filter(email => email.status === 'scheduled').map(email => ({
    id: `email-${email.id}`,
    title: `Email: ${email.subject}`,
    start_time: email.sent_at || new Date().toISOString(),
    end_time: email.sent_at || new Date().toISOString(),
    type: 'reminder' as const,
    color: 'bg-yellow-500',
    client_name: email.recipient_name || email.recipient_email
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

  const handleScheduleAppointment = async (appointmentData: any) => {
    try {
      await createAppointment.mutateAsync({
        title: appointmentData.title,
        description: appointmentData.description,
        appointment_type: appointmentData.appointment_type,
        start_time: appointmentData.start_time,
        end_time: appointmentData.end_time,
        location: appointmentData.location,
        client_id: null // Will be created separately if needed
      });
      
      setIsSchedulerOpen(false);
      toast({
        title: "Appointment Scheduled",
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
    setIsSchedulerOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage appointments, reminders, and client meetings
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {appointments?.length || 0} Appointments
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {clients?.length || 0} Clients
            </Badge>
            <Badge variant="secondary" className="flex items-center">
              <Briefcase className="w-4 h-4 mr-1" />
              {projects?.length || 0} Projects
            </Badge>
          </div>

          <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Create a new appointment or allow clients to book online
                </DialogDescription>
              </DialogHeader>
              <AppointmentScheduler onSchedule={handleScheduleAppointment} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments, clients, or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
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

      {/* Main Calendar Layout */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <CalendarGrid
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Notifications Panel */}
          <NotificationsPanelCard 
            onScheduleNotification={(notificationId) => {
              // Handle scheduling notification as appointment
              setIsSchedulerOpen(true);
            }} 
          />

          {/* Today's Events */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Today's Events</h3>
              <div className="space-y-2">
                {filteredEvents
                  .filter(event => new Date(event.start_time).toDateString() === new Date().toDateString())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                      <div className="flex-1">
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
        </div>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                {new Date(selectedEvent.start_time).toLocaleDateString()} at{' '}
                {new Date(selectedEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEvent.client_name && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.client_name}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
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
