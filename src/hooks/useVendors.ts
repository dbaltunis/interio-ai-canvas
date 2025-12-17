import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Vendor = Tables<"vendors">;
type VendorInsert = TablesInsert<"vendors">;
type VendorUpdate = TablesUpdate<"vendors">;

export const useVendors = () => {
  const { effectiveOwnerId } = useEffectiveAccountOwner();
  
  return useQuery({
    queryKey: ["vendors", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveOwnerId,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (vendor: Omit<VendorInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("vendors")
        .insert({
          ...vendor,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast({
        title: "Success",
        description: "Vendor created successfully",
      });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<VendorUpdate>) => {
      const { data, error } = await supabase
        .from("vendors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast({
        title: "Success",
        description: "Vendor updated successfully",
      });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    },
  });
};
