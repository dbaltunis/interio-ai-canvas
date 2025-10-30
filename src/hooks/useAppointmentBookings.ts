
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppointmentBooking {
  id: string;
  scheduler_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  appointment_date: string;
  appointment_time: string;
  location_type?: string;
  notes?: string;
  booking_message?: string;
  customer_timezone?: string;
  appointment_timezone?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export const useAppointmentBookings = () => {
  return useQuery({
    queryKey: ["appointment-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments_booked")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      return data as AppointmentBooking[];
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (booking: Omit<AppointmentBooking, "id" | "created_at" | "updated_at">) => {
      // Use edge function for booking creation to handle validation and conflicts
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          scheduler_id: booking.scheduler_id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          customer_phone: booking.customer_phone,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          location_type: booking.location_type,
          notes: booking.notes,
          status: booking.status || 'confirmed'
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create booking');
      
      return data.booking;
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh calendar and data
      queryClient.invalidateQueries({ queryKey: ["appointment-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booked-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["scheduler-slots"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Booking Confirmed",
        description: "Appointment booked successfully and confirmation email sent.",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });
};
