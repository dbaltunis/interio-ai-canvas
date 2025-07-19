import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Copy, ExternalLink, Settings } from "lucide-react";
import { useAppointmentSchedulers, useCreateScheduler, useUpdateScheduler, useDeleteScheduler } from "@/hooks/useAppointmentSchedulers";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AvailabilityEditor } from "./AvailabilityEditor";
import { LocationSettings } from "./LocationSettings";

interface FormData {
  name: string;
  description: string;
  duration: number;
  buffer_time: number;
  max_advance_booking: number;
  min_advance_notice: number;
  slug: string;
  image_url: string;
  active: boolean;
  availability: Array<{
    day: number;
    enabled: boolean;
    slots: Array<{ start: string; end: string }>;
  }>;
  locations: {
    inPerson: { enabled: boolean; address?: string };
    googleMeet: { enabled: boolean };
    zoom: { enabled: boolean; meetingId?: string };
    phone: { enabled: boolean; number?: string };
  };
}

export const AppointmentSchedulerManager = () => {
  const { data: schedulers, isLoading } = useAppointmentSchedulers();
  const createScheduler = useCreateScheduler();
  const updateScheduler = useUpdateScheduler();
  const deleteScheduler = useDeleteScheduler();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    duration: 60,
    buffer_time: 15,
    max_advance_booking: 30,
    min_advance_notice: 24,
    slug: "",
    image_url: "",
    active: true,
    availability: [
      { day: 1, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      { day: 2, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      { day: 3, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      { day: 4, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      { day: 5, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
      { day: 6, enabled: false, slots: [] },
      { day: 0, enabled: false, slots: [] }
    ],
    locations: {
      inPerson: { enabled: true },
      googleMeet: { enabled: false },
      zoom: { enabled: false },
      phone: { enabled: false }
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateScheduler.mutateAsync({ id: editingId, ...formData });
      } else {
        await createScheduler.mutateAsync(formData);
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving scheduler:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: 60,
      buffer_time: 15,
      max_advance_booking: 30,
      min_advance_notice: 24,
      slug: "",
      image_url: "",
      active: true,
      availability: [
        { day: 1, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
        { day: 2, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
        { day: 3, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
        { day: 4, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
        { day: 5, enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
        { day: 6, enabled: false, slots: [] },
        { day: 0, enabled: false, slots: [] }
      ],
      locations: {
        inPerson: { enabled: true },
        googleMeet: { enabled: false },
        zoom: { enabled: false },
        phone: { enabled: false }
      }
    });
    setEditingId(null);
  };

  const handleEdit = (scheduler: any) => {
    setFormData({
      name: scheduler.name,
      description: scheduler.description || "",
      duration: scheduler.duration,
      buffer_time: scheduler.buffer_time,
      max_advance_booking: scheduler.max_advance_booking,
      min_advance_notice: scheduler.min_advance_notice,
      slug: scheduler.slug,
      image_url: scheduler.image_url || "",
      active: scheduler.active,
      availability: scheduler.availability || [],
      locations: scheduler.locations || {
        inPerson: { enabled: true },
        googleMeet: { enabled: false },
        zoom: { enabled: false },
        phone: { enabled: false }
      }
    });
    setEditingId(scheduler.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this scheduler?")) {
      try {
        await deleteScheduler.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting scheduler:", error);
      }
    }
  };

  const copyBookingLink = (slug: string) => {
    const bookingUrl = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(bookingUrl);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard",
    });
  };

  if (isLoading) {
    return <div>Loading appointment schedulers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointment Schedulers</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Scheduler
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Scheduler" : "Create New Scheduler"}
              </DialogTitle>
              <DialogDescription>
                Configure your appointment booking scheduler
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Scheduler Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer_time">Buffer Time (minutes)</Label>
                  <Input
                    id="buffer_time"
                    type="number"
                    value={formData.buffer_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, buffer_time: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_advance_booking">Max Advance Booking (days)</Label>
                  <Input
                    id="max_advance_booking"
                    type="number"
                    value={formData.max_advance_booking}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_advance_booking: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_advance_notice">Min Advance Notice (hours)</Label>
                  <Input
                    id="min_advance_notice"
                    type="number"
                    value={formData.min_advance_notice}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_advance_notice: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              {/* Availability Editor */}
              <AvailabilityEditor
                availability={formData.availability}
                onChange={(availability) => setFormData(prev => ({ ...prev, availability }))}
              />

              {/* Location Settings */}
              <LocationSettings
                locations={formData.locations}
                onChange={(locations) => setFormData(prev => ({ ...prev, locations }))}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createScheduler.isPending || updateScheduler.isPending}>
                  {editingId ? "Update" : "Create"} Scheduler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedulers List */}
      {!schedulers || schedulers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Settings className="mx-auto h-12 w-12 mb-4" />
            <p>No appointment schedulers created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedulers.map((scheduler) => (
            <Card key={scheduler.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {scheduler.name}
                      <Badge variant={scheduler.active ? "default" : "secondary"}>
                        {scheduler.active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {scheduler.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyBookingLink(scheduler.slug)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/book/${scheduler.slug}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(scheduler)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(scheduler.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span> {scheduler.duration} min
                  </div>
                  <div>
                    <span className="font-medium">Buffer:</span> {scheduler.buffer_time} min
                  </div>
                  <div>
                    <span className="font-medium">Max Advance:</span> {scheduler.max_advance_booking} days
                  </div>
                  <div>
                    <span className="font-medium">Min Notice:</span> {scheduler.min_advance_notice} hours
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
