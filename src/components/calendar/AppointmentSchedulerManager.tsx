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
import { Calendar, Clock, MapPin, Video, Plus, Settings, Link, Copy, Trash2, Save, CalendarPlus, Edit, Upload, Image, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppointmentSchedulers, useCreateScheduler, useUpdateScheduler, useDeleteScheduler } from "@/hooks/useAppointmentSchedulers";
import { useUploadFile } from "@/hooks/useFileStorage";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEmailIntegration } from "./CalendarEmailIntegration";

interface TimeSlot {
  startTime: string;
  endTime: string;
  id: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface LocationSettings {
  inPerson?: { enabled: boolean; address?: string };
  googleMeet?: { enabled: boolean };
  zoom?: { enabled: boolean; meetingId?: string };
  phone?: { enabled: boolean };
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const AppointmentSchedulerManager = () => {
  const { toast } = useToast();
  const { data: schedulers, isLoading } = useAppointmentSchedulers();
  const createScheduler = useCreateScheduler();
  const updateScheduler = useUpdateScheduler();
  const deleteScheduler = useDeleteScheduler();
  const uploadFile = useUploadFile();

  const [copiedAvailability, setCopiedAvailability] = useState<DayAvailability | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [activeScheduler, setActiveScheduler] = useState({
    name: '',
    description: '',
    duration: 60,
    buffer_time: 15,
    max_advance_booking: 30,
    min_advance_notice: 24,
    slug: '',
    image_url: '',
    availability: DAYS_OF_WEEK.map(day => ({
      day,
      enabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
      timeSlots: [{ id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }]
    })),
    locations: {
      inPerson: { enabled: true, address: '' },
      googleMeet: { enabled: false },
      zoom: { enabled: false, meetingId: '' },
      phone: { enabled: false }
    } as LocationSettings
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedFile = await uploadFile.mutateAsync({
        file,
        projectId: 'scheduler-images',
        bucketName: 'project-images'
      });

      const { data } = await supabase.storage
        .from('project-images')
        .getPublicUrl(uploadedFile.file_path);

      setActiveScheduler(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveScheduler = async () => {
    if (!activeScheduler.name) {
      toast({
        title: "Error",
        description: "Please enter a scheduler name",
        variant: "destructive"
      });
      return;
    }

    const slug = generateSlug(activeScheduler.name);
    const schedulerData = {
      ...activeScheduler,
      slug,
      availability: activeScheduler.availability,
      locations: activeScheduler.locations
    };

    try {
      if (editingId) {
        await updateScheduler.mutateAsync({ id: editingId, ...schedulerData });
      } else {
        await createScheduler.mutateAsync(schedulerData);
      }
      
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const resetForm = () => {
    setActiveScheduler({
      name: '',
      description: '',
      duration: 60,
      buffer_time: 15,
      max_advance_booking: 30,
      min_advance_notice: 24,
      slug: '',
      image_url: '',
      availability: DAYS_OF_WEEK.map(day => ({
        day,
        enabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
        timeSlots: [{ id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }]
      })),
      locations: {
        inPerson: { enabled: true, address: '' },
        googleMeet: { enabled: false },
        zoom: { enabled: false, meetingId: '' },
        phone: { enabled: false }
      }
    });
  };

  const generateBookingLink = (schedulerName: string, schedulerId: string) => {
    const baseUrl = window.location.origin;
    const slug = generateSlug(schedulerName);
    return `${baseUrl}/book/${slug}`;
  };

  const copyBookingLink = (schedulerName: string, schedulerId: string) => {
    const link = generateBookingLink(schedulerName, schedulerId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard"
    });
  };

  const handleEditScheduler = (scheduler: any) => {
    const locations = scheduler.locations as LocationSettings || {};
    
    setActiveScheduler({
      name: scheduler.name,
      description: scheduler.description || '',
      duration: scheduler.duration,
      buffer_time: scheduler.buffer_time,
      max_advance_booking: scheduler.max_advance_booking,
      min_advance_notice: scheduler.min_advance_notice,
      slug: scheduler.slug,
      image_url: scheduler.image_url || '',
      availability: scheduler.availability || DAYS_OF_WEEK.map(day => ({
        day,
        enabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day),
        timeSlots: [{ id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }]
      })),
      locations: {
        inPerson: locations.inPerson || { enabled: true, address: '' },
        googleMeet: locations.googleMeet || { enabled: false },
        zoom: locations.zoom || { enabled: false, meetingId: '' },
        phone: locations.phone || { enabled: false }
      }
    });
    setEditingId(scheduler.id);
    setIsEditing(true);
  };

  const handleDeleteScheduler = (schedulerId: string) => {
    if (confirm('Are you sure you want to delete this scheduler?')) {
      deleteScheduler.mutate(schedulerId);
    }
  };

  const addTimeSlot = (dayIndex: number) => {
    const newAvailability = [...activeScheduler.availability];
    newAvailability[dayIndex].timeSlots.push({
      id: crypto.randomUUID(),
      startTime: '09:00',
      endTime: '17:00'
    });
    setActiveScheduler(prev => ({ ...prev, availability: newAvailability }));
  };

  const removeTimeSlot = (dayIndex: number, slotId: string) => {
    const newAvailability = [...activeScheduler.availability];
    newAvailability[dayIndex].timeSlots = newAvailability[dayIndex].timeSlots.filter(slot => slot.id !== slotId);
    setActiveScheduler(prev => ({ ...prev, availability: newAvailability }));
  };

  const updateTimeSlot = (dayIndex: number, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    const newAvailability = [...activeScheduler.availability];
    const slotIndex = newAvailability[dayIndex].timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex >= 0) {
      newAvailability[dayIndex].timeSlots[slotIndex][field] = value;
      setActiveScheduler(prev => ({ ...prev, availability: newAvailability }));
    }
  };

  const copyDayAvailability = (dayIndex: number) => {
    setCopiedAvailability(activeScheduler.availability[dayIndex]);
    toast({
      title: "Copied",
      description: `${activeScheduler.availability[dayIndex].day} availability copied`
    });
  };

  const pasteDayAvailability = (dayIndex: number) => {
    if (!copiedAvailability) return;
    
    const newAvailability = [...activeScheduler.availability];
    newAvailability[dayIndex] = {
      ...copiedAvailability,
      day: newAvailability[dayIndex].day,
      timeSlots: copiedAvailability.timeSlots.map(slot => ({
        ...slot,
        id: crypto.randomUUID()
      }))
    };
    setActiveScheduler(prev => ({ ...prev, availability: newAvailability }));
    
    toast({
      title: "Pasted",
      description: `Availability pasted to ${newAvailability[dayIndex].day}`
    });
  };

  const toggleDayEnabled = (dayIndex: number) => {
    const newAvailability = [...activeScheduler.availability];
    newAvailability[dayIndex].enabled = !newAvailability[dayIndex].enabled;
    setActiveScheduler(prev => ({ ...prev, availability: newAvailability }));
  };

  const createNewScheduler = () => {
    resetForm();
    setEditingId(null);
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedulers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointment Scheduling</h1>
          <p className="text-gray-600 mt-1">Create and manage your appointment booking calendars</p>
        </div>
        <Button onClick={createNewScheduler}>
          <Plus className="w-4 h-4 mr-2" />
          New Scheduler
        </Button>
      </div>

      {/* Existing Schedulers */}
      {schedulers && schedulers.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedulers.map((scheduler) => {
            const locations = scheduler.locations as LocationSettings || {};
            return (
              <Card key={scheduler.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    {scheduler.image_url && (
                      <img 
                        src={scheduler.image_url} 
                        alt={scheduler.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{scheduler.name}</CardTitle>
                      <p className="text-sm text-gray-600">{scheduler.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{scheduler.duration} minutes</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {locations.inPerson?.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          In-Person
                        </Badge>
                      )}
                      {locations.googleMeet?.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          Google Meet
                        </Badge>
                      )}
                      {locations.zoom?.enabled && (
                        <Badge variant="secondary" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          Zoom
                        </Badge>
                      )}
                      {locations.phone?.enabled && (
                        <Badge variant="secondary" className="text-xs">Phone</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyBookingLink(scheduler.name, scheduler.id)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Link
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditScheduler(scheduler)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteScheduler(scheduler.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Scheduler Configuration */}
      {(isEditing || !schedulers || schedulers.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Appointment Scheduler' : 'Configure Appointment Scheduler'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="email">Email Integration</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
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

                <div>
                  <Label htmlFor="image-upload">Business/Person Image</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {activeScheduler.image_url && (
                      <img 
                        src={activeScheduler.image_url} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Weekly Availability</h3>
                    {copiedAvailability && (
                      <Badge variant="outline">
                        {copiedAvailability.day} availability copied
                      </Badge>
                    )}
                  </div>
                  
                  {activeScheduler.availability.map((dayAvail, dayIndex) => (
                    <div key={dayAvail.day} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={dayAvail.enabled}
                            onCheckedChange={() => toggleDayEnabled(dayIndex)}
                          />
                          <span className="font-medium capitalize">{dayAvail.day}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyDayAvailability(dayIndex)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {copiedAvailability && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pasteDayAvailability(dayIndex)}
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addTimeSlot(dayIndex)}
                            disabled={!dayAvail.enabled}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {dayAvail.enabled && (
                        <div className="space-y-2">
                          {dayAvail.timeSlots.map((slot) => (
                            <div key={slot.id} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'startTime', e.target.value)}
                                className="w-32"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(dayIndex, slot.id, 'endTime', e.target.value)}
                                className="w-32"
                              />
                              {dayAvail.timeSlots.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeTimeSlot(dayIndex, slot.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
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

              <TabsContent value="email">
                <CalendarEmailIntegration />
              </TabsContent>

              <TabsContent value="integrations" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Calendar Integrations</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CalendarPlus className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Google Calendar</span>
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Sync appointments with your Google Calendar automatically.
                      </p>
                      <Button disabled variant="outline" className="w-full">
                        Connect Google Calendar
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CalendarPlus className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">Apple Calendar</span>
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Sync appointments with your Apple Calendar via CalDAV.
                      </p>
                      <Button disabled variant="outline" className="w-full">
                        Connect Apple Calendar
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CalendarPlus className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Outlook Calendar</span>
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Sync appointments with your Outlook Calendar.
                      </p>
                      <Button disabled variant="outline" className="w-full">
                        Connect Outlook Calendar
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Link className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Webhook Integration</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Send appointment data to external systems via webhook.
                      </p>
                      <Input placeholder="Webhook URL" className="mb-2" />
                      <Button variant="outline" className="w-full">
                        Configure Webhook
                      </Button>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                    <Select
                      value={activeScheduler.buffer_time.toString()}
                      onValueChange={(value) => setActiveScheduler(prev => ({ ...prev, buffer_time: parseInt(value) }))}
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
                      value={activeScheduler.min_advance_notice.toString()}
                      onValueChange={(value) => setActiveScheduler(prev => ({ ...prev, min_advance_notice: parseInt(value) }))}
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
                  <div>
                    <Label htmlFor="max-advance">Maximum Advance Booking (days)</Label>
                    <Select
                      value={activeScheduler.max_advance_booking.toString()}
                      onValueChange={(value) => setActiveScheduler(prev => ({ ...prev, max_advance_booking: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                        <SelectItem value="60">2 months</SelectItem>
                        <SelectItem value="90">3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

            </Tabs>

            <div className="flex justify-between pt-6 border-t">
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              )}
              <div className="flex-1" />
              <Button 
                onClick={handleSaveScheduler} 
                disabled={!activeScheduler.name || createScheduler.isPending || updateScheduler.isPending}
              >
                {editingId ? 'Update Scheduler' : 'Save Scheduler'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Integration for existing schedulers */}
      {schedulers && schedulers.length > 0 && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Integration
            </CardTitle>
            <p className="text-sm text-gray-600">
              Embed your booking calendars in emails for seamless scheduling
            </p>
          </CardHeader>
          <CardContent>
            <CalendarEmailIntegration />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
