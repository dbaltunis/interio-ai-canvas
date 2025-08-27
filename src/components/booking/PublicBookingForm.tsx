
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, MapPin, User, Phone, Mail, Video, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
import { useCreateBooking } from "@/hooks/useAppointmentBookings";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PublicBookingFormProps {
  slug: string;
}

export const PublicBookingForm = ({ slug }: PublicBookingFormProps) => {
  const { scheduler, isLoading, generateAvailableSlots, getAvailableDates } = useAppointmentBooking(slug);
  const createBooking = useCreateBooking();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!scheduler) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Booking Not Found</h2>
        <p className="text-muted-foreground">The booking link you're looking for doesn't exist or has been disabled.</p>
      </div>
    );
  }

  const availableSlots = selectedDate ? generateAvailableSlots(selectedDate) : [];
  const availableDates = getAvailableDates();
  
  const locations = scheduler.locations as any || {};
  const getLocationBadges = () => {
    const badges = [];
    if (locations?.inPerson?.enabled) {
      badges.push({ icon: MapPin, label: "In-Person", address: locations.inPerson.address });
    }
    if (locations?.googleMeet?.enabled) {
      badges.push({ icon: Video, label: "Google Meet" });
    }
    if (locations?.zoom?.enabled) {
      badges.push({ icon: Video, label: "Zoom" });
    }
    if (locations?.phone?.enabled) {
      badges.push({ icon: Phone, label: "Phone Call" });
    }
    return badges;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email || !scheduler) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking.mutateAsync({
        scheduler_id: scheduler.id,
        customer_name: clientInfo.name,
        customer_email: clientInfo.email,
        customer_phone: clientInfo.phone || undefined,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        location_type: 'video_call', // Default for now
        notes: clientInfo.notes || undefined,
        status: 'confirmed'
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setClientInfo({ name: '', email: '', phone: '', notes: '' });
      
      toast({
        title: "Booking Confirmed!",
        description: "You will receive a confirmation email shortly.",
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-2xl lg:max-w-4xl">
        {/* Mobile-First Header */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {scheduler.image_url && (
                <img 
                  src={scheduler.image_url} 
                  alt={scheduler.name}
                  className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover shadow-md"
                />
              )}
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl font-bold">{scheduler.name}</CardTitle>
                {scheduler.description && (
                  <CardDescription className="mt-2 text-sm sm:text-base">{scheduler.description}</CardDescription>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                <Clock className="w-4 h-4" />
                {scheduler.duration} min
              </Badge>
              {getLocationBadges().map((location, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                  <location.icon className="w-4 h-4" />
                  {location.label}
                </Badge>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Mobile-First Booking Flow */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {/* Step 1: Date & Time Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  1
                </div>
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mobile Date Picker */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Choose Date</Label>
                <div className="lg:hidden">
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
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "EEEE, MMMM d") : "Select a date"}
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => !availableDates.some(availableDate => 
                          availableDate.toDateString() === date.toDateString()
                        )}
                        className={cn("p-3 pointer-events-auto")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Desktop Calendar */}
                <div className="hidden lg:block">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => !availableDates.some(availableDate => 
                      availableDate.toDateString() === date.toDateString()
                    )}
                    className={cn("rounded-md border w-full p-3 pointer-events-auto")}
                  />
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Available Times
                  </Label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="lg"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={cn(
                            "h-12 text-sm font-medium",
                            !slot.available && "opacity-50 cursor-not-allowed",
                            selectedTime === slot.time && "shadow-md"
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No available times for this date</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  2
                </div>
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-name" className="text-base font-medium">Full Name *</Label>
                  <Input
                    id="client-name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="client-email" className="text-base font-medium">Email Address *</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="client-phone" className="text-base font-medium">Phone Number</Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="client-notes" className="text-base font-medium">Additional Notes</Label>
                  <Textarea
                    id="client-notes"
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Tell us about your project, specific requirements, or questions..."
                    rows={4}
                    className="text-base resize-none"
                  />
                </div>
              </div>

              {/* Mobile Booking Summary */}
              {selectedDate && selectedTime && (
                <Card className="bg-muted/50 border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-2">
                        ✓
                      </div>
                      <h4 className="font-semibold">Booking Summary</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center py-1">
                        <CalendarIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center py-1">
                        <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span>{selectedTime} ({scheduler.duration} minutes)</span>
                      </div>
                      {getLocationBadges().map((location, index) => (
                        <div key={index} className="flex items-center py-1">
                          <location.icon className="w-4 h-4 mr-3 text-muted-foreground" />
                          <span>
                            {location.label}
                            {location.address && ` - ${location.address}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Button */}
              <Button 
                onClick={handleBooking}
                className="w-full h-14 text-lg font-semibold shadow-lg"
                disabled={!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email || isSubmitting}
              >
                {isSubmitting ? "Confirming..." : selectedDate && selectedTime ? "Confirm Booking" : "Complete Selection"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
