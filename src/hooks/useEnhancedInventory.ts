import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EnhancedInventoryItem } from "@/types/database";

export const useEnhancedInventory = () => {
  return useQuery({
    queryKey: ["enhanced_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateEnhancedInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("inventory")
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
      queryClient.invalidateQueries({ queryKey: ["enhanced_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
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
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from("inventory")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enhanced_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
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
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Use more specific query invalidation to prevent race conditions
      queryClient.invalidateQueries({ 
        queryKey: ["enhanced_inventory"],
        exact: false 
      });
      
      // Remove the item from cache immediately for better UX
      queryClient.setQueryData(["enhanced_inventory"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((item: any) => item.id !== deletedId);
      });

      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
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
    queryKey: ["enhanced_inventory", "low-stock"],
    queryFn: async () => {
      // Get all inventory and filter client-side to avoid SQL comparison issues
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("quantity", { ascending: true });
      
      if (error) throw error;
      
      // Filter items where quantity is less than or equal to reorder_point
      return data.filter(item => 
        (item.quantity || 0) <= (item.reorder_point || 0)
      );
    },
  });
};

// Automated reorder system
export const useCreateReorderAlert = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get item details
      const { data: item, error: itemError } = await supabase
        .from("inventory")
        .select("*")
        .eq("id", itemId)
        .single();

      if (itemError) throw itemError;

      // Create notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title: "Reorder Alert",
          message: `${item.name} is running low (${item.quantity} ${item.unit} remaining). Consider reordering ${item.reorder_quantity || 10} units.`,
          type: "warning",
          action_url: `/inventory?item=${itemId}`,
        });

      if (notificationError) throw notificationError;

      return item;
    },
    onSuccess: (item) => {
      toast({
        title: "Reorder Alert Created",
        description: `Alert created for ${item.name}`,
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

// Inventory valuation
export const useInventoryValuation = () => {
  return useQuery({
    queryKey: ["inventory_valuation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("quantity, unit_price, category");

      if (error) throw error;

      const totalValue = data.reduce((sum, item) => 
        sum + ((item.quantity || 0) * (item.unit_price || 0)), 0
      );

      const categoryBreakdown = data.reduce((acc, item) => {
        const category = item.category || "Uncategorized";
        const value = (item.quantity || 0) * (item.unit_price || 0);
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