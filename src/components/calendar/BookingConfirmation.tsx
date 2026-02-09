import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
import { useCreateBooking } from "@/hooks/useAppointmentBookings";
import { 
  BookingBrandingPanel,
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
  const { scheduler, isLoading, generateAvailableSlots } = useAppointmentBooking(slug);
  const createBooking = useCreateBooking();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: booking, 2: confirmation
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Helper function to get available slots for a specific date
  const getAvailableSlotsForDate = (date: Date) => {
    const slots = generateAvailableSlots(date);
    return slots
      .filter(slot => slot.available)
      .map(slot => ({
        id: `${format(date, 'yyyy-MM-dd')}-${slot.time}`,
        startTime: slot.time,
        endTime: '',
        isBooked: false
      }));
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
      toast({
        title: "Booking Confirmed! 🎉",
        description: "You will receive a confirmation email shortly.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking information...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (!scheduler) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center max-w-md bg-background rounded-2xl shadow-lg"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h1 className="text-2xl font-bold text-destructive mb-2">Booking Not Available</h1>
          <p className="text-muted-foreground">This booking link is not valid or has been disabled.</p>
        </motion.div>
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

  // Main booking form - Modern split-panel layout
  const isFormValid = clientInfo.name && clientInfo.email && selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-background rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="grid lg:grid-cols-[2fr_3fr]">
          {/* Left Panel - Branding */}
          <BookingBrandingPanel 
            scheduler={scheduler}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
          
          {/* Right Panel - Booking Form */}
          <div className="p-6 lg:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <DateTimeSelector
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                getAvailableSlotsForDate={getAvailableSlotsForDate}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ClientInfoForm
                clientInfo={clientInfo}
                onClientInfoChange={setClientInfo}
                onSubmit={handleSubmitBooking}
                isSubmitting={createBooking.isPending}
                isValid={!!isFormValid}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
