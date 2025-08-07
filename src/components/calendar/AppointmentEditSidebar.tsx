import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Bell, Settings, Save, X } from "lucide-react";
import { toast } from "sonner";

interface AppointmentEditSidebarProps {
  appointment: any;
  onSave: (appointment: any) => void;
  onCancel: () => void;
  onAdvancedOptions: () => void;
}

const eventColors = [
  { value: 'primary', label: 'Primary', color: 'bg-primary' },
  { value: 'secondary', label: 'Secondary', color: 'bg-secondary' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
];

export const AppointmentEditSidebar: React.FC<AppointmentEditSidebarProps> = ({
  appointment,
  onSave,
  onCancel,
  onAdvancedOptions
}) => {
  const [event, setEvent] = useState({
    title: appointment?.title || '',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    startTime: appointment?.startTime || '09:00',
    endTime: appointment?.endTime || '10:00',
    location: appointment?.location || '',
    description: appointment?.description || '',
    color: appointment?.color || 'blue',
    notifications: appointment?.notifications || false,
    notificationTime: appointment?.notificationTime || '15',
  });

  const handleInputChange = (field: string, value: any) => {
    setEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!event.title.trim()) {
      toast.error("Please enter a title for the appointment");
      return;
    }

    onSave({
      ...appointment,
      ...event,
      id: appointment?.id || Date.now().toString(),
    });
    
    toast.success("Appointment updated successfully");
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

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Edit Event
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
        </div>

        <Separator />

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Location
          </Label>
          <Input
            id="location"
            value={event.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Enter location or video call link"
          />
        </div>

        {/* Description */}
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

        <Separator />

        {/* Quick Notifications */}
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
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        <Button
          onClick={onAdvancedOptions}
          variant="outline"
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          Advanced Options
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
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
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};