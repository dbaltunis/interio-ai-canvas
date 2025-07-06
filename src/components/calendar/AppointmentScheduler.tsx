
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Phone, Mail } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
}

interface AppointmentSchedulerProps {
  onSchedule: (appointment: any) => void;
  availableSlots?: TimeSlot[];
  businessHours?: { start: string; end: string };
}

export const AppointmentScheduler = ({ 
  onSchedule, 
  availableSlots,
  businessHours = { start: "09:00", end: "17:00" }
}: AppointmentSchedulerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [appointmentType, setAppointmentType] = useState<string>();
  const [duration, setDuration] = useState<number>(60);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Generate time slots based on business hours
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = businessHours.start.split(':').map(Number);
    const [endHour, endMin] = businessHours.end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      slots.push({
        time: timeString,
        available: Math.random() > 0.3, // Simulate availability
        duration: 60
      });
      
      currentMin += 30; // 30-minute intervals
      if (currentMin >= 60) {
        currentHour++;
        currentMin = 0;
      }
    }
    
    return slots;
  };

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const appointmentTypes = [
    { value: 'consultation', label: 'Free Consultation', duration: 60, color: 'blue' },
    { value: 'measurement', label: 'Measurement Visit', duration: 90, color: 'green' },
    { value: 'installation', label: 'Installation', duration: 180, color: 'purple' },
    { value: 'follow-up', label: 'Follow-up Visit', duration: 30, color: 'orange' }
  ];

  const getTypeColor = (type: string) => {
    const typeInfo = appointmentTypes.find(t => t.value === type);
    return typeInfo?.color || 'gray';
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !appointmentType || !clientInfo.name || !clientInfo.email) {
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = setMinutes(setHours(selectedDate, hours), minutes);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const appointment = {
      title: `${appointmentTypes.find(t => t.value === appointmentType)?.label} - ${clientInfo.name}`,
      description: clientInfo.notes,
      appointment_type: appointmentType,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      client_name: clientInfo.name,
      client_email: clientInfo.email,
      client_phone: clientInfo.phone,
      location: 'To be confirmed'
    };

    onSchedule(appointment);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Schedule Your Appointment</CardTitle>
          <CardDescription>
            Choose a convenient time for your window covering consultation or service
          </CardDescription>
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
            {/* Service Type Selection */}
            <div>
              <Label>Service Type</Label>
              <Select value={appointmentType} onValueChange={(value) => {
                setAppointmentType(value);
                const type = appointmentTypes.find(t => t.value === value);
                if (type) setDuration(type.duration);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose service type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {type.duration}min
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar */}
            <div>
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                className="rounded-md border w-full"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <Label>Available Times for {format(selectedDate, 'EEEE, MMMM d')}</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {timeSlots.map(slot => (
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

            {/* Appointment Summary */}
            {selectedDate && selectedTime && appointmentType && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Appointment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Badge className={`bg-${getTypeColor(appointmentType)}-500 mr-2`}>
                        {appointmentTypes.find(t => t.value === appointmentType)?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration: {duration} minutes
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleSchedule}
              className="w-full"
              disabled={!selectedDate || !selectedTime || !appointmentType || !clientInfo.name || !clientInfo.email}
            >
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
