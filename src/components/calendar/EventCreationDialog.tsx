
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { format, setHours, setMinutes } from "date-fns";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";

interface EventCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEvent: (event: any) => void;
  initialDate?: Date;
  initialHour?: number;
}

// Valid appointment types that match database constraints
const eventTypes = [
  { value: 'consultation', label: 'Consultation', color: 'bg-blue-500' },
  { value: 'measurement', label: 'Measurement', color: 'bg-green-500' },
  { value: 'installation', label: 'Installation', color: 'bg-purple-500' },
  { value: 'follow-up', label: 'Follow-up', color: 'bg-orange-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-indigo-500' },
  { value: 'call', label: 'Call', color: 'bg-pink-500' },
  { value: 'reminder', label: 'Reminder', color: 'bg-yellow-500' }
];

export const EventCreationDialog = ({ 
  open, 
  onOpenChange, 
  onCreateEvent,
  initialDate,
  initialHour
}: EventCreationDialogProps) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventType: '',
    date: initialDate || new Date(),
    startTime: initialHour ? `${initialHour.toString().padStart(2, '0')}:00` : '09:00',
    endTime: initialHour ? `${(initialHour + 1).toString().padStart(2, '0')}:00` : '10:00',
    location: '',
    clientId: '',
    projectId: ''
  });

  const { data: clients } = useClients();
  const { data: projects } = useProjects();

  const handleSubmit = () => {
    if (!eventData.title || !eventData.eventType) {
      console.error('Title and event type are required');
      return;
    }

    const [startHour, startMin] = eventData.startTime.split(':').map(Number);
    const [endHour, endMin] = eventData.endTime.split(':').map(Number);
    
    const startDateTime = setMinutes(setHours(eventData.date, startHour), startMin);
    const endDateTime = setMinutes(setHours(eventData.date, endHour), endMin);

    const event = {
      title: eventData.title,
      description: eventData.description,
      appointment_type: eventData.eventType, // Use valid appointment type
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: eventData.location || null,
      client_id: eventData.clientId || null,
      project_id: eventData.projectId || null
    };

    console.log('Creating event with data:', event);
    onCreateEvent(event);
    onOpenChange(false);
    
    // Reset form
    setEventData({
      title: '',
      description: '',
      eventType: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      clientId: '',
      projectId: ''
    });
  };

  const selectedEventType = eventTypes.find(type => type.value === eventData.eventType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <Label htmlFor="event-type">Event Type *</Label>
              <Select value={eventData.eventType} onValueChange={(value) => setEventData(prev => ({ ...prev, eventType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEventType && (
                <Badge className={`${selectedEventType.color} text-white mt-2`}>
                  {selectedEventType.label}
                </Badge>
              )}
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={eventData.clientId} onValueChange={(value) => setEventData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project">Project</Label>
              <Select value={eventData.projectId} onValueChange={(value) => setEventData(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project (optional)" />
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

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventData.location}
                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={eventData.date}
                onSelect={(date) => date && setEventData(prev => ({ ...prev, date }))}
                className="rounded-md border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={eventData.startTime}
                  onChange={(e) => setEventData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={eventData.endTime}
                  onChange={(e) => setEventData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            {/* Event Preview */}
            {eventData.title && eventData.eventType && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Event Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedEventType?.color}`}></div>
                    <span className="font-medium">{eventData.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="w-3 h-3" />
                    {format(eventData.date, 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3 h-3" />
                    {eventData.startTime} - {eventData.endTime}
                  </div>
                  {eventData.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {eventData.location}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!eventData.title || !eventData.eventType}
          >
            Create Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
