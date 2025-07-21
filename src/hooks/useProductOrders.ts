
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ProductOrder = Tables<"product_orders">;
type ProductOrderInsert = TablesInsert<"product_orders">;
type ProductOrderUpdate = TablesUpdate<"product_orders">;

export const useProductOrders = (projectId?: string) => {
  return useQuery({
    queryKey: ["product-orders", projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !projectId) return [];

      const { data, error } = await supabase
        .from("product_orders")
        .select(`
          *,
          vendors (
            id,
            name,
            email,
            lead_time_days
          )
        `)
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
};

export const useCreateProductOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productOrder: Omit<ProductOrderInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("product_orders")
        .insert({
          ...productOrder,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-orders"] });
      toast({
        title: "Success",
        description: "Product order created successfully",
      });
    },
  });
};

export const useUpdateProductOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProductOrderUpdate>) => {
      const { data, error } = await supabase
        .from("product_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-orders"] });
      toast({
        title: "Success",
        description: "Product order updated successfully",
      });
    },
  });
};

export const useDeleteProductOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("product_orders")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-orders"] });
      toast({
        title: "Success",
        description: "Product order deleted successfully",
      });
    },
  });
};
