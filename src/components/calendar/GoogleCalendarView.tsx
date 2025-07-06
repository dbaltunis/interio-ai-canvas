
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarGrid } from "./CalendarGrid";
import { EventCreationDialog } from "./EventCreationDialog";
import { AppointmentSchedulerManager } from "./AppointmentSchedulerManager";
import { NotificationsPopup } from "./NotificationsPopup";
import { Search, Filter, Calendar as CalendarIcon, Users, Briefcase, Bell, X, Settings } from "lucide-react";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useEmails } from "@/hooks/useEmails";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  type: 'appointment' | 'reminder' | 'client_meeting' | 'consultation' | 'measurement' | 'installation' | 'follow-up' | 'meeting' | 'call';
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
  const [isEventCreationOpen, setIsEventCreationOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showTodaysEvents, setShowTodaysEvents] = useState(false);
  const [eventCreationDate, setEventCreationDate] = useState<Date | undefined>();
  const [eventCreationHour, setEventCreationHour] = useState<number | undefined>();

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
      type: appointment.appointment_type as CalendarEvent['type'],
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

  const allEvents = [...calendarEvents, ...emailEvents];

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

  const handleCreateEvent = async (eventData: any) => {
    try {
      await createAppointment.mutateAsync(eventData);
      toast({
        title: "Event Created",
        description: "The event has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setEventCreationDate(date);
    setEventCreationHour(hour);
    setIsEventCreationOpen(true);
  };

  const handleNewEventClick = () => {
    setEventCreationDate(undefined);
    setEventCreationHour(undefined);
    setIsEventCreationOpen(true);
  };

  const todaysEvents = filteredEvents.filter(event => 
    new Date(event.start_time).toDateString() === new Date().toDateString()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 w-full">
        <div className="w-full max-w-none mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your appointments and schedule
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {appointments?.length || 0} appointments
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {clients?.length || 0} clients
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {projects?.length || 0} projects
                </Badge>
              </div>

              {/* Actions */}
              <NotificationsPopup onScheduleNotification={(notificationId) => {
                console.log('Schedule notification:', notificationId);
              }} />

              <Button 
                onClick={() => setIsSchedulerOpen(true)}
                variant="outline" 
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Appointment Scheduling
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 py-4 w-full">
        <div className="w-full max-w-none mx-auto">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search appointments, clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="consultation">Consultations</SelectItem>
                    <SelectItem value="measurement">Measurements</SelectItem>
                    <SelectItem value="installation">Installations</SelectItem>
                    <SelectItem value="follow-up">Follow-ups</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="call">Calls</SelectItem>
                    <SelectItem value="reminder">Reminders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 pb-8 w-full">
        <div className="w-full max-w-none mx-auto">
          <div className="flex gap-6">
            {/* Calendar */}
            <div className="flex-1 min-w-0">
              <CalendarGrid
                events={filteredEvents}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                onNewEventClick={handleNewEventClick}
                showTodaysEvents={showTodaysEvents}
                onToggleTodaysEvents={setShowTodaysEvents}
              />
            </div>

            {/* Today's Events Sidebar - Desktop */}
            {!isMobile && showTodaysEvents && (
              <div className="w-80 flex-shrink-0">
                <Card className="sticky top-4">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        Today's Events
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTodaysEvents(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {todaysEvents.slice(0, 8).map(event => (
                        <div 
                          key={event.id} 
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${event.color}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{event.title}</div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(event.start_time), 'HH:mm')}
                              {event.client_name && ` • ${event.client_name}`}
                            </div>
                          </div>
                        </div>
                      ))}
                      {todaysEvents.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-8">
                          No events scheduled for today
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Today's Events Overlay */}
      {isMobile && showTodaysEvents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <Card className="w-full max-h-[70vh] overflow-y-auto rounded-t-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Today's Events</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTodaysEvents(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {todaysEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => {
                      handleEventClick(event);
                      setShowTodaysEvents(false);
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(event.start_time), 'HH:mm')}
                        {event.client_name && ` • ${event.client_name}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Creation Dialog */}
      <EventCreationDialog
        open={isEventCreationOpen}
        onOpenChange={setIsEventCreationOpen}
        onCreateEvent={handleCreateEvent}
        initialDate={eventCreationDate}
        initialHour={eventCreationHour}
      />

      {/* Appointment Scheduler Manager Dialog */}
      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
          <AppointmentSchedulerManager />
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedEvent.color}`}></div>
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>
                {format(new Date(selectedEvent.start_time), 'EEEE, MMMM d, yyyy')} at{' '}
                {format(new Date(selectedEvent.start_time), 'HH:mm')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEvent.client_name && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{selectedEvent.client_name}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
