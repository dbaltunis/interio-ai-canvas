import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, User, Mail, Phone, MapPin, MessageSquare, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Booking {
  id: string;
  scheduler_id: string;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  location_type?: string;
  notes?: string;
  booking_message?: string;
  customer_timezone?: string;
  appointment_timezone?: string;
  status: string;
  created_at: string;
}

interface BookingWithScheduler extends Booking {
  scheduler: {
    name: string;
    duration: number;
    google_meet_link?: string;
  };
}

export const BookingManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithScheduler | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch all bookings with scheduler details
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["user-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments_booked")
        .select(`
          *,
          scheduler:appointment_schedulers(name, duration, google_meet_link)
        `)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      return data as BookingWithScheduler[];
    },
  });

  // Update booking status
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments_booked")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast({
        title: "Success",
        description: "Booking status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  // Delete booking
  const deleteBooking = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments_booked")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast({
        title: "Success",
        description: "Booking deleted",
      });
      setShowDetails(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "no-show": return "bg-muted text-muted-foreground border-muted";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    if (filterStatus === "all") return true;
    return booking.status === filterStatus;
  }) || [];

  const upcomingBookings = filteredBookings.filter(booking => 
    new Date(`${booking.appointment_date}T${booking.appointment_time}`) >= new Date()
  );

  const pastBookings = filteredBookings.filter(booking => 
    new Date(`${booking.appointment_date}T${booking.appointment_time}`) < new Date()
  );

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <div className="flex gap-2">
          {["all", "confirmed", "cancelled", "completed", "no-show"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredBookings.filter(b => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredBookings.filter(b => b.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredBookings.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Bookings ({upcomingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{booking.customer_name}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(`${booking.appointment_date}T${booking.appointment_time}`), 'PPP p')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {booking.scheduler.name} ({booking.scheduler.duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {booking.customer_email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBookingStatus.mutate({ id: booking.id, status: "completed" });
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBookingStatus.mutate({ id: booking.id, status: "cancelled" });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Bookings ({pastBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.slice(0, 10).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer opacity-75"
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{booking.customer_name}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(`${booking.appointment_date}T${booking.appointment_time}`), 'PPP p')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              {filterStatus === "all" 
                ? "You don't have any bookings yet."
                : `No ${filterStatus} bookings found.`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View and manage booking information
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {selectedBooking.customer_name}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {selectedBooking.customer_email}
                  </div>
                </div>
                {selectedBooking.customer_phone && (
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4" />
                      {selectedBooking.customer_phone}
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(`${selectedBooking.appointment_date}T${selectedBooking.appointment_time}`), 'PPP p')}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    {selectedBooking.scheduler.duration} minutes
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Schedule Type</Label>
                  <div className="mt-1">{selectedBooking.scheduler.name}</div>
                </div>
                {selectedBooking.location_type && (
                  <div>
                    <Label className="text-sm font-medium">Meeting Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {selectedBooking.location_type}
                    </div>
                  </div>
                )}
              </div>

              {selectedBooking.scheduler.google_meet_link && (
                <div>
                  <Label className="text-sm font-medium">Google Meet Link</Label>
                  <div className="mt-1 p-2 bg-blue-50 rounded border">
                    <a 
                      href={selectedBooking.scheduler.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedBooking.scheduler.google_meet_link}
                    </a>
                  </div>
                </div>
              )}

              {(selectedBooking.notes || selectedBooking.booking_message) && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <div className="mt-1 p-2 bg-muted rounded border">
                    {selectedBooking.notes || selectedBooking.booking_message}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus.mutate({ 
                      id: selectedBooking.id, 
                      status: "confirmed" 
                    })}
                    disabled={selectedBooking.status === "confirmed"}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus.mutate({ 
                      id: selectedBooking.id, 
                      status: "completed" 
                    })}
                    disabled={selectedBooking.status === "completed"}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateBookingStatus.mutate({ 
                      id: selectedBooking.id, 
                      status: "cancelled" 
                    })}
                    disabled={selectedBooking.status === "cancelled"}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this booking?")) {
                      deleteBooking.mutate(selectedBooking.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};