import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, isSameDay } from "date-fns";
import { usePublicScheduler } from "@/hooks/useAppointmentSchedulers";
import { useSchedulerSlots } from "@/hooks/useSchedulerSlots";
import { useCreateBooking } from "@/hooks/useAppointmentBookings";
import { 
  BookingHeader, 
  DateTimeSelector, 
  ClientInfoForm, 
  BookingSuccessScreen 
} from "@/components/booking";

interface BookingConfirmationProps {
  slug: string;
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
  timezone: string;
}

export const BookingConfirmation = ({ slug }: BookingConfirmationProps) => {
  const { data: scheduler, isLoading: schedulerLoading } = usePublicScheduler(slug);
  // Refetch slots every 30 seconds to show real-time availability
  const { data: allSlots, refetch: refetchSlots } = useSchedulerSlots(undefined, 30000);
  const createBooking = useCreateBooking();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: booking, 2: confirmation
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>();
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Helper function to get available slots for a specific date
  const getAvailableSlotsForDate = (date: Date) => {
    if (!allSlots) return [];
    
    return allSlots.filter(slot => 
      isSameDay(slot.date, date) && 
      slot.schedulerId === scheduler?.id &&
      !slot.isBooked // Only return slots that are not booked
    );
  };

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
      // Refetch slots immediately after successful booking
      refetchSlots();
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

  // Loading state
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

  // Error state
  if (!scheduler) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">Booking Not Available</h1>
          <p className="text-muted-foreground">This booking link is not valid or has been disabled.</p>
        </div>
      </div>
    );
  }

  // Success screen
  if (step === 2 && selectedDate && selectedTime) {
    return (
      <BookingSuccessScreen
        scheduler={scheduler}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        clientInfo={clientInfo}
      />
    );
  }

  // Main booking form
  const isFormValid = clientInfo.name && clientInfo.email && selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <BookingHeader scheduler={scheduler} />
        
        <div className="grid md:grid-cols-2 gap-8">
          <DateTimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            getAvailableSlotsForDate={getAvailableSlotsForDate}
          />
          
          <ClientInfoForm
            clientInfo={clientInfo}
            onClientInfoChange={setClientInfo}
            onSubmit={handleSubmitBooking}
            isSubmitting={createBooking.isPending}
            isValid={!!isFormValid}
          />
        </div>
      </div>
    </div>
  );
};