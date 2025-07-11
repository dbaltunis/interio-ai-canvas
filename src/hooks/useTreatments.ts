
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Treatment = Tables<"treatments">;
type TreatmentInsert = TablesInsert<"treatments">;

// Safe JSON parsing function
const safeParseJSON = (jsonString: string | null | undefined, fallback: any = null) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn("Failed to parse JSON:", jsonString, error);
    return fallback;
  }
};

// Process treatment data to ensure safe JSON parsing
const processTreatmentData = (treatment: any): Treatment => {
  if (!treatment) return treatment;
  
  return {
    ...treatment,
    measurements: safeParseJSON(treatment.measurements, {}),
    fabric_details: safeParseJSON(treatment.fabric_details, {}),
    treatment_details: safeParseJSON(treatment.treatment_details, {}),
    calculation_details: safeParseJSON(treatment.calculation_details, {}),
    // Ensure numeric fields are properly handled
    total_price: typeof treatment.total_price === 'number' ? treatment.total_price : 0,
    material_cost: typeof treatment.material_cost === 'number' ? treatment.material_cost : 0,
    labor_cost: typeof treatment.labor_cost === 'number' ? treatment.labor_cost : 0,
    unit_price: typeof treatment.unit_price === 'number' ? treatment.unit_price : 0,
    quantity: typeof treatment.quantity === 'number' ? treatment.quantity : 1,
  };
};

export const useTreatments = (projectId?: string) => {
  return useQuery({
    queryKey: ["treatments", projectId],
    queryFn: async () => {
      console.log("Fetching treatments for project:", projectId);
      
      try {
        if (!projectId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log("No user found for treatments");
            return [];
          }

          const { data, error } = await supabase
            .from("treatments")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (error) {
            console.error("Treatments query error:", error);
            throw error;
          }
          
          const processedData = (data || []).map(processTreatmentData);
          console.log("Treatments fetched:", processedData.length, "treatments");
          return processedData;
        }
        
        const { data, error } = await supabase
          .from("treatments")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Treatments project query error:", error);
          throw error;
        }
        
        const processedData = (data || []).map(processTreatmentData);
        console.log("Project treatments fetched:", processedData.length, "treatments for project", projectId);
        return processedData;
      } catch (error) {
        console.error("Error in treatments query:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30 * 1000,
  });
};

export const useCreateTreatment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (treatment: Omit<TreatmentInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      console.log("Creating treatment:", treatment);

      // Ensure JSON fields are properly stringified
      const processedTreatment = {
        ...treatment,
        measurements: typeof treatment.measurements === 'string' 
          ? treatment.measurements 
          : JSON.stringify(treatment.measurements || {}),
        fabric_details: typeof treatment.fabric_details === 'string'
          ? treatment.fabric_details
          : JSON.stringify(treatment.fabric_details || {}),
        treatment_details: typeof treatment.treatment_details === 'string'
          ? treatment.treatment_details
          : JSON.stringify(treatment.treatment_details || {}),
        calculation_details: typeof treatment.calculation_details === 'string'
          ? treatment.calculation_details
          : JSON.stringify(treatment.calculation_details || {}),
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("treatments")
        .insert(processedTreatment)
        .select()
        .single();

      if (error) {
        console.error("Create treatment error:", error);
        throw error;
      }
      
      console.log("Treatment created successfully:", data);
      return processTreatmentData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      toast({
        title: "Success",
        description: "Treatment created successfully",
      });
    },
    onError: (error) => {
      console.error("Create treatment error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTreatment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Treatment> & { id: string }) => {
      console.log("Updating treatment:", id, updates);
      
      // Process JSON fields for update
      const processedUpdates = { ...updates };
      
      if (updates.measurements && typeof updates.measurements !== 'string') {
        processedUpdates.measurements = JSON.stringify(updates.measurements);
      }
      if (updates.fabric_details && typeof updates.fabric_details !== 'string') {
        processedUpdates.fabric_details = JSON.stringify(updates.fabric_details);
      }
      if (updates.treatment_details && typeof updates.treatment_details !== 'string') {
        processedUpdates.treatment_details = JSON.stringify(updates.treatment_details);
      }
      if (updates.calculation_details && typeof updates.calculation_details !== 'string') {
        processedUpdates.calculation_details = JSON.stringify(updates.calculation_details);
      }
      
      const { data, error } = await supabase
        .from("treatments")
        .update(processedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Update treatment error:", error);
        throw error;
      }
      
      console.log("Treatment updated successfully:", data);
      return processTreatmentData(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
    },
    onError: (error) => {
      console.error("Update treatment error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
