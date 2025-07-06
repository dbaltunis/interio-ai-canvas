import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Video, Plus, Settings, Link, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface SchedulerConfig {
  name: string;
  description: string;
  duration: number;
  bufferTime: number;
  maxAdvanceBooking: number;
  minAdvanceNotice: number;
  timeSlots: TimeSlot[];
  locations: {
    inPerson: { enabled: boolean; address: string };
    googleMeet: { enabled: boolean };
    zoom: { enabled: boolean; meetingId?: string };
    phone: { enabled: boolean };
  };
}

export const AppointmentSchedulerManager = () => {
  const { toast } = useToast();
  const [schedulers, setSchedulers] = useState<SchedulerConfig[]>([]);
  const [activeScheduler, setActiveScheduler] = useState<SchedulerConfig>({
    name: '',
    description: '',
    duration: 60,
    bufferTime: 15,
    maxAdvanceBooking: 30,
    minAdvanceNotice: 24,
    timeSlots: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', enabled: true },
      { day: 'saturday', startTime: '10:00', endTime: '14:00', enabled: false },
      { day: 'sunday', startTime: '10:00', endTime: '14:00', enabled: false }
    ],
    locations: {
      inPerson: { enabled: true, address: '' },
      googleMeet: { enabled: false },
      zoom: { enabled: false, meetingId: '' },
      phone: { enabled: false }
    }
  });

  const handleSaveScheduler = () => {
    if (!activeScheduler.name) {
      toast({
        title: "Error",
        description: "Please enter a scheduler name",
        variant: "destructive"
      });
      return;
    }

    setSchedulers(prev => [...prev, { ...activeScheduler }]);
    toast({
      title: "Success",
      description: "Appointment scheduler created successfully"
    });
  };

  const generateBookingLink = (schedulerName: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/book/${schedulerName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const copyBookingLink = (schedulerName: string) => {
    const link = generateBookingLink(schedulerName);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard"
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Scheduling</h1>
          <p className="text-gray-600 mt-1">Create and manage your appointment booking calendars</p>
        </div>
        <Button onClick={() => setActiveScheduler({
          name: '',
          description: '',
          duration: 60,
          bufferTime: 15,
          maxAdvanceBooking: 30,
          minAdvanceNotice: 24,
          timeSlots: [
            { day: 'monday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'thursday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'friday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'saturday', startTime: '10:00', endTime: '14:00', enabled: false },
            { day: 'sunday', startTime: '10:00', endTime: '14:00', enabled: false }
          ],
          locations: {
            inPerson: { enabled: true, address: '' },
            googleMeet: { enabled: false },
            zoom: { enabled: false, meetingId: '' },
            phone: { enabled: false }
          }
        })}>
          <Plus className="w-4 h-4 mr-2" />
          New Scheduler
        </Button>
      </div>

      {/* Existing Schedulers */}
      {schedulers.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedulers.map((scheduler, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{scheduler.name}</CardTitle>
                <p className="text-sm text-gray-600">{scheduler.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{scheduler.duration} minutes</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {scheduler.locations.inPerson.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        In-Person
                      </Badge>
                    )}
                    {scheduler.locations.googleMeet.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        Google Meet
                      </Badge>
                    )}
                    {scheduler.locations.zoom.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        Zoom
                      </Badge>
                    )}
                    {scheduler.locations.phone.enabled && (
                      <Badge variant="secondary" className="text-xs">Phone</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyBookingLink(scheduler.name)}
                    className="flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Link
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scheduler Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Appointment Scheduler</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduler-name">Scheduler Name *</Label>
                  <Input
                    id="scheduler-name"
                    value={activeScheduler.name}
                    onChange={(e) => setActiveScheduler(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Consultation Call"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={activeScheduler.duration.toString()}
                    onValueChange={(value) => setActiveScheduler(prev => ({ ...prev, duration: parseInt(value) }))}
                  >
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
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={activeScheduler.description}
                  onChange={(e) => setActiveScheduler(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this appointment is about..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Weekly Availability</h3>
                {activeScheduler.timeSlots.map((slot, index) => (
                  <div key={slot.day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-20">
                      <Switch
                        checked={slot.enabled}
                        onCheckedChange={(enabled) => {
                          const newSlots = [...activeScheduler.timeSlots];
                          newSlots[index] = { ...slot, enabled };
                          setActiveScheduler(prev => ({ ...prev, timeSlots: newSlots }));
                        }}
                      />
                      <span className="text-sm font-medium capitalize ml-2">{slot.day}</span>
                    </div>
                    {slot.enabled && (
                      <>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            const newSlots = [...activeScheduler.timeSlots];
                            newSlots[index] = { ...slot, startTime: e.target.value };
                            setActiveScheduler(prev => ({ ...prev, timeSlots: newSlots }));
                          }}
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            const newSlots = [...activeScheduler.timeSlots];
                            newSlots[index] = { ...slot, endTime: e.target.value };
                            setActiveScheduler(prev => ({ ...prev, timeSlots: newSlots }));
                          }}
                          className="w-32"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Meeting Locations</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Switch
                      checked={activeScheduler.locations.inPerson.enabled}
                      onCheckedChange={(enabled) => 
                        setActiveScheduler(prev => ({
                          ...prev,
                          locations: { ...prev.locations, inPerson: { ...prev.locations.inPerson, enabled } }
                        }))
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">In-Person Meeting</span>
                      </div>
                      {activeScheduler.locations.inPerson.enabled && (
                        <Input
                          placeholder="Enter your address"
                          value={activeScheduler.locations.inPerson.address}
                          onChange={(e) =>
                            setActiveScheduler(prev => ({
                              ...prev,
                              locations: { 
                                ...prev.locations, 
                                inPerson: { ...prev.locations.inPerson, address: e.target.value } 
                              }
                            }))
                          }
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch
                      checked={activeScheduler.locations.googleMeet.enabled}
                      onCheckedChange={(enabled) => 
                        setActiveScheduler(prev => ({
                          ...prev,
                          locations: { ...prev.locations, googleMeet: { enabled } }
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span className="font-medium">Google Meet</span>
                      <Badge variant="secondary" className="text-xs">Auto-generated</Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <Switch
                      checked={activeScheduler.locations.zoom.enabled}
                      onCheckedChange={(enabled) => 
                        setActiveScheduler(prev => ({
                          ...prev,
                          locations: { ...prev.locations, zoom: { ...prev.locations.zoom, enabled } }
                        }))
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4" />
                        <span className="font-medium">Zoom Meeting</span>
                      </div>
                      {activeScheduler.locations.zoom.enabled && (
                        <Input
                          placeholder="Zoom Meeting ID (optional)"
                          value={activeScheduler.locations.zoom.meetingId || ''}
                          onChange={(e) =>
                            setActiveScheduler(prev => ({
                              ...prev,
                              locations: { 
                                ...prev.locations, 
                                zoom: { ...prev.locations.zoom, meetingId: e.target.value } 
                              }
                            }))
                          }
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Switch
                      checked={activeScheduler.locations.phone.enabled}
                      onCheckedChange={(enabled) => 
                        setActiveScheduler(prev => ({
                          ...prev,
                          locations: { ...prev.locations, phone: { enabled } }
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Phone Call</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                  <Select
                    value={activeScheduler.bufferTime.toString()}
                    onValueChange={(value) => setActiveScheduler(prev => ({ ...prev, bufferTime: parseInt(value) }))}
                  >
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
                <div>
                  <Label htmlFor="min-notice">Minimum Advance Notice (hours)</Label>
                  <Select
                    value={activeScheduler.minAdvanceNotice.toString()}
                    onValueChange={(value) => setActiveScheduler(prev => ({ ...prev, minAdvanceNotice: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSaveScheduler} disabled={!activeScheduler.name}>
              Save Scheduler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
