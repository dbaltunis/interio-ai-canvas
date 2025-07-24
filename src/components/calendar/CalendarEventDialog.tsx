import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addHours } from "date-fns";
import { Calendar, Clock, MapPin, User, Trash2 } from "lucide-react";
import { useCreateAppointment, useUpdateAppointment, useDeleteAppointment, type Appointment } from "@/hooks/useAppointments";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  selectedDate: Date;
}

export const CalendarEventDialog = ({ open, onOpenChange, appointment, selectedDate }: CalendarEventDialogProps) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
    appointment_type: 'consultation' | 'measurement' | 'installation' | 'follow-up' | 'reminder' | 'meeting' | 'call';
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    client_id: string;
    project_id: string;
  }>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    appointment_type: 'consultation',
    status: 'scheduled',
    client_id: '',
    project_id: '',
  });

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        start_time: format(new Date(appointment.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(appointment.end_time), "yyyy-MM-dd'T'HH:mm"),
        location: appointment.location || '',
        appointment_type: appointment.appointment_type || 'consultation',
        status: appointment.status || 'scheduled',
        client_id: appointment.client_id || '',
        project_id: appointment.project_id || '',
      });
    } else {
      // New appointment - set default times
      const defaultStart = new Date(selectedDate);
      defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = addHours(defaultStart, 1);
      
      setFormData({
        title: '',
        description: '',
        start_time: format(defaultStart, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(defaultEnd, "yyyy-MM-dd'T'HH:mm"),
        location: '',
        appointment_type: 'consultation',
        status: 'scheduled',
        client_id: '',
        project_id: '',
      });
    }
  }, [appointment, selectedDate]);

  const handleSave = async () => {
    try {
      if (appointment) {
        await updateAppointment.mutateAsync({
          id: appointment.id,
          ...formData,
        });
      } else {
        await createAppointment.mutateAsync(formData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteAppointment.mutateAsync(appointment.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {appointment ? 'Update appointment details' : 'Create a new appointment'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Appointment title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment_type">Type</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value: 'consultation' | 'measurement' | 'installation' | 'follow-up' | 'reminder' | 'meeting' | 'call') => 
                  setFormData(prev => ({ ...prev, appointment_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="measurement">Measurement</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="follow-up">Follow Up</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Appointment description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Meeting location (optional)"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project</Label>
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.job_number || project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'scheduled' | 'confirmed' | 'completed' | 'cancelled') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div>
            {appointment && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteAppointment.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteAppointment.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.title || !formData.start_time || !formData.end_time || createAppointment.isPending || updateAppointment.isPending}
              className="bg-brand-primary hover:bg-brand-accent text-white"
            >
              {appointment ? 
                (updateAppointment.isPending ? 'Updating...' : 'Update') : 
                (createAppointment.isPending ? 'Creating...' : 'Create')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};