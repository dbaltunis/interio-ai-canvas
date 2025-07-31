import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  cost_price: number;
  selling_price: number;
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
  reorder_point: number;
  lead_time_days: number;
  minimum_order_quantity: number;
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
  fullness_ratio: number;
  heading_type?: string;
  
  // Service-specific fields
  service_type?: string;
  hourly_rate?: number;
  duration_minutes?: number;
  per_unit_charge: boolean;
  
  // Pricing fields
  pricing_method: 'fixed' | 'per_unit' | 'per_area' | 'per_width';
  base_price: number;
  price_per_unit: number;
  price_per_sqm: number;
  price_per_meter: number;
  
  track_inventory: boolean;
  
  created_at: string;
  updated_at: string;
}

export const useEnhancedInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data as EnhancedInventoryItem[];
    },
  });
};

export const useEnhancedInventoryByCategory = (category: string) => {
  return useQuery({
    queryKey: ["enhanced-inventory", category],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('category_type', category)
        .eq('active', true)
        .order('name');

      if (error) throw error;
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<EnhancedInventoryItem, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .insert({
          ...item,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      toast({
        title: "Success",
        description: "Item created successfully",
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

export const useUpdateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EnhancedInventoryItem> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .update(updates)
        .eq("id", id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      toast({
        title: "Success",
        description: "Item updated successfully",
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

export const useDeleteEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from("enhanced_inventory_items")
        .delete()
        .eq("id", id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
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

export const useLowStockEnhancedItems = () => {
  return useQuery({
    queryKey: ["enhanced-inventory", "low-stock"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq('user_id', user.id)
        .eq('active', true)
        .not('reorder_point', 'is', null)
        .filter('quantity', 'lte', 'reorder_point')
        .order("quantity", { ascending: true });
      
      if (error) throw error;
      return data as EnhancedInventoryItem[];
    },
  });
};

// Inventory valuation
export const useInventoryValuation = () => {
  return useQuery({
    queryKey: ["enhanced-inventory", "valuation"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("quantity, cost_price, category_type")
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) throw error;

      const totalValue = data.reduce((sum, item) => 
        sum + ((item.quantity || 0) * (item.cost_price || 0)), 0
      );

      const categoryBreakdown = data.reduce((acc, item) => {
        const category = (item as any).category_type || "Uncategorized";
        const value = (item.quantity || 0) * (item.cost_price || 0);
        acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalValue,
        categoryBreakdown,
        itemCount: data.length,
      };
    },
  });
};

// Fabric calculation integration
export const calculateFabricRequirement = (
  fabricItem: any,
  windowWidth: number,
  windowHeight: number,
  fullnessOverride?: number
) => {
  if (!fabricItem.fabric_width) {
    throw new Error("Fabric width not specified");
  }

  const fullness = fullnessOverride || (fabricItem as any).fullness_ratio || 2.5;
  const patternRepeat = (fabricItem as any).pattern_repeat_vertical || 0;
  
  // Calculate number of widths needed
  const totalWidth = windowWidth * fullness;
  const numWidths = Math.ceil(totalWidth / fabricItem.fabric_width);
  
  // Calculate cut length per width
  let cutLength = windowHeight + 20; // 20cm hem allowance
  
  // Add pattern repeat if applicable
  if (patternRepeat > 0) {
    cutLength = Math.ceil(cutLength / patternRepeat) * patternRepeat;
  }
  
  // Total fabric needed
  const totalFabricMeters = (numWidths * cutLength) / 100; // Convert cm to meters
  const totalCost = totalFabricMeters * (fabricItem.selling_price || 0);
  
  return {
    numWidths,
    cutLength,
    totalFabricMeters,
    totalCost,
    patternWaste: patternRepeat > 0 ? (cutLength - windowHeight - 20) * numWidths / 100 : 0,
    fabricWidth: fabricItem.fabric_width,
    patternRepeat,
    fullnessUsed: fullness,
  };
};