
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type HardwareInventory = Tables<"hardware_inventory">;
type HardwareInventoryInsert = TablesInsert<"hardware_inventory">;
type HardwareInventoryUpdate = TablesUpdate<"hardware_inventory">;

export const useHardwareInventory = () => {
  return useQuery({
    queryKey: ["hardware_inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hardware_inventory")
        .select(`
          *,
          vendor:vendors(name, email, phone)
        `)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateHardwareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<HardwareInventoryInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("hardware_inventory")
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};

export const useUpdateHardwareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: HardwareInventoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("hardware_inventory")
        .update(item)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};

export const useDeleteHardwareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hardware_inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};
