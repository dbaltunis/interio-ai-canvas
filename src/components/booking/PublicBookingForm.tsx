
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Phone, Mail, Video } from "lucide-react";
import { format } from "date-fns";
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
import { useToast } from "@/hooks/use-toast";

interface PublicBookingFormProps {
  slug: string;
}

export const PublicBookingForm = ({ slug }: PublicBookingFormProps) => {
  const { scheduler, isLoading, generateAvailableSlots, getAvailableDates } = useAppointmentBooking(slug);
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!scheduler) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-600">The booking link you're looking for doesn't exist or has been disabled.</p>
      </div>
    );
  }

  const availableSlots = selectedDate ? generateAvailableSlots(selectedDate) : [];
  const availableDates = getAvailableDates();
  
  const locations = scheduler.locations as any;
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
    if (!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implement actual booking submission
    toast({
      title: "Booking Submitted",
      description: "Your appointment request has been submitted successfully!",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {scheduler.image_url && (
              <img 
                src={scheduler.image_url} 
                alt={scheduler.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <CardTitle className="text-2xl">{scheduler.name}</CardTitle>
              {scheduler.description && (
                <CardDescription className="mt-2">{scheduler.description}</CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scheduler.duration} minutes
            </Badge>
            {getLocationBadges().map((location, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <location.icon className="w-3 h-3" />
                {location.label}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Date & Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Select Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calendar */}
            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !availableDates.some(availableDate => 
                  availableDate.toDateString() === date.toDateString()
                )}
                className="rounded-md border w-full"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <Label>
                  Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                </Label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={!slot.available ? "opacity-50" : ""}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">No available times for this date.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client-name">Full Name *</Label>
              <Input
                id="client-name"
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="client-email">Email Address *</Label>
              <Input
                id="client-email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <Label htmlFor="client-phone">Phone Number</Label>
              <Input
                id="client-phone"
                type="tel"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="client-notes">Additional Notes</Label>
              <Textarea
                id="client-notes"
                value={clientInfo.notes}
                onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Tell us about your project, specific requirements, or questions..."
                rows={4}
              />
            </div>

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration: {scheduler.duration} minutes
                    </div>
                    {getLocationBadges().map((location, index) => (
                      <div key={index} className="flex items-center">
                        <location.icon className="w-4 h-4 mr-2" />
                        {location.label}
                        {location.address && ` - ${location.address}`}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleBooking}
              className="w-full"
              disabled={!selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email}
            >
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
