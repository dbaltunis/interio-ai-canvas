
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar as CalendarIcon, Check, ArrowLeft, User, Mail, Phone } from "lucide-react";
import { format, addDays, setHours, setMinutes, isSameDay, isAfter, startOfDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingData {
  date: Date | null;
  time: string | null;
  duration: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
}

interface AppointmentBookingSystemProps {
  onBookAppointment: (appointment: any) => void;
}

export const AppointmentBookingSystem = ({ onBookAppointment }: AppointmentBookingSystemProps) => {
  const [step, setStep] = useState<'datetime' | 'details' | 'confirmation'>('datetime');
  const [booking, setBooking] = useState<BookingData>({
    date: null,
    time: null,
    duration: 60,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  });

  const isMobile = useIsMobile();

  // Generate available time slots
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: Math.random() > 0.2 // 80% availability simulation
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isAfter(date, startOfDay(new Date()))) {
      setBooking(prev => ({ ...prev, date, time: null }));
    }
  };

  const handleTimeSelect = (time: string) => {
    setBooking(prev => ({ ...prev, time }));
  };

  const handleNext = () => {
    if (step === 'datetime' && booking.date && booking.time) {
      setStep('details');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('datetime');
    } else if (step === 'confirmation') {
      setStep('details');
    }
  };

  const handleBooking = () => {
    if (!booking.date || !booking.time || !booking.clientName || !booking.clientEmail) {
      return;
    }

    const [hours, minutes] = booking.time.split(':').map(Number);
    const startTime = setMinutes(setHours(booking.date, hours), minutes);
    const endTime = new Date(startTime.getTime() + booking.duration * 60000);

    const appointment = {
      title: `Appointment - ${booking.clientName}`,
      description: booking.notes,
      appointment_type: 'consultation',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: 'To be confirmed',
      client_name: booking.clientName,
      client_email: booking.clientEmail,
      client_phone: booking.clientPhone
    };

    onBookAppointment(appointment);
    setStep('confirmation');
  };

  const renderDateTimeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
        <p className="text-gray-600">Choose your preferred appointment slot</p>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={booking.date || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
              className="rounded-lg border w-full"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Available Times
            </CardTitle>
            {booking.date && (
              <p className="text-sm text-gray-600">
                {format(booking.date, 'EEEE, MMMM d, yyyy')}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {booking.date ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={booking.time === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`h-10 ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Please select a date first</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!booking.date || !booking.time}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Details</h2>
        <p className="text-gray-600">Please provide your contact information</p>
      </div>

      {/* Booking Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Selected Time</p>
              <p className="text-sm text-gray-600">
                {booking.date && format(booking.date, 'EEEE, MMMM d, yyyy')} at {booking.time}
              </p>
              <p className="text-sm text-gray-600">Duration: {booking.duration} minutes</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleBack}>
              Change
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={booking.clientName}
            onChange={(e) => setBooking(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={booking.clientEmail}
            onChange={(e) => setBooking(prev => ({ ...prev, clientEmail: e.target.value }))}
            placeholder="your.email@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={booking.clientPhone}
            onChange={(e) => setBooking(prev => ({ ...prev, clientPhone: e.target.value }))}
            placeholder="(555) 123-4567"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={booking.notes}
            onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Tell us about your specific needs or any questions you have..."
            rows={4}
            className="mt-1 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleBooking}
          disabled={!booking.clientName || !booking.clientEmail}
          className="px-8"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
        <p className="text-gray-600">
          Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-sm">
                {booking.date && format(booking.date, 'EEEE, MMMM d, yyyy')} at {booking.time}
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-sm">{booking.clientName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              <span className="text-sm">{booking.clientEmail}</span>
            </div>
            {booking.clientPhone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">{booking.clientPhone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={() => {
          setStep('datetime');
          setBooking({
            date: null,
            time: null,
            duration: 60,
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            notes: ''
          });
        }}
        variant="outline"
        className="w-full"
      >
        Book Another Appointment
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {['datetime', 'details', 'confirmation'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === stepName
                    ? 'bg-blue-500 text-white'
                    : index < ['datetime', 'details', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {index < ['datetime', 'details', 'confirmation'].indexOf(step) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={`w-12 h-0.5 ml-2 ${
                  index < ['datetime', 'details', 'confirmation'].indexOf(step) 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 'datetime' && renderDateTimeStep()}
      {step === 'details' && renderDetailsStep()}
      {step === 'confirmation' && renderConfirmationStep()}
    </div>
  );
};
