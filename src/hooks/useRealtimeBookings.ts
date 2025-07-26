
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeBookings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up realtime listeners for bookings...');
    
    // Listen for new bookings
    const bookingsChannel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments_booked'
        },
        (payload) => {
          console.log('New booking received:', payload);
          
          // Invalidate booking-related queries
          queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["booking-analytics"] });
          queryClient.invalidateQueries({ queryKey: ["scheduler-slots"] });
          queryClient.invalidateQueries({ queryKey: ["booked-appointments"] });
          
          // Show notification for new booking
          toast({
            title: "New Booking Received! 🎉",
            description: `${payload.new.customer_name} has booked an appointment`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments_booked'
        },
        (payload) => {
          console.log('Booking updated:', payload);
          
          // Invalidate booking-related queries
          queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["booking-analytics"] });
          queryClient.invalidateQueries({ queryKey: ["booked-appointments"] });
          
          // Show notification for status changes
          if (payload.old.status !== payload.new.status) {
            toast({
              title: "Booking Status Updated",
              description: `Booking status changed to ${payload.new.status}`,
              duration: 3000,
            });
          }
        }
      )
      .subscribe();

    // Listen for scheduler changes
    const schedulersChannel = supabase
      .channel('scheduler-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_schedulers'
        },
        () => {
          console.log('Scheduler updated, invalidating queries...');
          // Invalidate scheduler-related queries
          queryClient.invalidateQueries({ queryKey: ["appointment-schedulers"] });
          queryClient.invalidateQueries({ queryKey: ["scheduler-slots"] });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up realtime subscriptions...');
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(schedulersChannel);
    };
  }, [queryClient, toast]);
};

export default useRealtimeBookings;
