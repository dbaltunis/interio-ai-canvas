import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Bell, Settings, Save, X, Trash2, Eye, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventDialogProps {
  mode: 'view' | 'edit' | 'create';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: any;
  selectedDate?: Date;
  onSave?: (appointment: any) => void;
  onDelete?: (appointmentId: string) => void;
  onModeChange?: (mode: 'view' | 'edit') => void;
}

const eventColors = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
];

export const EventDialog: React.FC<EventDialogProps> = ({
  mode,
  open,
  onOpenChange,
  appointment,
  selectedDate,
  onSave,
  onDelete,
  onModeChange
}) => {
  const [event, setEvent] = useState({
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
    appointment_type: 'meeting' as 'meeting' | 'consultation' | 'measurement' | 'installation' | 'follow_up' | 'reminder' | 'call',
    color: 'blue',
    notifications: false,
    notificationTime: '15',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (appointment) {
      const startDate = appointment.start_time ? new Date(appointment.start_time) : new Date();
      const endDate = appointment.end_time ? new Date(appointment.end_time) : new Date();
      
      setEvent({
        title: appointment.title || '',
        date: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        location: appointment.location || '',
        description: appointment.description || '',
        appointment_type: appointment.appointment_type || 'meeting',
        color: appointment.color || 'blue',
        notifications: appointment.notification_enabled || false,
        notificationTime: appointment.notification_minutes?.toString() || '15',
      });
    } else if (selectedDate && mode === 'create') {
      setEvent(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd'),
        title: '',
        description: '',
        location: '',
      }));
    }
  }, [appointment, selectedDate, mode]);

  const handleInputChange = (field: string, value: any) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!event.title.trim()) {
      toast.error("Please enter a title for the appointment");
      return;
    }

    const startDateTime = new Date(`${event.date}T${event.startTime}`);
    const endDateTime = new Date(`${event.date}T${event.endTime}`);

    const appointmentData = {
      ...appointment,
      title: event.title,
      description: event.description,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: event.location,
      appointment_type: event.appointment_type,
      color: event.color,
      notification_enabled: event.notifications,
      notification_minutes: parseInt(event.notificationTime),
      id: appointment?.id || Date.now().toString(),
    };

    onSave?.(appointmentData);
    toast.success(mode === 'create' ? "Event created successfully" : "Event updated successfully");
  };

  const handleDelete = () => {
    if (appointment?.id) {
      onDelete?.(appointment.id);
      toast.success("Event deleted successfully");
    }
  };

  const quickDurations = [
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
  ];

  const setQuickDuration = (minutes: number) => {
    const [hours, mins] = event.startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, mins, 0, 0);
    
    const endDate = new Date(startDate.getTime() + minutes * 60000);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    handleInputChange('endTime', endTime);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'confirmed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {mode === 'view' ? 'Event Details' : 
               mode === 'edit' ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            
            {mode === 'view' && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onModeChange?.('edit')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* View Mode */}
          {mode === 'view' && appointment && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${eventColors.find(c => c.value === appointment.color)?.color || 'bg-blue-500'}`} />
                  <h3 className="text-lg font-semibold">{appointment.title}</h3>
                </div>

                <div className="flex gap-2">
                  <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                    {appointment.status || 'scheduled'}
                  </Badge>
                  <Badge variant="outline">
                    {appointment.appointment_type || 'meeting'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(appointment.start_time || new Date()), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(appointment.start_time || new Date()), 'HH:mm')} - {format(new Date(appointment.end_time || new Date()), 'HH:mm')}
                    </span>
                  </div>
                </div>

                {appointment.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.location}</span>
                  </div>
                )}

                {appointment.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onModeChange?.('edit')}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}

          {/* Edit/Create Mode */}
          {(mode === 'edit' || mode === 'create') && (
            <>
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={event.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={event.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={event.appointment_type} onValueChange={(value) => handleInputChange('appointment_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="measurement">Measurement</SelectItem>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={event.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={event.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick Duration Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quick Duration</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickDurations.map((duration) => (
                      <Button
                        key={duration.minutes}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickDuration(duration.minutes)}
                        className="text-xs"
                      >
                        {duration.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={event.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select value={event.color} onValueChange={(value) => handleInputChange('color', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${color.color}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={event.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Add description..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Notifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Notifications
                  </Label>
                  <Switch
                    checked={event.notifications}
                    onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                  />
                </div>
                
                {event.notifications && (
                  <Select 
                    value={event.notificationTime} 
                    onValueChange={(value) => handleInputChange('notificationTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Advanced Options Toggle */}
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </Button>

              {/* Advanced Options (placeholder for future expansion) */}
              {showAdvanced && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Advanced options like team members, CalDAV sync, and sharing will be available here.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create' : 'Save'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};