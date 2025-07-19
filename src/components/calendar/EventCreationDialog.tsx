
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { format, setHours, setMinutes } from "date-fns";

interface EventCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEvent: (eventData: any) => void;
  initialDate?: Date;
  initialHour?: number;
}

export const EventCreationDialog = ({ 
  open, 
  onOpenChange, 
  onCreateEvent,
  initialDate,
  initialHour 
}: EventCreationDialogProps) => {
  const { data: clients } = useClients();
  const { data: projects } = useProjects();

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    appointment_type: 'consultation' as const,
    client_id: '',
    project_id: '',
    status: 'scheduled' as const
  });

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());

  useEffect(() => {
    if (initialDate && initialHour !== undefined) {
      const startTime = setHours(setMinutes(initialDate, 0), initialHour);
      const endTime = setHours(setMinutes(initialDate, 0), initialHour + 1);
      
      setEventData(prev => ({
        ...prev,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      }));
      setSelectedDate(initialDate);
    }
  }, [initialDate, initialHour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEvent(eventData);
    onOpenChange(false);
    setEventData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      location: '',
      appointment_type: 'consultation',
      client_id: '',
      project_id: '',
      status: 'scheduled'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={eventData.appointment_type}
                onValueChange={(value: any) => setEventData(prev => ({ ...prev, appointment_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="measurement">Measurement</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select
                value={eventData.client_id}
                onValueChange={(value) => setEventData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="project">Project</Label>
              <Select
                value={eventData.project_id}
                onValueChange={(value) => setEventData(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={eventData.location}
              onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={eventData.description}
              onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-datetime">Start Date & Time *</Label>
              <Input
                id="start-datetime"
                type="datetime-local"
                value={eventData.start_time ? format(new Date(eventData.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setEventData(prev => ({ ...prev, start_time: new Date(e.target.value).toISOString() }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="end-datetime">End Date & Time *</Label>
              <Input
                id="end-datetime"
                type="datetime-local"
                value={eventData.end_time ? format(new Date(eventData.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => setEventData(prev => ({ ...prev, end_time: new Date(e.target.value).toISOString() }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
