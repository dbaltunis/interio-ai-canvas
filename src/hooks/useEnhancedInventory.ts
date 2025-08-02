
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedInventoryItem {
  // Core fields (exact database column names)
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category: string;
  quantity?: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  unit_price?: number;
  supplier?: string;
  vendor_id?: string;
  location?: string;
  reorder_point?: number;
  active?: boolean;
  
  // Fabric fields (exact database column names)
  fabric_width?: number;
  fabric_composition?: string;
  fabric_care_instructions?: string;
  fabric_origin?: string;
  pattern_repeat_horizontal?: number;
  pattern_repeat_vertical?: number;
  fabric_grade?: string;
  fabric_collection?: string;
  is_flame_retardant?: boolean;
  
  // Hardware fields (exact database column names)
  hardware_finish?: string;
  hardware_material?: string;
  hardware_dimensions?: string;
  hardware_weight?: number;
  hardware_mounting_type?: string;
  hardware_load_capacity?: number;
  
  // Pricing fields (exact database column names)
  price_per_yard?: number;
  price_per_meter?: number;
  price_per_unit?: number;
  markup_percentage?: number;
  
  // Physical dimensions (exact database column names)
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  color?: string;
  finish?: string;
  collection_name?: string;
  image_url?: string;
  
  // Service/Labor fields (exact database column names)
  labor_hours?: number;
  fullness_ratio?: number;
  service_rate?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export const useEnhancedInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useEnhancedInventoryByCategory = (category: string) => {
  return useQuery({
    queryKey: ["enhanced-inventory", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("category", category)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      toast.success('Item created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating item: ${error.message}`);
    },
  });
};

export const useUpdateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnhancedInventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating item: ${error.message}`);
    },
  });
};

export const useDeleteEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enhanced_inventory_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting item: ${error.message}`);
    },
  });
};
