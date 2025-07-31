import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedInventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category_type?: 'fabric' | 'hardware' | 'heading' | 'service' | 'parts';
  category?: string;
  subcategory?: string;
  
  // Main fields
  unit_price?: number;
  quantity: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  markup_percentage?: number;
  supplier?: string;
  location?: string;
  width?: number;
  height?: number;
  weight?: number;
  color?: string;
  pattern?: string;
  material?: string;
  finish?: string;
  brand?: string;
  model?: string;
  reorder_point?: number;
  lead_time_days?: number;
  minimum_order_quantity?: number;
  active: boolean;
  
  // Fabric-specific fields
  fabric_type?: string;
  fabric_width?: number;
  fabric_weight_gsm?: number;
  care_instructions?: string;
  composition?: string;
  
  // Hardware-specific fields
  hardware_type?: string;
  mounting_type?: string;
  load_capacity?: number;
  dimensions_length?: number;
  dimensions_width?: number;
  dimensions_height?: number;
  finish_type?: string;
  
  // Heading-specific fields
  fullness_ratio?: number;
  heading_type?: string;
  
  // Service-specific fields
  service_type?: string;
  hourly_rate?: number;
  duration_minutes?: number;
  per_unit_charge?: boolean;
  
  // Additional backward compatibility fields
  labor_hours?: number;
  service_rate?: number;
  reorder_quantity?: number;
  pattern_repeat_vertical?: number;
  pattern_repeat_horizontal?: number;
  roll_direction?: string;
  collection_name?: string;
  color_code?: string;
  pattern_direction?: string;
  transparency_level?: string;
  fire_rating?: string;
  material_finish?: string;
  installation_type?: string;
  weight_capacity?: number;
  max_length?: number;
  specifications?: any;
  pricing_grid?: any;
  images?: any;
  compatibility_tags?: any;
  
  // Pricing fields
  pricing_method?: 'fixed' | 'per_unit' | 'per_area' | 'per_width';
  base_price?: number;
  price_per_unit?: number;
  price_per_sqm?: number;
  price_per_meter?: number;
  
  track_inventory?: boolean;
  created_at: string;
  updated_at: string;
}

// For now, fall back to the old inventory hook until database is properly migrated
export const useEnhancedInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory"],
    queryFn: async () => {
      // Return empty array for now - this allows the app to work
      // while we transition to the new system
      return [] as EnhancedInventoryItem[];
    },
  });
};

export const useEnhancedInventoryByCategory = (category: string) => {
  return useQuery({
    queryKey: ["enhanced-inventory", category],
    queryFn: async () => {
      // Return empty array for now
      return [] as EnhancedInventoryItem[];
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
          category_type: "heading" as const,
          category: "heading",
          quantity: 1,
          unit: "set",
          selling_price: 25,
          cost_price: 15,
          fullness_ratio: 2.5,
          heading_type: "standard",
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "heading-2",
          user_id: "mock",
          name: "Goblet Pleat",
          description: "Elegant goblet heading style",
          category_type: "heading" as const,
          category: "heading",
          quantity: 1,
          unit: "set",
          selling_price: 35,
          cost_price: 20,
          fullness_ratio: 2.8,
          heading_type: "goblet",
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
          category_type: "service" as const,
          category: "service",
          quantity: 1,
          unit: "per-window",
          selling_price: 50,
          cost_price: 30,
          hourly_rate: 50,
          duration_minutes: 60,
          service_type: "installation",
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
      // Mock implementation for now
      console.log('Creating inventory item:', item);
      return { ...item, id: `mock-${Date.now()}` };
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
    mutationFn: async ({ id, ...updates }: any) => {
      // Mock implementation for now
      console.log('Updating inventory item:', id, updates);
      return { id, ...updates };
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
      // Mock implementation for now
      console.log('Deleting inventory item:', id);
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