
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMeasurements = (clientId?: string) => {
  return useQuery({
    queryKey: ["measurements", clientId],
    queryFn: async () => {
      let query = supabase
        .from("client_measurements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (clientId) {
        query = query.eq("client_id", clientId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching measurements:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!clientId,
  });
};

export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (measurementData: any) => {
      const { data, error } = await supabase
        .from("client_measurements")
        .insert([measurementData])
        .select()
        .single();

      if (error) {
        console.error("Error creating measurement:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      toast.success("Measurement created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create measurement: " + error.message);
    },
  });
};
