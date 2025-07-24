import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Clock, Globe, Edit, Trash2, Copy } from "lucide-react";
import { useAppointmentSchedulers, useCreateScheduler, useUpdateScheduler, useDeleteScheduler } from "@/hooks/useAppointmentSchedulers";
import { useToast } from "@/hooks/use-toast";

export const AppointmentSchedulerManager = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingScheduler, setEditingScheduler] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    duration: 60,
    buffer_time: 15,
    max_advance_booking: 30,
    min_advance_notice: 24,
    active: true,
  });

  const { toast } = useToast();
  const { data: schedulers = [], isLoading } = useAppointmentSchedulers();
  const createScheduler = useCreateScheduler();
  const updateScheduler = useUpdateScheduler();
  const deleteScheduler = useDeleteScheduler();

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      duration: 60,
      buffer_time: 15,
      max_advance_booking: 30,
      min_advance_notice: 24,
      active: true,
    });
    setEditingScheduler(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingScheduler) {
        await updateScheduler.mutateAsync({
          id: editingScheduler.id,
          ...formData,
          availability: editingScheduler.availability || {},
          locations: editingScheduler.locations || {},
        });
        setEditingScheduler(null);
      } else {
        await createScheduler.mutateAsync({
          ...formData,
          availability: {},
          locations: {},
        });
        setShowCreateDialog(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving scheduler:', error);
    }
  };

  const handleEdit = (scheduler: any) => {
    setFormData({
      name: scheduler.name,
      description: scheduler.description || '',
      slug: scheduler.slug,
      duration: scheduler.duration,
      buffer_time: scheduler.buffer_time,
      max_advance_booking: scheduler.max_advance_booking,
      min_advance_notice: scheduler.min_advance_notice,
      active: scheduler.active,
    });
    setEditingScheduler(scheduler);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheduler?')) {
      try {
        await deleteScheduler.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting scheduler:', error);
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading schedulers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointment Schedulers</h2>
          <p className="text-muted-foreground">Create and manage appointment booking links</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary hover:bg-brand-accent text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Scheduler
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Appointment Scheduler</DialogTitle>
              <DialogDescription>
                Set up a new appointment booking scheduler
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Consultation Booking"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        name,
                        slug: prev.slug === '' ? generateSlug(name) : prev.slug
                      }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="consultation-booking"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this appointment type"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer_time">Buffer (minutes)</Label>
                  <Input
                    id="buffer_time"
                    type="number"
                    min="0"
                    max="60"
                    value={formData.buffer_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, buffer_time: parseInt(e.target.value) || 15 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_advance_booking">Max Advance (days)</Label>
                  <Input
                    id="max_advance_booking"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.max_advance_booking}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_advance_booking: parseInt(e.target.value) || 30 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_advance_notice">Min Notice (hours)</Label>
                  <Input
                    id="min_advance_notice"
                    type="number"
                    min="0"
                    max="168"
                    value={formData.min_advance_notice}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_advance_notice: parseInt(e.target.value) || 24 }))}
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

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createScheduler.isPending}
                  className="bg-brand-primary hover:bg-brand-accent text-white"
                >
                  {createScheduler.isPending ? 'Creating...' : 'Create Scheduler'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedulers List */}
      <div className="grid gap-4">
        {schedulers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No schedulers yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first appointment scheduler to start accepting bookings
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-brand-primary hover:bg-brand-accent text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Scheduler
              </Button>
            </CardContent>
          </Card>
        ) : (
          schedulers.map(scheduler => (
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
                    <CardDescription>
                      {scheduler.description || 'No description'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyBookingLink(scheduler.slug)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(scheduler)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="destructive"
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{scheduler.duration} minutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{scheduler.max_advance_booking} days advance</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{scheduler.min_advance_notice}h notice</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>/book/{scheduler.slug}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editingScheduler && (
        <Dialog open={!!editingScheduler} onOpenChange={() => setEditingScheduler(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Scheduler</DialogTitle>
              <DialogDescription>
                Update scheduler settings
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Same form fields as create dialog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">URL Slug *</Label>
                  <Input
                    id="edit-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="15"
                    max="480"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-buffer_time">Buffer (minutes)</Label>
                  <Input
                    id="edit-buffer_time"
                    type="number"
                    min="0"
                    max="60"
                    value={formData.buffer_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, buffer_time: parseInt(e.target.value) || 15 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-max_advance_booking">Max Advance (days)</Label>
                  <Input
                    id="edit-max_advance_booking"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.max_advance_booking}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_advance_booking: parseInt(e.target.value) || 30 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-min_advance_notice">Min Notice (hours)</Label>
                  <Input
                    id="edit-min_advance_notice"
                    type="number"
                    min="0"
                    max="168"
                    value={formData.min_advance_notice}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_advance_notice: parseInt(e.target.value) || 24 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingScheduler(null)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateScheduler.isPending}
                  className="bg-brand-primary hover:bg-brand-accent text-white"
                >
                  {updateScheduler.isPending ? 'Updating...' : 'Update Scheduler'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};