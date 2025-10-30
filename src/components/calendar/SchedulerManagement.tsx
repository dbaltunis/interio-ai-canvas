import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentSchedulers, useDeleteScheduler, useUpdateScheduler } from "@/hooks/useAppointmentSchedulers";
import { useToast } from "@/hooks/use-toast";
import { Copy, Edit, Trash2, ExternalLink, Users, Clock, Globe, Save, X, Settings } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AvailabilityEditor } from "./AvailabilityEditor";

export const SchedulerManagement = () => {
  const { data: schedulers, isLoading } = useAppointmentSchedulers();
  const deleteScheduler = useDeleteScheduler();
  const updateScheduler = useUpdateScheduler();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Get booking counts for each scheduler
  const { data: bookingCounts } = useQuery({
    queryKey: ["booking-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments_booked")
        .select("scheduler_id, status")
        .in("status", ["confirmed", "completed"]);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(booking => {
        counts[booking.scheduler_id] = (counts[booking.scheduler_id] || 0) + 1;
      });

      return counts;
    }
  });

  const copyBookingLink = async (slug: string) => {
    const link = `${window.location.origin}/book/${slug}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Link copied!",
        description: "Booking link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteScheduler.mutateAsync(id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete scheduler",
          variant: "destructive",
        });
      }
    }
  };

  const openBookingPage = (slug: string) => {
    window.open(`/book/${slug}`, '_blank');
  };

  const handleEdit = (scheduler: any) => {
    setEditingId(scheduler.id);
    setEditData({
      name: scheduler.name,
      description: scheduler.description || '',
      duration: scheduler.duration,
      availability: scheduler.availability || [],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    try {
      await updateScheduler.mutateAsync({
        id: editingId,
        ...editData,
      });
      setEditingId(null);
      setEditData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update scheduler",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading schedulers...</div>;
  }

  if (!schedulers?.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">No appointment schedulers yet</h3>
          <p className="text-muted-foreground mb-4">Create your first appointment scheduler to start accepting bookings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointment Schedulers</h2>
        <Badge variant="secondary">{schedulers.length} scheduler{schedulers.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid gap-4">
        {schedulers.map((scheduler) => (
          <Card key={scheduler.id} className={`transition-all ${scheduler.active ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {editingId === scheduler.id ? (
                      <Input
                        value={editData.name || ''}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="text-lg font-semibold"
                        placeholder="Scheduler name"
                      />
                    ) : (
                      <CardTitle className="text-lg">{scheduler.name}</CardTitle>
                    )}
                    <Badge variant={scheduler.active ? "default" : "secondary"}>
                      {scheduler.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {editingId === scheduler.id ? (
                    <Textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      placeholder="Description (optional)"
                      className="text-sm"
                      rows={2}
                    />
                  ) : (
                    scheduler.description && (
                      <p className="text-sm text-muted-foreground">{scheduler.description}</p>
                    )
                  )}
                </div>
                {scheduler.image_url && (
                  <img 
                    src={scheduler.image_url} 
                    alt={scheduler.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {editingId === scheduler.id ? (
                    <Input
                      type="number"
                      value={editData.duration || ''}
                      onChange={(e) => setEditData({...editData, duration: parseInt(e.target.value)})}
                      className="w-20 h-6 text-sm"
                      placeholder="60"
                    />
                  ) : (
                    <span className="text-sm">{scheduler.duration} min</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{bookingCounts?.[scheduler.id] || 0} bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">/book/{scheduler.slug}</span>
                </div>
                {scheduler.user_email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{scheduler.user_email}</span>
                  </div>
                )}
              </div>

              {editingId === scheduler.id && (
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    <Settings className="h-4 w-4 inline mr-1" />
                    Available Time Slots:
                  </label>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <AvailabilityEditor
                      availability={editData.availability || {}}
                      onChange={(availability) => setEditData({...editData, availability})}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
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
                  onClick={() => openBookingPage(scheduler.slug)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Page
                </Button>
                
                {editingId === scheduler.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={updateScheduler.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(scheduler)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(scheduler.id, scheduler.name)}
                  disabled={deleteScheduler.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};