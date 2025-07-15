import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, MapPin, Video, User, Mail, Phone, Globe } from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { usePublicScheduler } from "@/hooks/useAppointmentSchedulers";
import { useCreateBooking } from "@/hooks/useAppointmentBookings";
import { useTimezone } from "@/hooks/useTimezone";

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
  message: string;
}

export const PublicBookingPage = () => {
  const { schedulerSlug } = useParams<{ schedulerSlug: string }>();
  const { toast } = useToast();
  const { data: scheduler, isLoading, error } = usePublicScheduler(schedulerSlug || '');
  const createBooking = useCreateBooking();
  const { userTimezone, formatTimeInTimezone } = useTimezone();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    message: ""
  });
  const [step, setStep] = useState<'datetime' | 'location' | 'details' | 'confirmation'>('datetime');

  const generateTimeSlots = (date: Date) => {
    if (!scheduler?.availability) return [];
    
    const dayName = format(date, 'EEEE').toLowerCase();
    const availabilityData = scheduler.availability as any[];
    const dayAvailability = availabilityData.find(day => day.day === dayName);
    
    console.log('Generating time slots for:', dayName);
    console.log('Day availability:', dayAvailability);
    
    if (!dayAvailability?.enabled || !dayAvailability?.timeSlots?.length) {
      console.log('No time slots configured for this day');
      return [];
    }
    
    const slots: Array<{time: string, displayTime: string}> = [];
    
    // Use the EXACT time slots configured by the user
    dayAvailability.timeSlots.forEach((timeSlot: any) => {
      console.log('Processing configured time slot:', timeSlot);
      
      // Use the exact start time from the configured time slot
      const timeString = timeSlot.startTime;
      
      // Parse the time to create a proper date for comparison
      const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
      const slotDateTime = new Date(date);
      slotDateTime.setHours(startHour, startMin, 0, 0);
      
      // Check if slot is in the future (for today only)
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isInFuture = !isToday || slotDateTime > now;
      
      if (isInFuture) {
        const displayTime = formatTimeInTimezone(timeString, userTimezone);
        slots.push({
          time: timeString,
          displayTime: displayTime
        });
      }
    });
    
    console.log('Generated exact time slots:', slots);
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleDateTimeNext = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select date and time",
        variant: "destructive"
      });
      return;
    }
    setStep('location');
  };

  const handleLocationNext = () => {
    if (!selectedLocation) {
      toast({
        title: "Please select a meeting location",
        variant: "destructive"
      });
      return;
    }
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !selectedDate || !selectedTime || !scheduler) {
      toast({
        title: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Submitting booking with:', {
        scheduler_id: scheduler.id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        location_type: selectedLocation,
        notes: formData.notes,
        booking_message: formData.message,
        customer_timezone: userTimezone,
        appointment_timezone: userTimezone
      });

      await createBooking.mutateAsync({
        scheduler_id: scheduler.id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || '',
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        location_type: selectedLocation,
        notes: formData.notes || '',
        booking_message: formData.message || '',
        customer_timezone: userTimezone,
        appointment_timezone: userTimezone
      });
      
      setStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scheduler...</p>
        </div>
      </div>
    );
  }

  if (error || !scheduler) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Scheduler Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">The requested appointment scheduler could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium">{scheduler.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {formatTimeInTimezone(selectedTime, userTimezone)} ({userTimezone})
              </p>
            </div>
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to {formData.email}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            {scheduler.image_url && (
              <img 
                src={scheduler.image_url} 
                alt={scheduler.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{scheduler.name}</h1>
              {scheduler.description && (
                <p className="text-gray-600 mt-2">{scheduler.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{scheduler.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Your timezone: {userTimezone}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Steps Progress */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {['datetime', 'location', 'details'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step === stepName ? 'bg-blue-500 text-white' : 
                      ['datetime', 'location', 'details'].indexOf(step) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {index + 1}
                  </div>
                  {index < 2 && <div className="w-16 h-0.5 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {step === 'datetime' && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>Times shown in your timezone ({userTimezone})</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      if (date < new Date() || date > addDays(new Date(), scheduler?.max_advance_booking || 30)) {
                        return true;
                      }
                      
                      // Check if this date has any available time slots
                      const dayName = format(date, 'EEEE').toLowerCase();
                      const availabilityData = scheduler?.availability as any[];
                      const dayAvailability = availabilityData?.find(day => day.day === dayName);
                      
                      return !dayAvailability?.enabled || !dayAvailability?.timeSlots?.length;
                    }}
                    className="rounded-md border"
                  />
                  
                  {selectedDate && (
                    <div>
                      <Label>Available Times</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {generateTimeSlots(selectedDate).map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(slot.time)}
                            className="text-xs"
                          >
                            {slot.displayTime}
                          </Button>
                        ))}
                      </div>
                      {generateTimeSlots(selectedDate).length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">No available times for this date.</p>
                      )}
                    </div>
                  )}
                  
                  <Button onClick={handleDateTimeNext} className="w-full">
                    Next
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 'location' && scheduler.locations && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Meeting Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(scheduler.locations as any).inPerson?.enabled && (
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLocation === 'inPerson' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLocation('inPerson')}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">In-Person Meeting</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{(scheduler.locations as any).inPerson.address}</p>
                    </div>
                  )}

                  {(scheduler.locations as any).googleMeet?.enabled && (
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLocation === 'googleMeet' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLocation('googleMeet')}
                    >
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span className="font-medium">Google Meet</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Meeting link will be provided</p>
                    </div>
                  )}

                  {(scheduler.locations as any).phone?.enabled && (
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLocation === 'phone' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedLocation('phone')}
                    >
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">Phone Call</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">We'll call you at the scheduled time</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleLocationNext} className="flex-1">
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'details' && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us about your needs or questions"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Anything else you'd like us to know?"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep('location')} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-1" 
                      disabled={createBooking.isPending}
                    >
                      {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select date'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {selectedTime ? `${formatTimeInTimezone(selectedTime, userTimezone)} (${userTimezone})` : 'Select time'} ({scheduler.duration} minutes)
                  </span>
                </div>

                {selectedLocation && (
                  <div className="flex items-center gap-2">
                    {selectedLocation === 'inPerson' && <MapPin className="w-4 h-4 text-gray-400" />}
                    {selectedLocation === 'googleMeet' && <Video className="w-4 h-4 text-gray-400" />}
                    {selectedLocation === 'phone' && <Phone className="w-4 h-4 text-gray-400" />}
                    <span className="text-sm">
                      {selectedLocation === 'inPerson' && 'In-Person Meeting'}
                      {selectedLocation === 'googleMeet' && 'Google Meet'}
                      {selectedLocation === 'phone' && 'Phone Call'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
