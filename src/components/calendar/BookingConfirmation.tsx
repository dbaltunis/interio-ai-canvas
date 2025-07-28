import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parseISO, isAfter, startOfDay, isSameDay } from "date-fns";
import { Calendar, Clock, MapPin, Mail, Phone, User, Check, ArrowLeft, ChevronRight } from "lucide-react";
import { usePublicScheduler } from "@/hooks/useAppointmentSchedulers";
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
import { useCreateBooking } from "@/hooks/useAppointmentBookings";
import { cn } from "@/lib/utils";

interface BookingConfirmationProps {
  slug: string;
}

export const BookingConfirmation = ({ slug }: BookingConfirmationProps) => {
  const { data: scheduler, isLoading: schedulerLoading } = usePublicScheduler(slug);
  const { data: allSlots } = useSchedulerSlots();
  const createBooking = useCreateBooking();
  const { toast } = useToast();

  // Helper function to get available slots for a specific date
  const getAvailableSlotsForDate = (date: Date) => {
    if (!allSlots) return [];
    
    return allSlots.filter(slot => 
      isSameDay(slot.date, date) && 
      slot.schedulerId === scheduler?.id
    );
  };
  const [step, setStep] = useState(1); // 1: booking, 2: confirmation
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime || !scheduler) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createBooking.mutateAsync({
        scheduler_id: scheduler.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        customer_name: clientInfo.name,
        customer_email: clientInfo.email,
        customer_phone: clientInfo.phone || undefined,
        notes: clientInfo.notes || undefined,
        customer_timezone: clientInfo.timezone,
        appointment_timezone: clientInfo.timezone,
        status: 'confirmed'
      });

      setStep(2);
      toast({
        title: "Booking Confirmed! 🎉",
        description: "You will receive a confirmation email shortly.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  if (schedulerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }

  if (!scheduler) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">Booking Not Available</h1>
          <p className="text-muted-foreground">This booking link is not valid or has been disabled.</p>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3">Your Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span><strong>Service:</strong> {scheduler.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span><strong>Date & Time:</strong> {selectedDate && format(selectedDate, 'PPPP')} at {selectedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span><strong>Duration:</strong> {scheduler.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span><strong>Customer:</strong> {clientInfo.name} ({clientInfo.email})</span>
                </div>
              </div>
            </div>

            {scheduler.google_meet_link && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Meeting Link</h4>
                <a 
                  href={scheduler.google_meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {scheduler.google_meet_link}
                </a>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>A confirmation email has been sent to <strong>{clientInfo.email}</strong></p>
              <p className="mt-2">If you need to reschedule or cancel, please contact us directly.</p>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => window.close()} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {scheduler.image_url && (
            <img 
              src={scheduler.image_url} 
              alt="Profile"
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{scheduler.name}</h1>
          {scheduler.description && (
            <p className="text-gray-600 max-w-2xl mx-auto">{scheduler.description}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {scheduler.duration} minutes
            </div>
            {scheduler.user_email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {scheduler.user_email}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Choose Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between text-left font-normal h-12",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        const today = startOfDay(new Date());
                        if (!isAfter(date, today) && !isSameDay(date, today)) return true;
                        
                        // Check if date has available slots
                        const dateSlots = getAvailableSlotsForDate(date);
                        return dateSlots.length === 0;
                      }}
                      className="rounded-md border"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Available Times</Label>
                  {(() => {
                    const availableSlots = getAvailableSlotsForDate(selectedDate);
                    
                    if (availableSlots.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No available times for this date</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map(slot => (
                          <Button
                            key={slot.startTime}
                            variant={selectedTime === slot.startTime ? "default" : "outline"}
                            size="lg"
                            disabled={slot.isBooked}
                            onClick={() => setSelectedTime(slot.startTime)}
                            className={cn(
                              "h-12 text-sm font-medium",
                              slot.isBooked && "opacity-50 cursor-not-allowed",
                              selectedTime === slot.startTime && "shadow-md"
                            )}
                          >
                            {slot.startTime}
                          </Button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                  placeholder="Any additional information or questions..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmitBooking}
                disabled={!clientInfo.name || !clientInfo.email || !selectedDate || !selectedTime || createBooking.isPending}
                className="w-full"
                size="lg"
              >
                {createBooking.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming Booking...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};