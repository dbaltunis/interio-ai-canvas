
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FabricOrder {
  id: string;
  fabric_code: string;
  fabric_type: string;
  color: string;
  pattern?: string;
  supplier: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  work_order_ids: string[];
  status?: string;
  order_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useFabricOrders = () => {
  return useQuery({
    queryKey: ["fabric-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fabric_orders")
        .select("*");
      
      if (error) throw error;
      return data as FabricOrder[];
    },
  });
};

export const useCreateFabricOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fabricOrder: Omit<FabricOrder, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("fabric_orders")
        .insert([{ ...fabricOrder, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabric-orders"] });
    },
  });
};

export const useUpdateFabricOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FabricOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from("fabric_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabric-orders"] });
    },
  });
};
