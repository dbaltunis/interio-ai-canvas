
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, User, Phone, Mail, Check, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, setHours, setMinutes, isSameDay } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
}

interface ServiceType {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  color: string;
}

interface AppointmentBookingSystemProps {
  onBookAppointment: (appointment: any) => void;
}

export const AppointmentBookingSystem = ({ onBookAppointment }: AppointmentBookingSystemProps) => {
  const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirmation'>('service');
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const isMobile = useIsMobile();

  const serviceTypes: ServiceType[] = [
    {
      id: 'consultation',
      name: 'Free Consultation',
      duration: 60,
      price: 0,
      description: 'Discuss your window covering needs and get expert advice',
      color: 'blue'
    },
    {
      id: 'measurement',
      name: 'Measurement Visit',
      duration: 90,
      price: 50,
      description: 'Professional measurement of your windows',
      color: 'green'
    },
    {
      id: 'installation',
      name: 'Installation Service',
      duration: 180,
      price: 150,
      description: 'Professional installation of your window coverings',
      color: 'purple'
    },
    {
      id: 'follow-up',
      name: 'Follow-up Visit',
      duration: 30,
      price: 25,
      description: 'Post-installation check and adjustments',
      color: 'orange'
    }
  ];

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: Math.random() > 0.3,
          duration: selectedService?.duration || 60
        });
      }
    }
    
    return slots;
  };

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleDateTimeConfirm = () => {
    if (selectedDate && selectedTime) {
      setStep('details');
    }
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientInfo.name || !clientInfo.email) {
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = setMinutes(setHours(selectedDate, hours), minutes);
    const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);

    const appointment = {
      title: `${selectedService.name} - ${clientInfo.name}`,
      description: clientInfo.message,
      appointment_type: selectedService.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      client_name: clientInfo.name,
      client_email: clientInfo.email,
      client_phone: clientInfo.phone,
      location: 'To be confirmed',
      service_price: selectedService.price
    };

    onBookAppointment(appointment);
    setStep('confirmation');
  };

  const renderServiceSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Select a Service</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Choose the service that best fits your needs</p>
      </div>
      
      <div className="grid gap-3 sm:gap-4">
        {serviceTypes.map((service) => (
          <Card
            key={service.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
            onClick={() => handleServiceSelect(service)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{service.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {service.duration} min
                    </div>
                    <div className="font-semibold">
                      {service.price === 0 ? 'Free' : `$${service.price}`}
                    </div>
                  </div>
                </div>
                <Badge className={`bg-${service.color}-100 text-${service.color}-800 border-${service.color}-200 text-xs shrink-0 ml-2`}>
                  {service.name.split(' ')[0]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Choose when you'd like your {selectedService?.name.toLowerCase()}</p>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-4 sm:gap-6`}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Available Times</CardTitle>
            {selectedDate && (
              <CardDescription className="text-sm">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`text-xs ${!slot.available ? "opacity-50" : ""}`}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">
                Please select a date first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={() => setStep('service')} className="w-full sm:w-auto">
          Back
        </Button>
        <Button 
          onClick={handleDateTimeConfirm}
          disabled={!selectedDate || !selectedTime}
          className="w-full sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Your Information</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Please provide your contact details</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3 sm:p-4">
          <h4 className="font-semibold mb-2 text-sm sm:text-base">Booking Summary</h4>
          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span>Service:</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">{selectedDate && format(selectedDate, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">{selectedService?.duration} minutes</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Price:</span>
              <span>{selectedService?.price === 0 ? 'Free' : `$${selectedService?.price}`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4">
        <div>
          <Label htmlFor="name" className="text-sm">Full Name *</Label>
          <Input
            id="name"
            value={clientInfo.name}
            onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sm">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={clientInfo.email}
            onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
            className="text-sm"
          />
        </div>

        <div>
          <Label htmlFor="message" className="text-sm">Additional Message</Label>
          <Textarea
            id="message"
            value={clientInfo.message}
            onChange={(e) => setClientInfo(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Tell us about your specific needs or questions..."
            rows={3}
            className="text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Button variant="outline" onClick={() => setStep('datetime')} className="w-full sm:w-auto">
          Back
        </Button>
        <Button 
          onClick={handleBooking}
          disabled={!clientInfo.name || !clientInfo.email}
          className="w-full sm:w-auto"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-4 sm:space-y-6">
      <div className="flex justify-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Appointment Booked!</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.
        </p>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <h4 className="font-semibold mb-3 text-sm sm:text-base">Appointment Details</h4>
          <div className="space-y-2 text-xs sm:text-sm text-left">
            <div className="flex items-center">
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {selectedService?.name} on {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
            </div>
            <div className="flex items-center">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {clientInfo.name}
            </div>
            <div className="flex items-center">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {clientInfo.email}
            </div>
            {clientInfo.phone && (
              <div className="flex items-center">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {clientInfo.phone}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => {
        setStep('service');
        setSelectedService(null);
        setSelectedDate(undefined);
        setSelectedTime(undefined);
        setClientInfo({ name: '', email: '', phone: '', message: '' });
      }} className="w-full sm:w-auto">
        Book Another Appointment
      </Button>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1 sm:space-x-2">
            {['service', 'datetime', 'details', 'confirmation'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  step === stepName
                    ? 'bg-blue-500 text-white'
                    : index < ['service', 'datetime', 'details', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 'service' && renderServiceSelection()}
      {step === 'datetime' && renderDateTimeSelection()}
      {step === 'details' && renderDetailsForm()}
      {step === 'confirmation' && renderConfirmation()}
    </div>
  );
};
