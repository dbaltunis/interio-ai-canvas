import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface StoreAppointmentsProps {
  storeId: string;
  content: {
    heading: string;
    description: string;
  };
}

export const StoreAppointments = ({ storeId, content }: StoreAppointmentsProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get store owner's appointment schedulers
  const { data: schedulers } = useQuery({
    queryKey: ['store-schedulers', storeId],
    queryFn: async () => {
      // Get store owner
      const { data: store } = await supabase
        .from('online_stores')
        .select('user_id')
        .eq('id', storeId)
        .single();

      if (!store) return [];

      // Get their active schedulers
      const { data: schedulers } = await supabase
        .from('appointment_schedulers')
        .select('id, name, duration, user_id, active')
        .eq('user_id', store.user_id)
        .eq('active', true)
        .order('name');

      return schedulers || [];
    },
  });

  // Generate time slots (9 AM - 5 PM, hourly)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !clientName || !clientEmail || !schedulers?.[0]) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get store owner
      const { data: store } = await supabase
        .from('online_stores')
        .select('user_id, store_name')
        .eq('id', storeId)
        .single();

      if (!store) throw new Error('Store not found');

      // Create appointment booking
      const { error: bookingError } = await supabase
        .from('appointments_booked')
        .insert({
          scheduler_id: schedulers[0].id,
          customer_name: clientName,
          customer_email: clientEmail,
          customer_phone: clientPhone || null,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          notes: notes || null,
          status: 'confirmed',
        });

      if (bookingError) throw bookingError;

      // Create store inquiry as a lead for the store owner
      const { error: inquiryError } = await supabase
        .from('store_inquiries')
        .insert({
          store_id: storeId,
          customer_name: clientName,
          customer_email: clientEmail,
          customer_phone: clientPhone || null,
          inquiry_type: 'booking_request',
          message: notes || null,
          configuration_data: {
            appointment_date: format(selectedDate, 'yyyy-MM-dd'),
            appointment_time: selectedTime,
            scheduler_name: schedulers[0].name,
          },
          quote_data: null,
          status: 'new',
        });

      if (inquiryError) throw inquiryError;

      toast({
        title: "Appointment Booked!",
        description: `Your appointment is confirmed for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime}`,
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setNotes('');

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schedulers || schedulers.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Appointment booking is not currently available. Please contact us directly.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">{content.heading}</h2>
          <p className="text-lg text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>Choose a convenient appointment time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < startOfDay(new Date()) || date > addDays(new Date(), 60)}
                className="rounded-md border"
              />

              {selectedDate && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Times
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>We'll send you a confirmation email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or questions?"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !clientName || !clientEmail || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
