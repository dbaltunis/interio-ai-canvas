import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CurtainTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  
  // Curtain Type
  curtain_type: 'single' | 'pair';
  
  // Heading Style
  heading_name: string;
  selected_heading_ids?: string[]; // Array of heading IDs from inventory
  fullness_ratio: number;
  extra_fabric_fixed?: number;
  extra_fabric_percentage?: number;
  heading_upcharge_per_metre?: number;
  heading_upcharge_per_curtain?: number;
  glider_spacing?: number;
  eyelet_spacing?: number;
  
  // Fabric Requirements
  fabric_width_type: 'wide' | 'narrow';
  vertical_repeat?: number;
  horizontal_repeat?: number;
  fabric_direction: 'standard' | 'railroaded';
  bottom_hem: number;
  side_hems: number;
  seam_hems: number;
  
  // Manufacturing Configuration
  return_left: number;
  return_right: number;
  overlap: number;
  header_allowance: number;
  waste_percent: number;
  is_railroadable: boolean;
  
  // Lining Options
  lining_types: Array<{
    type: string;
    price_per_metre: number;
    labour_per_curtain: number;
  }>;
  
  // Hardware
  compatible_hardware: string[];
  
  // Make-Up Pricing
  pricing_type: 'per_metre' | 'per_drop' | 'per_panel' | 'pricing_grid';
  offers_hand_finished?: boolean;
  machine_price_per_metre?: number;
  hand_price_per_metre?: number;
  machine_price_per_drop?: number;
  hand_price_per_drop?: number;
  machine_price_per_panel?: number;
  hand_price_per_panel?: number;
  average_drop_width?: number;
  // Height range pricing
  uses_height_pricing?: boolean;
  height_price_ranges?: Array<{
    min_height: number;
    max_height: number;
    price: number;
  }>;
  price_above_breakpoint_multiplier?: number;
  // Height-based pricing
  height_breakpoint?: number;
  price_rules: Array<{
    min_drop: number;
    max_drop: number;
    price_per_metre: number;
  }>;
  
  // Height-based drop pricing
  drop_height_ranges?: { min: number; max: number }[];
  machine_drop_height_prices?: number[];
  hand_drop_height_prices?: number[];
  
  unit_price?: number;
  pricing_grid_data?: any;
  
  // Manufacturing
  manufacturing_type: 'machine' | 'hand';
  hand_finished_upcharge_fixed?: number;
  hand_finished_upcharge_percentage?: number;
  
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCurtainTemplates = () => {
  return useQuery({
    queryKey: ["curtain-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curtain_templates" as any)
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return (data as unknown) as CurtainTemplate[];
    },
  });
};

export const useCurtainTemplate = (id: string) => {
  return useQuery({
    queryKey: ["curtain-template", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("curtain_templates" as any)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown) as CurtainTemplate | null;
    },
    enabled: !!id,
  });
};

export const useCreateCurtainTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<CurtainTemplate, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("curtain_templates" as any)
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curtain-templates"] });
      toast.success("Curtain template created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create curtain template: " + error.message);
    },
  });
};

export const useUpdateCurtainTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CurtainTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("curtain_templates" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curtain-templates"] });
      toast.success("Curtain template updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update curtain template: " + error.message);
    },
  });
};

export const useDeleteCurtainTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("curtain_templates" as any)
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curtain-templates"] });
      toast.success("Curtain template deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete curtain template: " + error.message);
    },
  });
};