import { useState } from "react";
import { X, Plus, Trash2, Clock, MapPin, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCreateScheduler, useAppointmentSchedulers } from "@/hooks/useAppointmentSchedulers";
import { useToast } from "@/hooks/use-toast";

interface AppointmentSchedulerSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface SchedulerForm {
  name: string;
  description: string;
  duration: number;
  bufferTime: number;
  maxAdvanceBooking: number;
  minAdvanceNotice: number;
  availability: Record<string, DayAvailability>;
  locations: {
    inPerson: boolean;
    videoCall: boolean;
    phoneCall: boolean;
    customLocation: string;
  };
}

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

export const AppointmentSchedulerSlider = ({ isOpen, onClose }: AppointmentSchedulerSliderProps) => {
  const { toast } = useToast();
  const createScheduler = useCreateScheduler();
  const { data: schedulers } = useAppointmentSchedulers();

  const [form, setForm] = useState<SchedulerForm>({
    name: "",
    description: "",
    duration: 60,
    bufferTime: 15,
    maxAdvanceBooking: 30,
    minAdvanceNotice: 24,
    availability: WEEKDAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: {
        enabled: day.key !== 'saturday' && day.key !== 'sunday',
        timeSlots: [{ start: '09:00', end: '17:00' }]
      }
    }), {}),
    locations: {
      inPerson: true,
      videoCall: false,
      phoneCall: false,
      customLocation: ""
    }
  });

  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a schedule name",
        variant: "destructive"
      });
      return;
    }

    // Validate at least one day is enabled
    const hasEnabledDay = Object.values(form.availability).some(day => day.enabled);
    if (!hasEnabledDay) {
      toast({
        title: "Error",
        description: "Please enable at least one day for availability",
        variant: "destructive"
      });
      return;
    }

    // Validate at least one location option is selected
    const hasLocation = Object.values(form.locations).some(location => 
      typeof location === 'boolean' ? location : location.trim().length > 0
    );
    if (!hasLocation) {
      toast({
        title: "Error",
        description: "Please select at least one meeting option",
        variant: "destructive"
      });
      return;
    }

    try {
      const availabilityArray = WEEKDAYS.map(day => ({
        day: day.key,
        enabled: form.availability[day.key].enabled,
        timeSlots: form.availability[day.key].timeSlots
      }));

      // Generate a unique slug to avoid conflicts
      const baseSlug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const timestamp = Date.now().toString().slice(-6);
      const uniqueSlug = `${baseSlug}-${timestamp}`;

      const result = await createScheduler.mutateAsync({
        name: form.name,
        description: form.description,
        duration: form.duration,
        buffer_time: form.bufferTime,
        max_advance_booking: form.maxAdvanceBooking,
        min_advance_notice: form.minAdvanceNotice,
        availability: availabilityArray,
        locations: form.locations,
        active: true,
        slug: uniqueSlug
      });

      // Generate shareable link
      const shareableLink = `${window.location.origin}/schedule/${uniqueSlug}`;
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareableLink);
        toast({
          title: "Schedule Created Successfully!",
          description: `Shareable link copied to clipboard: ${shareableLink}`,
          duration: 8000
        });
      } catch (clipboardError) {
        toast({
          title: "Schedule Created Successfully!",
          description: `Share this link: ${shareableLink}`,
          duration: 8000
        });
      }

      onClose();
    } catch (error) {
      console.error("Error creating schedule:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to Create Schedule",
        description: `Please try again. Error: ${errorMessage}`,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  const addTimeSlot = (dayKey: string) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayKey]: {
          ...prev.availability[dayKey],
          timeSlots: [
            ...prev.availability[dayKey].timeSlots,
            { start: '09:00', end: '17:00' }
          ]
        }
      }
    }));
  };

  const removeTimeSlot = (dayKey: string, index: number) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayKey]: {
          ...prev.availability[dayKey],
          timeSlots: prev.availability[dayKey].timeSlots.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const updateTimeSlot = (dayKey: string, index: number, field: 'start' | 'end', value: string) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayKey]: {
          ...prev.availability[dayKey],
          timeSlots: prev.availability[dayKey].timeSlots.map((slot, i) => 
            i === index ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const toggleDayAvailability = (dayKey: string, enabled: boolean) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [dayKey]: {
          ...prev.availability[dayKey],
          enabled
        }
      }
    }));
  };

  const generateWeeklyPreview = () => {
    const slots: { day: string; time: string; duration: number }[] = [];
    
    WEEKDAYS.forEach(day => {
      if (form.availability[day.key].enabled) {
        form.availability[day.key].timeSlots.forEach(timeSlot => {
          const startTime = new Date(`2024-01-01T${timeSlot.start}:00`);
          const endTime = new Date(`2024-01-01T${timeSlot.end}:00`);
          
          let currentTime = new Date(startTime);
          while (currentTime < endTime) {
            const nextTime = new Date(currentTime.getTime() + (form.duration + form.bufferTime) * 60000);
            if (nextTime <= endTime) {
              slots.push({
                day: day.short,
                time: currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                }),
                duration: form.duration
              });
            }
            currentTime = nextTime;
          }
        });
      }
    });

    return slots;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed right-0 top-0 h-full w-[900px] bg-background border-l shadow-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Appointment Schedule</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('create')}
              className="rounded-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('preview')}
              className="rounded-none"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Weekly Preview
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'create' ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Schedule Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Consultation Meeting"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this appointment is for..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Duration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <Clock className="h-4 w-4 mr-2 inline" />
                      Duration Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Appointment Duration (minutes)</Label>
                        <Select value={form.duration.toString()} onValueChange={(value) => setForm(prev => ({ ...prev, duration: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                        <Select value={form.bufferTime.toString()} onValueChange={(value) => setForm(prev => ({ ...prev, bufferTime: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No buffer</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Availability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Availability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {WEEKDAYS.map(day => (
                      <div key={day.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={form.availability[day.key].enabled}
                              onCheckedChange={(checked) => toggleDayAvailability(day.key, checked)}
                            />
                            <Label className="font-medium">{day.label}</Label>
                          </div>
                          {form.availability[day.key].enabled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addTimeSlot(day.key)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        {form.availability[day.key].enabled && (
                          <div className="ml-6 space-y-2">
                            {form.availability[day.key].timeSlots.map((slot, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                                  className="w-32"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                                  className="w-32"
                                />
                                {form.availability[day.key].timeSlots.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTimeSlot(day.key, index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Location Options */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      <MapPin className="h-4 w-4 mr-2 inline" />
                      Meeting Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>In-person meeting</Label>
                        <Switch
                          checked={form.locations.inPerson}
                          onCheckedChange={(checked) => setForm(prev => ({
                            ...prev,
                            locations: { ...prev.locations, inPerson: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Video call</Label>
                        <Switch
                          checked={form.locations.videoCall}
                          onCheckedChange={(checked) => setForm(prev => ({
                            ...prev,
                            locations: { ...prev.locations, videoCall: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Phone call</Label>
                        <Switch
                          checked={form.locations.phoneCall}
                          onCheckedChange={(checked) => setForm(prev => ({
                            ...prev,
                            locations: { ...prev.locations, phoneCall: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Booking Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Maximum advance booking (days)</Label>
                        <Input
                          type="number"
                          value={form.maxAdvanceBooking}
                          onChange={(e) => setForm(prev => ({ ...prev, maxAdvanceBooking: parseInt(e.target.value) || 30 }))}
                        />
                      </div>
                      <div>
                        <Label>Minimum advance notice (hours)</Label>
                        <Input
                          type="number"
                          value={form.minAdvanceNotice}
                          onChange={(e) => setForm(prev => ({ ...prev, minAdvanceNotice: parseInt(e.target.value) || 24 }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Weekly Preview */
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">{form.name || 'Unnamed Schedule'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {form.duration} min appointments • {form.bufferTime} min buffer
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Available Time Slots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {WEEKDAYS.map(day => (
                        <div key={day.key} className="text-center">
                          <div className="font-medium text-sm mb-2 p-2 bg-muted rounded">
                            {day.short}
                          </div>
                          <div className="space-y-1">
                            {generateWeeklyPreview()
                              .filter(slot => slot.day === day.short)
                              .slice(0, 8)
                              .map((slot, index) => (
                                <div
                                  key={index}
                                  className="text-xs p-1 bg-primary/10 text-primary rounded border"
                                >
                                  {slot.time}
                                </div>
                              ))}
                            {generateWeeklyPreview().filter(slot => slot.day === day.short).length > 8 && (
                              <div className="text-xs text-muted-foreground">
                                +{generateWeeklyPreview().filter(slot => slot.day === day.short).length - 8} more
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createScheduler.isPending}>
              {createScheduler.isPending ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};