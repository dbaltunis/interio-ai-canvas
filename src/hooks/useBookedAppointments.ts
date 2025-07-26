
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays } from "date-fns";

export interface BookedAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  location_type?: string;
  notes?: string;
  status: string;
  scheduler_id: string;
  scheduler: {
    id: string;
    name: string;
    duration: number;
    user_email?: string;
    google_meet_link?: string;
  };
}

export const useBookedAppointments = (date?: Date) => {
  return useQuery({
    queryKey: ["booked-appointments", date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: async () => {
      console.log("🔄 Fetching booked appointments for date:", date ? format(date, 'yyyy-MM-dd') : 'all');
      
      const startDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const endDate = date ? format(date, 'yyyy-MM-dd') : format(addDays(new Date(), 30), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from("appointments_booked")
        .select(`
          *,
          scheduler:appointment_schedulers(id, name, duration, user_email, google_meet_link)
        `)
        .gte("appointment_date", startDate)
        .lte("appointment_date", endDate)
        .in("status", ["confirmed", "pending"]);

      if (error) {
        console.error("❌ Error fetching booked appointments:", error);
        throw error;
      }

      console.log("✅ Fetched booked appointments:", data?.length || 0);
      console.log("📅 Booked appointments data:", data);

      return data as BookedAppointment[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
  });
};
