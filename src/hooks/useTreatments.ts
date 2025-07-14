
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Treatment = Tables<"treatments">;
type TreatmentInsert = TablesInsert<"treatments">;

// Enhanced safe JSON parsing function with detailed logging
const safeParseJSON = (jsonString: string | null | undefined, fallback: any = null, fieldName = 'unknown') => {
  if (!jsonString) {
    console.log(`JSON Parse: ${fieldName} is null/undefined, using fallback:`, fallback);
    return fallback;
  }
  
  if (typeof jsonString !== 'string') {
    console.log(`JSON Parse: ${fieldName} is not a string, type is:`, typeof jsonString, 'value:', jsonString);
    // If it's already an object, return it
    if (typeof jsonString === 'object' && jsonString !== null) {
      return jsonString;
    }
    return fallback;
  }
  
  // Check if it's already parsed (sometimes Supabase returns objects directly)
  if (jsonString === '[object Object]') {
    console.warn(`JSON Parse: ${fieldName} contains '[object Object]' string, using fallback`);
    return fallback;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    console.log(`JSON Parse: ${fieldName} parsed successfully:`, parsed);
    return parsed;
  } catch (error) {
    console.error(`JSON Parse Error for ${fieldName}:`, {
      error: error.message,
      jsonString: jsonString?.substring(0, 100) + (jsonString?.length > 100 ? '...' : ''),
      fallback
    });
    return fallback;
  }
};

// Enhanced treatment data processing with comprehensive validation
const processTreatmentData = (treatment: any): Treatment => {
  if (!treatment) {
    console.warn("processTreatmentData: received null/undefined treatment");
    return treatment;
  }
  
  console.log("processTreatmentData: Processing treatment:", treatment.id);
  
  try {
    const processed = {
      ...treatment,
      measurements: safeParseJSON(treatment.measurements, {}, 'measurements'),
      fabric_details: safeParseJSON(treatment.fabric_details, {}, 'fabric_details'),
      treatment_details: safeParseJSON(treatment.treatment_details, {}, 'treatment_details'),
      calculation_details: safeParseJSON(treatment.calculation_details, {}, 'calculation_details'),
      // Ensure numeric fields are properly handled with fallbacks
      total_price: parseFloat(treatment.total_price) || 0,
      material_cost: parseFloat(treatment.material_cost) || 0,
      labor_cost: parseFloat(treatment.labor_cost) || 0,
      unit_price: parseFloat(treatment.unit_price) || 0,
      quantity: parseFloat(treatment.quantity) || 1,
    };
    
    console.log("processTreatmentData: Successfully processed treatment:", processed.id);
    return processed;
  } catch (error) {
    console.error("processTreatmentData: Error processing treatment:", error, treatment);
    // Return a safe fallback version
    return {
      ...treatment,
      measurements: {},
      fabric_details: {},
      treatment_details: {},
      calculation_details: {},
      total_price: 0,
      material_cost: 0,
      labor_cost: 0,
      unit_price: 0,
      quantity: 1,
    };
  }
};

export const useTreatments = (projectId?: string) => {
  return useQuery({
    queryKey: ["treatments", projectId],
    queryFn: async () => {
      console.log("=== FETCHING TREATMENTS ===");
      console.log("Project ID:", projectId);
      
      try {
        if (!projectId) {
          console.log("No project ID, fetching all user treatments");
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log("No authenticated user found");
            return [];
          }

          console.log("Fetching treatments for user:", user.id);
          const { data, error } = await supabase
            .from("treatments")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (error) {
            console.error("Error fetching user treatments:", error);
            throw error;
          }
          
          console.log("Raw treatments data:", data);
          const processedData = (data || []).map((treatment, index) => {
            console.log(`Processing treatment ${index + 1}/${data?.length}:`, treatment.id);
            return processTreatmentData(treatment);
          });
          
          console.log("Processed treatments:", processedData.length, "treatments");
          return processedData;
        }
        
        console.log("Fetching treatments for project:", projectId);
        const { data, error } = await supabase
          .from("treatments")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching project treatments:", error);
          throw error;
        }
        
        console.log("Raw project treatments data:", data);
        const processedData = (data || []).map((treatment, index) => {
          console.log(`Processing project treatment ${index + 1}/${data?.length}:`, treatment.id);
          return processTreatmentData(treatment);
        });
        
        console.log("Processed project treatments:", processedData.length, "treatments");
        return processedData;
      } catch (error) {
        console.error("Critical error in treatments query:", error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
    },
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    meta: {
      onError: (error: any) => {
        console.error("TanStack Query error in useTreatments:", error);
      }
    }
  });
};

// Enhanced safe JSON stringification
const safeStringifyJSON = (data: any, fieldName = 'unknown') => {
  if (!data) {
    console.log(`JSON Stringify: ${fieldName} is null/undefined`);
    return JSON.stringify({});
  }
  
  if (typeof data === 'string') {
    console.log(`JSON Stringify: ${fieldName} is already a string`);
    // Validate it's valid JSON
    try {
      JSON.parse(data);
      return data;
    } catch {
      console.warn(`JSON Stringify: ${fieldName} is invalid JSON string, wrapping in object`);
      return JSON.stringify({ value: data });
    }
  }
  
  try {
    const stringified = JSON.stringify(data);
    console.log(`JSON Stringify: ${fieldName} stringified successfully`);
    return stringified;
  } catch (error) {
    console.error(`JSON Stringify Error for ${fieldName}:`, error, data);
    return JSON.stringify({});
  }
};

export const useCreateTreatment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (treatment: Omit<TreatmentInsert, "user_id">) => {
      console.log("=== CREATING TREATMENT ===");
      console.log("Input treatment data:", treatment);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Process JSON fields with enhanced safety
      const processedTreatment = {
        ...treatment,
        measurements: safeStringifyJSON(treatment.measurements, 'measurements'),
        fabric_details: safeStringifyJSON(treatment.fabric_details, 'fabric_details'),
        treatment_details: safeStringifyJSON(treatment.treatment_details, 'treatment_details'),
        calculation_details: safeStringifyJSON(treatment.calculation_details, 'calculation_details'),
        user_id: user.id
      };

      console.log("Processed treatment for insertion:", processedTreatment);

      const { data, error } = await supabase
        .from("treatments")
        .insert(processedTreatment)
        .select()
        .single();

      if (error) {
        console.error("Create treatment database error:", error);
        throw error;
      }
      
      console.log("Treatment created successfully:", data);
      return processTreatmentData(data);
    },
    onSuccess: (data) => {
      console.log("Create treatment success, invalidating queries");
      // Invalidate all treatment queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.refetchQueries({ queryKey: ["treatments"] });
      toast({
        title: "Success",
        description: "Treatment created successfully",
      });
    },
    onError: (error) => {
      console.error("Create treatment mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create treatment",
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
      console.log("=== UPDATING TREATMENT ===");
      console.log("Treatment ID:", id);
      console.log("Updates:", updates);
      
      // Process JSON fields for update with enhanced safety
      const processedUpdates = { ...updates };
      
      if (updates.measurements !== undefined) {
        processedUpdates.measurements = safeStringifyJSON(updates.measurements, 'measurements');
      }
      if (updates.fabric_details !== undefined) {
        processedUpdates.fabric_details = safeStringifyJSON(updates.fabric_details, 'fabric_details');
      }
      if (updates.treatment_details !== undefined) {
        processedUpdates.treatment_details = safeStringifyJSON(updates.treatment_details, 'treatment_details');
      }
      if (updates.calculation_details !== undefined) {
        processedUpdates.calculation_details = safeStringifyJSON(updates.calculation_details, 'calculation_details');
      }
      
      console.log("Processed updates for database:", processedUpdates);
      
      const { data, error } = await supabase
        .from("treatments")
        .update(processedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Update treatment database error:", error);
        throw error;
      }
      
      console.log("Treatment updated successfully:", data);
      return processTreatmentData(data);
    },
    onSuccess: () => {
      console.log("Update treatment success, invalidating queries");
      // Invalidate all treatment queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      queryClient.refetchQueries({ queryKey: ["treatments"] });
    },
    onError: (error) => {
      console.error("Update treatment mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update treatment",
        variant: "destructive",
      });
    },
  });
};
