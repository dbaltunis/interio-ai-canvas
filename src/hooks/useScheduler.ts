import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useScheduler = (schedulerName: string) => {
  return useQuery({
    queryKey: ["scheduler", schedulerName],
    queryFn: async () => {
      if (!schedulerName) return null;
      
      const { data, error } = await supabase
        .from("appointment_schedulers")
        .select("*")
        .eq("name", schedulerName)
        .single();

      if (error) {
        console.error("Error fetching scheduler:", error);
        throw error;
      }

      return data;
    },
    enabled: !!schedulerName,
  });
};