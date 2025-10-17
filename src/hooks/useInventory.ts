import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  quantity: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  unit_price?: number;
  supplier?: string;
  location?: string;
  width?: number;
  reorder_point?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// This hook is deprecated - use useEnhancedInventory instead
// Kept for backwards compatibility
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map to InventoryItem interface
      return (data || []).map((item): InventoryItem => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        description: item.description || undefined,
        sku: item.sku || undefined,
        category: item.category,
        quantity: item.quantity || 0,
        unit: item.unit || undefined,
        cost_price: item.cost_price || 0,
        selling_price: item.selling_price || 0,
        unit_price: item.selling_price || item.cost_price || 0,
        supplier: item.supplier || undefined,
        location: item.location || undefined,
        width: item.fabric_width || item.width || undefined,
        reorder_point: item.reorder_point || undefined,
        active: item.active ?? true,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    },
  });
};

// This hook is deprecated - use useEnhancedInventory with filter instead
// Kept for backwards compatibility  
export const useLowStockItems = () => {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter for low stock items
      return (data || [])
        .filter(item => item.reorder_point && (item.quantity || 0) <= item.reorder_point)
        .map((item): InventoryItem => ({
          id: item.id,
          user_id: item.user_id,
          name: item.name,
          description: item.description || undefined,
          sku: item.sku || undefined,
          category: item.category,
          quantity: item.quantity || 0,
          unit: item.unit || undefined,
          cost_price: item.cost_price || 0,
          selling_price: item.selling_price || 0,
          unit_price: item.selling_price || item.cost_price || 0,
          supplier: item.supplier || undefined,
          location: item.location || undefined,
          width: item.fabric_width || item.width || undefined,
          reorder_point: item.reorder_point || undefined,
          active: item.active ?? true,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
    },
  });
};
