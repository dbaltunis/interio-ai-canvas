
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Inventory = Tables<"inventory">;
type InventoryInsert = TablesInsert<"inventory">;
type InventoryUpdate = TablesUpdate<"inventory">;

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("name");

      if (error) throw error;
      
      // Enhance the data with mock vendor and collection info until tables are synced
      return data.map(item => ({
        ...item,
        vendor: item.supplier ? { 
          name: item.supplier, 
          email: `${item.supplier.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: "555-0000"
        } : null,
        collection: { 
          name: "Default Collection", 
          season: "All Season", 
          year: 2024 
        },
        product_code: item.sku,
        fabric_width: item.width,
        tags: [],
        images: [],
        specifications: {},
        status: item.quantity > 0 ? 'in_stock' : 'out_of_stock'
      }));
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<InventoryInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("inventory")
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: InventoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory")
        .update(item)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
