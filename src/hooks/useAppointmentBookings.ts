
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
      const { data, error } = await supabase
        .from("appointments_booked")
        .insert([booking])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment-bookings"] });
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    },
  });
};
