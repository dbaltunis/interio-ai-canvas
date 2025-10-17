import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectMaterialAllocation {
  id: string;
  project_id: string;
  inventory_item_id: string;
  allocated_quantity: number;
  used_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useProjectMaterialAllocations = (projectId?: string) => {
  return useQuery({
    queryKey: ["project-material-allocations", projectId],
    queryFn: async () => {
      let query = supabase
        .from("project_material_allocations")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as ProjectMaterialAllocation[];
    },
    enabled: !!projectId || projectId === undefined,
  });
};

export const useAllocateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (allocation: { project_id: string; inventory_item_id: string; allocated_quantity: number; status?: string }) => {
      const { data, error } = await supabase
        .from("project_material_allocations")
        .insert({
          project_id: allocation.project_id,
          inventory_item_id: allocation.inventory_item_id,
          allocated_quantity: allocation.allocated_quantity,
          status: allocation.status || 'allocated',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Material allocated",
        description: "Material has been allocated to the project",
      });

      return data as ProjectMaterialAllocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-material-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUpdateMaterialUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, used_quantity, status }: { id: string; used_quantity: number; status?: string }) => {
      const { data, error } = await supabase
        .from("project_material_allocations")
        .update({
          used_quantity,
          status: status || 'used',
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Usage updated",
        description: "Material usage has been recorded",
      });

      return data as ProjectMaterialAllocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-material-allocations"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
