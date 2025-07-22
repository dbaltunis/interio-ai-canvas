
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ClientMeasurement {
  id: string;
  client_id: string;
  user_id: string;
  project_id?: string;
  measurement_type: string;
  measurements: Record<string, any>;
  photos: string[];
  notes?: string;
  measured_by?: string;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export const useClientMeasurements = (clientId?: string) => {
  return useQuery({
    queryKey: ["client-measurements", clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("client_measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
};

export const useCreateClientMeasurement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (measurement: Omit<ClientMeasurement, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("client_measurements")
        .insert({
          ...measurement,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-measurements"] });
      queryClient.invalidateQueries({ queryKey: ["client-measurements", data.client_id] });
      toast({
        title: "Success",
        description: "Measurements saved successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to save measurements:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save measurements. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateClientMeasurement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ClientMeasurement>) => {
      const { data, error } = await supabase
        .from("client_measurements")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["client-measurements"] });
      queryClient.invalidateQueries({ queryKey: ["client-measurements", data.client_id] });
      toast({
        title: "Success",
        description: "Measurements updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to update measurements:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update measurements. Please try again.",
        variant: "destructive"
      });
    },
  });
};
