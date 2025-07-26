
import { useState } from "react";
import { useAppointmentSchedulers, useCreateScheduler, useUpdateScheduler, useDeleteScheduler } from "@/hooks/useAppointmentSchedulers";
import { useAppointmentBookings } from "@/hooks/useAppointmentBookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Settings, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SchedulerFormData {
  name: string;
  description: string;
  duration: number;
  max_advance_booking: number;
  buffer_time: number;
  active: boolean;
  availability: any;
  google_meet_link?: string;
}

const initialFormData: SchedulerFormData = {
  name: "",
  description: "",
  duration: 30,
  max_advance_booking: 30,
  buffer_time: 15,
  active: true,
  availability: {},
  google_meet_link: "",
};

const defaultAvailability = {
  monday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
  tuesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
  wednesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
  thursday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
  friday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
  saturday: { enabled: false, timeSlots: [] },
  sunday: { enabled: false, timeSlots: [] },
};

export const SchedulerManagement = () => {
  const { data: schedulers, isLoading } = useAppointmentSchedulers();
  const { data: bookings } = useAppointmentBookings();
  const createScheduler = useCreateScheduler();
  const updateScheduler = useUpdateScheduler();
  const deleteScheduler = useDeleteScheduler();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedScheduler, setSelectedScheduler] = useState<any>(null);
  const [formData, setFormData] = useState<SchedulerFormData>(initialFormData);

  const handleCreateScheduler = async () => {
    try {
      await createScheduler.mutateAsync({
        ...formData,
        availability: formData.availability || defaultAvailability,
      });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Scheduler created successfully",
      });
    } catch (error) {
      console.error("Error creating scheduler:", error);
    }
  };

  const handleUpdateScheduler = async () => {
    if (!selectedScheduler) return;
    
    try {
      await updateScheduler.mutateAsync({
        id: selectedScheduler.id,
        updates: formData,
      });
      setIsEditDialogOpen(false);
      setSelectedScheduler(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Scheduler updated successfully",
      });
    } catch (error) {
      console.error("Error updating scheduler:", error);
    }
  };

  const handleDeleteScheduler = async (id: string) => {
    try {
      await deleteScheduler.mutateAsync(id);
      toast({
        title: "Success",
        description: "Scheduler deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting scheduler:", error);
    }
  };

  const getBookingCountForScheduler = (schedulerId: string) => {
    return bookings?.filter(booking => booking.scheduler_id === schedulerId).length || 0;
  };

  const getRecentBookingsForScheduler = (schedulerId: string) => {
    return bookings?.filter(booking => booking.scheduler_id === schedulerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3) || [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground">Loading schedulers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Appointment Schedulers</h2>
          <p className="text-muted-foreground">
            Manage your public booking pages and availability
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Scheduler
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Scheduler</DialogTitle>
              <DialogDescription>
                Set up a new public booking page for appointments
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Scheduler Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 30-min consultation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
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

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this appointment is for..."
                />
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
                  <Label htmlFor="buffer_time">Buffer Time (minutes)</Label>
                  <Input
                    id="buffer_time"
                    type="number"
                    value={formData.buffer_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, buffer_time: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_meet_link">Google Meet Link (optional)</Label>
                <Input
                  id="google_meet_link"
                  value={formData.google_meet_link || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_meet_link: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Active (available for booking)</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData(initialFormData);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateScheduler} disabled={createScheduler.isPending}>
                {createScheduler.isPending ? "Creating..." : "Create Scheduler"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedulers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schedulers?.map((scheduler) => {
          const bookingCount = getBookingCountForScheduler(scheduler.id);
          const recentBookings = getRecentBookingsForScheduler(scheduler.id);
          
          return (
            <Card key={scheduler.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{scheduler.name}</CardTitle>
                    <CardDescription>{scheduler.description}</CardDescription>
                  </div>
                  <Badge variant={scheduler.active ? "default" : "secondary"}>
                    {scheduler.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{scheduler.duration} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{bookingCount} bookings</span>
                  </div>
                </div>

                {recentBookings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Bookings</h4>
                    <div className="space-y-1">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                          <div className="font-medium text-foreground">{booking.customer_name}</div>
                          <div>{format(new Date(booking.appointment_date), 'MMM d')} at {booking.appointment_time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedScheduler(scheduler);
                      setFormData({
                        name: scheduler.name,
                        description: scheduler.description,
                        duration: scheduler.duration,
                        max_advance_booking: scheduler.max_advance_booking || 30,
                        buffer_time: scheduler.buffer_time || 15,
                        active: scheduler.active,
                        availability: scheduler.availability || defaultAvailability,
                        google_meet_link: scheduler.google_meet_link || "",
                      });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/book/${scheduler.slug}`;
                      navigator.clipboard.writeText(url);
                      toast({
                        title: "Link copied!",
                        description: "Booking link has been copied to clipboard",
                      });
                    }}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Share
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteScheduler(scheduler.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scheduler</DialogTitle>
            <DialogDescription>
              Update your scheduler settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Scheduler Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., 30-min consultation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
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

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this appointment is for..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-max-advance">Max Advance Booking (days)</Label>
                <Input
                  id="edit-max-advance"
                  type="number"
                  value={formData.max_advance_booking}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_advance_booking: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-buffer">Buffer Time (minutes)</Label>
                <Input
                  id="edit-buffer"
                  type="number"
                  value={formData.buffer_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, buffer_time: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-google-meet">Google Meet Link (optional)</Label>
              <Input
                id="edit-google-meet"
                value={formData.google_meet_link || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, google_meet_link: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="edit-active">Active (available for booking)</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedScheduler(null);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateScheduler} disabled={updateScheduler.isPending}>
              {updateScheduler.isPending ? "Updating..." : "Update Scheduler"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
