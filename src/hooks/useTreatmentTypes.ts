
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type TreatmentType = Tables<"treatment_types">;
type TreatmentTypeInsert = TablesInsert<"treatment_types">;

export const useTreatmentTypes = () => {
  return useQuery({
    queryKey: ["treatment-types"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("treatment_types")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTreatmentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (treatmentType: Omit<TreatmentTypeInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("treatment_types")
        .insert({ ...treatmentType, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-types"] });
      toast({
        title: "Success",
        description: "Treatment type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTreatmentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TreatmentType> & { id: string }) => {
      const { data, error } = await supabase
        .from("treatment_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-types"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
