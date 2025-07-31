import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedInventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category_type: 'fabric' | 'hardware' | 'heading' | 'service' | 'parts';
  subcategory?: string;
  
  quantity: number;
  unit: string;
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

export const useEnhancedInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching enhanced inventory:', error);
        return [];
      }

      return data as EnhancedInventoryItem[];
    },
  });
};

export const useEnhancedInventoryByCategory = (category: string) => {
  return useQuery({
    queryKey: ["enhanced-inventory", category],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_type', category)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching inventory by category:', error);
        return [];
      }

      return data as EnhancedInventoryItem[];
    },
  });
};

// Specialized hooks for different inventory types
export const useHeadingInventory = () => {
  return useEnhancedInventoryByCategory('heading');
};

export const useServiceInventory = () => {
  return useEnhancedInventoryByCategory('service');
};

export const useCreateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<EnhancedInventoryItem, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          ...item,
          user_id: user.id
        })
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('enhanced_inventory_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
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