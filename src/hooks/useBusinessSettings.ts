
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type BusinessSettings = Tables<"business_settings">;
type BusinessSettingsInsert = TablesInsert<"business_settings">;
type BusinessSettingsUpdate = TablesUpdate<"business_settings">;

export interface MeasurementUnits {
  system: 'metric' | 'imperial';
  length: 'mm' | 'cm' | 'm' | 'inches' | 'feet';
  area: 'sq_mm' | 'sq_cm' | 'sq_m' | 'sq_inches' | 'sq_feet';
  fabric: 'cm' | 'm' | 'inches' | 'yards';
}

export const defaultMeasurementUnits: MeasurementUnits = {
  system: 'imperial',
  length: 'inches',
  area: 'sq_inches', 
  fabric: 'yards'
};

export const useBusinessSettings = () => {
  return useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Omit<BusinessSettingsInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("business_settings")
        .insert({ ...settings, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });
};

export const useUpdateBusinessSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...settings }: BusinessSettingsUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("business_settings")
        .update(settings)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });
};

// Utility functions for unit conversion
export const convertLength = (value: number, fromUnit: string, toUnit: string): number => {
  // Convert everything to mm first, then to target unit
  const toMm = (val: number, unit: string): number => {
    switch (unit) {
      case 'mm': return val;
      case 'cm': return val * 10;
      case 'm': return val * 1000;
      case 'inches': return val * 25.4;
      case 'feet': return val * 304.8;
      default: return val;
    }
  };

  const fromMm = (val: number, unit: string): number => {
    switch (unit) {
      case 'mm': return val;
      case 'cm': return val / 10;
      case 'm': return val / 1000;
      case 'inches': return val / 25.4;
      case 'feet': return val / 304.8;
      default: return val;
    }
  };

  const mmValue = toMm(value, fromUnit);
  return fromMm(mmValue, toUnit);
};

export const formatMeasurement = (value: number, unit: string): string => {
  const unitLabels: Record<string, string> = {
    'mm': 'mm',
    'cm': 'cm', 
    'm': 'm',
    'inches': '"',
    'feet': "'",
    'yards': 'yd',
    'sq_mm': 'mm²',
    'sq_cm': 'cm²',
    'sq_m': 'm²',
    'sq_inches': 'in²',
    'sq_feet': 'ft²'
  };

  return `${value.toFixed(2)} ${unitLabels[unit] || unit}`;
};
