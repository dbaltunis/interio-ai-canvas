import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the interface for making cost configurations
export interface MakingCost {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  product_type: string;
  pricing_method: string;
  measurement_type: string;
  base_price: number;
  labor_cost: number;
  waste_factor: number;
  minimum_charge: number;
  options: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMakingCosts = () => {
  return useQuery({
    queryKey: ["making-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('making_costs')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching making costs:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateMakingCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (makingCost: Omit<MakingCost, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from('making_costs')
        .insert([{
          ...makingCost,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating making cost:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-costs"] });
      toast.success("Making cost created successfully");
    },
  });
};

export const useUpdateMakingCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MakingCost> & { id: string }) => {
      const { data, error } = await supabase
        .from('making_costs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating making cost:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-costs"] });
      toast.success("Making cost updated successfully");
    },
  });
};

export const useDeleteMakingCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('making_costs')
        .update({ active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting making cost:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-costs"] });
      toast.success("Making cost deleted successfully");
    },
  });
};