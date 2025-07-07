
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type ProjectInventoryUsage = Tables<"project_inventory_usage">;
type ProjectInventoryUsageInsert = TablesInsert<"project_inventory_usage">;

export const useProjectInventoryUsage = (projectId?: string) => {
  return useQuery({
    queryKey: ["project_inventory_usage", projectId],
    queryFn: async () => {
      let query = supabase
        .from("project_inventory_usage")
        .select(`
          *,
          project:projects(name, job_number),
          inventory:inventory(name, product_code, unit),
          hardware:hardware_inventory(name, product_code, unit)
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!projectId || projectId === undefined,
  });
};

export const useCreateProjectInventoryUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usage: Omit<ProjectInventoryUsageInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("project_inventory_usage")
        .insert({ ...usage, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      // Update inventory quantities
      if (usage.inventory_id) {
        await supabase.rpc('update_inventory_quantity', {
          inventory_id: usage.inventory_id,
          quantity_change: -usage.quantity_used
        });
      }

      if (usage.hardware_id) {
        await supabase.rpc('update_hardware_quantity', {
          hardware_id: usage.hardware_id,
          quantity_change: -usage.quantity_used
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_inventory_usage"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};
