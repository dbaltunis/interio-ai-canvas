import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";
import { checkProjectStatusAsync } from "@/contexts/ProjectStatusContext";

/** Look up the project_id for a room so we can check locked status */
async function getProjectIdForRoom(roomId: string): Promise<string | null> {
  const { data } = await supabase
    .from("rooms")
    .select("project_id")
    .eq("id", roomId)
    .single();
  return data?.project_id ?? null;
}

export interface RoomProduct {
  id: string;
  room_id: string;
  inventory_item_id: string | null;
  user_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number | null;
  markup_percentage: number | null;
  markup_source: string | null;
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
  cost_price?: number | null;
  markup_percentage?: number | null;
  markup_source?: string | null;
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
      // Check project status before adding product
      const projectId = await getProjectIdForRoom(product.room_id);
      if (projectId) {
        const status = await checkProjectStatusAsync(projectId);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot add product: Project is in "${status.statusName}" status`);
        }
      }

      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const { data, error } = await supabase
        .from("room_products")
        .insert({
          ...product,
          user_id: effectiveOwnerId,
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
      // No success toast - product appears visually in room
    },
    onError: (error) => {
      console.error("Error adding room product:", error);
      toast.error("Could not add product to room. Check your connection and try again.");
    },
  });
};

export const useCreateRoomProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (products: RoomProductInsert[]) => {
      if (products.length === 0) return [];

      // Check project status before adding products
      const projectId = await getProjectIdForRoom(products[0].room_id);
      if (projectId) {
        const status = await checkProjectStatusAsync(projectId);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot add products: Project is in "${status.statusName}" status`);
        }
      }

      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const productsWithUser = products.map(p => ({
        ...p,
        user_id: effectiveOwnerId,
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
      // No success toast - products appear visually in room
    },
    onError: (error) => {
      console.error("Error adding room products:", error);
      toast.error("Could not add products to room. Check your connection and try again.");
    },
  });
};

export const useUpdateRoomProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, roomId, ...updates }: { id: string; roomId: string; quantity?: number; notes?: string; name?: string; unit_price?: number; description?: string }) => {
      // Check project status before updating
      const projectId = await getProjectIdForRoom(roomId);
      if (projectId) {
        const status = await checkProjectStatusAsync(projectId);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot update product: Project is in "${status.statusName}" status`);
        }
      }

      const updateData: any = { ...updates };
      
      // If quantity or unit_price changed, recalculate total
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const { data: existing } = await supabase
          .from("room_products")
          .select("unit_price, quantity")
          .eq("id", id)
          .single();
        
        if (existing) {
          const finalQty = updates.quantity ?? existing.quantity;
          const finalPrice = updates.unit_price ?? existing.unit_price;
          updateData.total_price = finalQty * finalPrice;
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
      // Check project status before deleting
      const projectId = await getProjectIdForRoom(roomId);
      if (projectId) {
        const status = await checkProjectStatusAsync(projectId);
        if (status.isLocked || status.isViewOnly) {
          throw new Error(`Cannot remove product: Project is in "${status.statusName}" status`);
        }
      }

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
      // No success toast - product disappears visually from room
    },
    onError: (error) => {
      console.error("Error deleting room product:", error);
      toast.error("Could not remove product. Please refresh and try again.");
    },
  });
};
