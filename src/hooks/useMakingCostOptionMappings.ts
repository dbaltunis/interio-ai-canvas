
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MakingCostOptionMapping {
  id: string;
  making_cost_id: string;
  option_category_id: string;
  option_type: 'heading' | 'hardware' | 'lining' | 'operation' | 'material';
  is_included: boolean;
  option_category?: {
    id: string;
    name: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

export const useMakingCostOptionMappings = (makingCostId?: string) => {
  return useQuery({
    queryKey: ["making-cost-option-mappings", makingCostId],
    queryFn: async () => {
      let query = supabase
        .from('making_cost_option_mappings')
        .select(`
          *,
          option_category:option_categories(
            id,
            name,
            description
          )
        `);

      if (makingCostId) {
        query = query.eq('making_cost_id', makingCostId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching making cost option mappings:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateMakingCostOptionMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mapping: Omit<MakingCostOptionMapping, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from('making_cost_option_mappings')
        .insert([mapping])
        .select()
        .single();

      if (error) {
        console.error('Error creating making cost option mapping:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-cost-option-mappings"] });
      toast.success("Option mapping created");
    },
  });
};

export const useUpdateMakingCostOptionMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MakingCostOptionMapping> & { id: string }) => {
      const { data, error } = await supabase
        .from('making_cost_option_mappings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating making cost option mapping:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-cost-option-mappings"] });
      toast.success("Option mapping updated");
    },
  });
};

export const useDeleteMakingCostOptionMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('making_cost_option_mappings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting making cost option mapping:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-cost-option-mappings"] });
      toast.success("Option mapping deleted");
    },
  });
};
