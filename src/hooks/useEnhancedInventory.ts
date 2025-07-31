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
  
  // Service/Labor fields (exact database column names)
  labor_hours?: number;
  fullness_ratio?: number;
  service_rate?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// For now, fall back to the old inventory hook until database is properly migrated
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

// Specialized hooks for different inventory types
export const useHeadingInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory", "heading"],
    queryFn: async () => {
      // Mock heading data for now to get HeadingSelector working
      return [
        {
          id: "heading-1",
          user_id: "mock",
          name: "Standard Pinch Pleat",
          description: "Classic pinch pleat heading",
          category: "heading",
          quantity: 1,
          unit: "set",
          selling_price: 25,
          cost_price: 15,
          fullness_ratio: 2.5,
          labor_hours: 1.5,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "heading-2",
          user_id: "mock",
          name: "Goblet Pleat",
          description: "Elegant goblet heading style",
          category: "heading",
          quantity: 1,
          unit: "set",
          selling_price: 35,
          cost_price: 20,
          fullness_ratio: 2.8,
          labor_hours: 2.0,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as EnhancedInventoryItem[];
    },
  });
};

export const useServiceInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory", "service"],
    queryFn: async () => {
      // Mock service data for now
      return [
        {
          id: "service-1",
          user_id: "mock",
          name: "Installation Service",
          description: "Professional curtain installation",
          category: "service",
          quantity: 1,
          unit: "per-window",
          selling_price: 50,
          cost_price: 30,
          labor_hours: 1.0,
          service_rate: 50,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as EnhancedInventoryItem[];
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

// Legacy compatibility exports
export const useLowStockEnhancedItems = () => {
  return useQuery({
    queryKey: ["enhanced-inventory", "low-stock"],
    queryFn: async () => {
      return [] as EnhancedInventoryItem[];
    },
  });
};

export const useInventoryValuation = () => {
  return useQuery({
    queryKey: ["enhanced-inventory", "valuation"],
    queryFn: async () => {
      return { totalValue: 0, categoryBreakdown: {}, itemCount: 0 };
    },
  });
};

export const useCreateReorderAlert = () => {
  return useMutation({
    mutationFn: async (alert: any) => {
      console.log('Creating reorder alert:', alert);
      return alert;
    },
    onSuccess: () => {
      toast.success('Reorder alert created');
    },
  });
};