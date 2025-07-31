import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EnhancedInventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category: 'fabric' | 'hardware' | 'heading' | 'service';
  
  // Basic inventory fields
  quantity: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  unit_price?: number;
  supplier?: string;
  location?: string;
  reorder_point?: number;
  active: boolean;
  
  // Fabric-specific fields
  fabric_width?: number;
  fabric_composition?: string;
  fabric_care_instructions?: string;
  fabric_origin?: string;
  pattern_repeat_horizontal?: number;
  pattern_repeat_vertical?: number;
  fabric_grade?: string;
  fabric_collection?: string;
  is_flame_retardant?: boolean;
  
  // Hardware-specific fields
  hardware_finish?: string;
  hardware_material?: string;
  hardware_dimensions?: string;
  hardware_weight?: number;
  hardware_mounting_type?: string;
  hardware_load_capacity?: number;
  
  // Pricing fields
  price_per_yard?: number;
  price_per_meter?: number;
  price_per_unit?: number;
  markup_percentage?: number;
  
  // Specification fields
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  color?: string;
  finish?: string;
  
  // Service/Heading specific fields
  labor_hours?: number;
  fullness_ratio?: number; // For headings
  service_rate?: number; // Hourly rate for services
  
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
        .eq('category', category)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data as EnhancedInventoryItem[];
    },
  });
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
        .select("quantity, cost_price, category")
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) throw error;

      const totalValue = data.reduce((sum, item) => 
        sum + ((item.quantity || 0) * (item.cost_price || 0)), 0
      );

      const categoryBreakdown = data.reduce((acc, item) => {
        const category = item.category || "Uncategorized";
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

  const fullness = fullnessOverride || fabricItem.fullness_ratio || 2.5;
  const patternRepeat = fabricItem.pattern_repeat_vertical || 0;
  
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
  const totalCost = totalFabricMeters * (fabricItem.unit_price || 0);
  
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