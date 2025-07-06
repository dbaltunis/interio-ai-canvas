import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Clock, MapPin } from "lucide-react";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsPanelCard } from "./NotificationsPanelCard";

export const EnhancedCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    appointment_type: 'consultation',
    start_time: '',
    end_time: '',
    location: '',
    client_id: '',
    project_id: '',
    notification_id: ''
  });

  const { data: appointments, isLoading } = useAppointments();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const { data: notifications } = useNotifications();
  const createAppointment = useCreateAppointment();

  // Valid appointment types that match database constraints
  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'measurement', label: 'Measurement' },
    { value: 'installation', label: 'Installation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'call', label: 'Call' }
  ];

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'measurement': return 'bg-green-100 text-green-800';
      case 'installation': return 'bg-purple-100 text-purple-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      case 'meeting': return 'bg-indigo-100 text-indigo-800';
      case 'call': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    
    const dateString = date.toDateString();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.start_time).toDateString();
      return appointmentDate === dateString;
    });
  };

  const handleCreateAppointment = async () => {
    if (!selectedDate || !newAppointment.title || !newAppointment.start_time || !newAppointment.end_time) {
      return;
    }

    const startDateTime = new Date(`${selectedDate.toDateString()} ${newAppointment.start_time}`);
    const endDateTime = new Date(`${selectedDate.toDateString()} ${newAppointment.end_time}`);

    const appointmentData = {
      title: newAppointment.title,
      description: newAppointment.description || null,
      appointment_type: newAppointment.appointment_type,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: newAppointment.location || null,
      client_id: newAppointment.client_id || null,
      project_id: newAppointment.project_id || null,
    };

    try {
      await createAppointment.mutateAsync(appointmentData);
      setIsDialogOpen(false);
      setNewAppointment({
        title: '',
        description: '',
        appointment_type: 'consultation',
        start_time: '',
        end_time: '',
        location: '',
        client_id: '',
        project_id: '',
        notification_id: ''
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const handleCreateFromNotification = (notificationId: string) => {
    const notification = notifications?.find(n => n.id === notificationId);
    if (notification) {
      setNewAppointment({
        title: notification.title,
        description: notification.message,
        appointment_type: 'reminder',
        start_time: '09:00',
        end_time: '10:00',
        location: '',
        client_id: '',
        project_id: '',
        notification_id: notificationId
      });
      setIsDialogOpen(true);
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Schedule and manage appointments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Appointment</DialogTitle>
              <DialogDescription>
                Schedule a new appointment for {selectedDate?.toDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                  placeholder="Appointment title"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newAppointment.appointment_type}
                  onValueChange={(value) => setNewAppointment({...newAppointment, appointment_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newAppointment.start_time}
                    onChange={(e) => setNewAppointment({...newAppointment, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newAppointment.end_time}
                    onChange={(e) => setNewAppointment({...newAppointment, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="client">Client (Optional)</Label>
                <Select
                  value={newAppointment.client_id}
                  onValueChange={(value) => setNewAppointment({...newAppointment, client_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project">Project (Optional)</Label>
                <Select
                  value={newAppointment.project_id}
                  onValueChange={(value) => setNewAppointment({...newAppointment, project_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment({...newAppointment, location: e.target.value})}
                  placeholder="Appointment location"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                  placeholder="Additional details"
                />
              </div>

              <Button 
                onClick={handleCreateAppointment}
                disabled={createAppointment.isPending}
                className="w-full"
              >
                {createAppointment.isPending ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5" />
              Calendar
            </CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? selectedDate.toDateString() : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedDateAppointments.length > 0 
                ? `${selectedDateAppointments.length} appointment${selectedDateAppointments.length !== 1 ? 's' : ''}`
                : 'No appointments scheduled'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="mx-auto h-12 w-12 mb-4" />
                <p>No appointments for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{appointment.title}</h4>
                      <Badge className={getAppointmentTypeColor(appointment.appointment_type)}>
                        {appointment.appointment_type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3 w-3" />
                        <span>
                          {new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(appointment.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {appointment.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-3 w-3" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                      
                      {appointment.description && (
                        <p className="mt-2">{appointment.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Panel */}
        <NotificationsPanelCard onScheduleNotification={handleCreateFromNotification} />
      </div>
    </div>
  );
};
