
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type AppointmentBooking = Tables<"appointments_booked">;
type AppointmentBookingInsert = TablesInsert<"appointments_booked">;

export const useSchedulerBookings = (schedulerId: string) => {
  return useQuery({
    queryKey: ["scheduler-bookings", schedulerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments_booked")
        .select("*")
        .eq("scheduler_id", schedulerId)
        .order("appointment_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!schedulerId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (booking: AppointmentBookingInsert) => {
      console.log('Creating booking with data:', booking);
      
      // Ensure all required fields are present
      const bookingData = {
        scheduler_id: booking.scheduler_id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone || '',
        appointment_date: booking.appointment_date,
        appointment_time: booking.appointment_time,
        location_type: booking.location_type,
        notes: booking.notes || '',
        booking_message: booking.booking_message || '',
        customer_timezone: booking.customer_timezone || 'UTC',
        appointment_timezone: booking.appointment_timezone || 'UTC',
        status: 'confirmed'
      };

      console.log('Sanitized booking data:', bookingData);

      const { data, error } = await supabase
        .from("appointments_booked")
        .insert(bookingData)
        .select(`
          *,
          appointment_schedulers (
            name,
            user_id
          )
        `)
        .single();

      if (error) {
        console.error('Booking creation error:', error);
        throw error;
      }
      
      console.log('Booking created successfully:', data);

      // Send confirmation email and sync to calendar
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            bookingId: data.id,
            schedulerName: data.appointment_schedulers?.name || 'Unknown',
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            appointmentDate: data.appointment_date,
            appointmentTime: data.appointment_time,
            timezone: data.customer_timezone || 'UTC',
            locationType: data.location_type,
            customMessage: data.booking_message
          }
        });

        // Sync to Google Calendar if integration is enabled
        await supabase.functions.invoke('sync-to-google-calendar', {
          body: { appointmentId: data.id }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation or sync calendar:', emailError);
        // Don't throw error here as booking was successful
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scheduler-bookings", data.scheduler_id] });
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked and a confirmation email has been sent.",
      });
    },
    onError: (error) => {
      console.error('Booking mutation error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });
};
