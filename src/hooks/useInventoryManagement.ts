import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Inventory {
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

      // Map enhanced_inventory_items to match existing interface
      return (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        description: item.description || '',
        sku: item.sku || '',
        category: item.category,
        quantity: item.quantity || 0,
        unit: item.unit || '',
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        unit_price: item.selling_price || item.cost_price || 0,
        supplier: item.supplier || '',
        location: item.location || '',
        width: item.fabric_width || item.width || 0,
        reorder_point: item.reorder_point || 0,
        active: item.active ?? true,
        created_at: item.created_at,
        updated_at: item.updated_at,
        tags: item.tags || [],
        vendor: item.supplier ? { 
          name: item.supplier, 
          email: `${item.supplier.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: "555-0000"
        } : null,
        collection: { 
          name: item.collection_name || "Default Collection", 
          season: "All Season", 
          year: 2024 
        },
        product_code: item.sku,
        fabric_width: item.fabric_width || item.width,
        images: [],
        specifications: {},
        status: (item.quantity || 0) > 0 ? 'in_stock' : 'out_of_stock'
      }));
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<Inventory, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .insert({
          user_id: user.id,
          name: item.name,
          description: item.description || '',
          sku: item.sku || '',
          category: item.category || 'fabric',
          quantity: item.quantity,
          unit: item.unit || 'yard',
          cost_price: item.cost_price || 0,
          selling_price: item.selling_price || 0,
          supplier: item.supplier || '',
          location: item.location || '',
          fabric_width: item.width || 0,
          width: item.width || 0,
          reorder_point: item.reorder_point || 0,
          active: item.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Inventory item created successfully");
      return data;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<Inventory> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");
      
      const updateData: any = {};
      if (item.name !== undefined) updateData.name = item.name;
      if (item.description !== undefined) updateData.description = item.description;
      if (item.sku !== undefined) updateData.sku = item.sku;
      if (item.category !== undefined) updateData.category = item.category;
      if (item.quantity !== undefined) updateData.quantity = item.quantity;
      if (item.unit !== undefined) updateData.unit = item.unit;
      if (item.cost_price !== undefined) updateData.cost_price = item.cost_price;
      if (item.selling_price !== undefined) updateData.selling_price = item.selling_price;
      if (item.supplier !== undefined) updateData.supplier = item.supplier;
      if (item.location !== undefined) updateData.location = item.location;
      if (item.width !== undefined) {
        updateData.fabric_width = item.width;
        updateData.width = item.width;
      }
      if (item.reorder_point !== undefined) updateData.reorder_point = item.reorder_point;
      if (item.active !== undefined) updateData.active = item.active;

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Inventory item updated successfully");
      return data;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("enhanced_inventory_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Inventory item deleted successfully");
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabric-library'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
    },
  });
};
