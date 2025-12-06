import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RoomProduct {
  id: string;
  room_id: string;
  inventory_item_id: string | null;
  user_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  name: string | null;
  description: string | null;
  image_url: string | null;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
  inventory_item?: {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    image_url: string | null;
    unit: string;
  };
}

export interface RoomProductInsert {
  room_id: string;
  inventory_item_id?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  name?: string;
  description?: string;
  image_url?: string;
  is_custom?: boolean;
}

export const useRoomProducts = (roomId?: string) => {
  return useQuery({
    queryKey: ["room-products", roomId],
    queryFn: async () => {
      if (!roomId) return [];

      const { data, error } = await supabase
        .from("room_products")
        .select(`
          *,
          inventory_item:enhanced_inventory_items(
            id,
            name,
            category,
            subcategory,
            image_url,
            unit
          )
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as RoomProduct[];
    },
    enabled: !!roomId,
  });
};

export const useCreateRoomProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: RoomProductInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("room_products")
        .insert({
          ...product,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["room-products", variables.room_id] });
      queryClient.invalidateQueries({ queryKey: ["project-room-products"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Product added to room");
    },
    onError: (error) => {
      console.error("Error adding room product:", error);
      toast.error("Failed to add product");
    },
  });
};

export const useCreateRoomProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: RoomProductInsert[]) => {
      if (products.length === 0) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const productsWithUser = products.map(p => ({
        ...p,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from("room_products")
        .insert(productsWithUser)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["room-products", variables[0].room_id] });
        queryClient.invalidateQueries({ queryKey: ["project-room-products"] });
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        queryClient.invalidateQueries({ queryKey: ["quote-items"] });
        queryClient.invalidateQueries({ queryKey: ["quotes"] });
      }
      toast.success(`${variables.length} product(s) added to room`);
    },
    onError: (error) => {
      console.error("Error adding room products:", error);
      toast.error("Failed to add products");
    },
  });
};

export const useUpdateRoomProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, roomId, ...updates }: { id: string; roomId: string; quantity?: number; notes?: string }) => {
      const updateData: any = { ...updates };
      
      // If quantity changed, recalculate total
      if (updates.quantity !== undefined) {
        const { data: existing } = await supabase
          .from("room_products")
          .select("unit_price")
          .eq("id", id)
          .single();
        
        if (existing) {
          updateData.total_price = updates.quantity * existing.unit_price;
        }
      }

      const { data, error } = await supabase
        .from("room_products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room-products", data.room_id] });
      queryClient.invalidateQueries({ queryKey: ["project-room-products"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
    onError: (error) => {
      console.error("Error updating room product:", error);
      toast.error("Failed to update product");
    },
  });
};

export const useDeleteRoomProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, roomId }: { id: string; roomId: string }) => {
      const { error } = await supabase
        .from("room_products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, roomId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["room-products", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["project-room-products"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["quote-items"] });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Product removed");
    },
    onError: (error) => {
      console.error("Error deleting room product:", error);
      toast.error("Failed to remove product");
    },
  });
};
