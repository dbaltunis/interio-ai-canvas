import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import { getEffectiveOwnerForMutation } from "@/utils/getEffectiveOwnerForMutation";

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSuppliers = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["suppliers", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .order("name");

      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!effectiveOwnerId,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, "id" | "user_id" | "created_at" | "updated_at">) => {
      // FIX: Use effectiveOwnerId for multi-tenant support
      const { effectiveOwnerId } = await getEffectiveOwnerForMutation();

      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          user_id: effectiveOwnerId,
          ...supplier,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Supplier created",
        description: `${supplier.name} has been added`,
      });

      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Supplier updated",
        description: "Supplier information has been updated",
      });

      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
