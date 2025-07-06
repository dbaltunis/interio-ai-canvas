
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
      const { data, error } = await supabase
        .from("appointments_booked")
        .insert(booking)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["scheduler-bookings", data.scheduler_id] });
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
