
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface EnhancedInventoryItem {
  // Core fields (exact database column names)
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category: string;
  subcategory?: string;
  quantity?: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  profit_per_unit?: number;
  markup_percentage?: number;
  margin_percentage?: number;
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
  treatment_type?: string;
  
  // Metadata (JSONB field)
  metadata?: Json;
  show_in_quote?: boolean;
  
  // Pricing grid
  price_group?: string | null;
  product_category?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export const useEnhancedInventory = () => {
  return useQuery({
    queryKey: ["enhanced-inventory"],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent redundant fetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent redundant fetches
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
    mutationFn: async (raw: any) => {
      // Ensure user is authenticated and attach user_id for RLS
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (authError || !userId) {
        throw new Error('You must be logged in to add inventory items.');
      }

      // Whitelist fields to match enhanced_inventory_items schema
      const allowedKeys = [
        'name','description','sku','category','subcategory','quantity','unit','cost_price','selling_price','supplier','vendor_id','location','reorder_point','active',
        'fabric_width','fabric_composition','fabric_care_instructions','fabric_origin','pattern_repeat_horizontal','pattern_repeat_vertical','fabric_grade','fabric_collection','is_flame_retardant',
        'hardware_finish','hardware_material','hardware_dimensions','hardware_weight','hardware_mounting_type','hardware_load_capacity',
        'price_per_yard','price_per_meter','price_per_unit','markup_percentage',
        'width','height','depth','weight','color','finish','collection_name','image_url',
        'labor_hours','fullness_ratio','service_rate','treatment_type','metadata','show_in_quote',
        'wallpaper_roll_width','wallpaper_roll_length','wallpaper_sold_by','wallpaper_unit_of_measure','wallpaper_match_type','wallpaper_horizontal_repeat','wallpaper_waste_factor','wallpaper_pattern_offset'
      ] as const;

      const item: Record<string, any> = { user_id: userId, active: true };
      for (const key of allowedKeys) {
        const val = raw[key as typeof allowedKeys[number]];
        if (val !== undefined && val !== null && val !== '') item[key] = val;
      }

      // Ensure required pricing fields have defaults
      if (item.cost_price == null || isNaN(item.cost_price)) item.cost_price = 0;
      if (item.selling_price == null || isNaN(item.selling_price)) {
        item.selling_price = item.price_per_unit || item.cost_price || 0;
      }

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .insert([item] as any)
        .select()
        .single();

      if (error) {
        // Surface Postgres error message to the UI
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
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
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
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
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["enhanced-inventory"] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting item: ${error.message}`);
    },
  });
};
