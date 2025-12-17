import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export interface TemplateGridAssignment {
  id: string;
  template_id: string;
  pricing_grid_id: string;
  created_at: string;
}

export interface PricingGridBasic {
  id: string;
  name: string;
  grid_code: string;
  product_type: string | null;
  price_group: string | null;
  supplier_id: string | null;
}

export const useTemplateGridAssignments = (templateId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { effectiveOwnerId } = useEffectiveAccountOwner();

  // Fetch assigned grids for this template
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["template-grid-assignments", templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from("template_grid_assignments")
        .select(`
          id,
          template_id,
          pricing_grid_id,
          created_at,
          pricing_grids:pricing_grid_id (
            id,
            name,
            grid_code,
            product_type,
            price_group,
            supplier_id
          )
        `)
        .eq("template_id", templateId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!templateId,
  });

  // Get the assigned grid IDs
  const assignedGridIds = assignments.map((a: any) => a.pricing_grid_id);
  
  // Get the price groups from assigned grids
  const assignedPriceGroups = assignments
    .map((a: any) => a.pricing_grids?.price_group)
    .filter(Boolean) as string[];

  // Fetch available grids for the current user (using effectiveOwnerId)
  const { data: availableGrids = [], isLoading: isLoadingGrids } = useQuery({
    queryKey: ["available-pricing-grids", effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from("pricing_grids")
        .select("id, name, grid_code, product_type, price_group, supplier_id")
        .eq("user_id", effectiveOwnerId)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data as PricingGridBasic[];
    },
    enabled: !!effectiveOwnerId,
  });

  // Assign a grid to the template
  const assignGrid = useMutation({
    mutationFn: async (pricingGridId: string) => {
      if (!templateId) throw new Error("No template ID");
      
      const { error } = await supabase
        .from("template_grid_assignments")
        .insert({ template_id: templateId, pricing_grid_id: pricingGridId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-grid-assignments", templateId] });
      toast({ title: "Grid assigned" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign grid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Unassign a grid from the template
  const unassignGrid = useMutation({
    mutationFn: async (pricingGridId: string) => {
      if (!templateId) throw new Error("No template ID");
      
      const { error } = await supabase
        .from("template_grid_assignments")
        .delete()
        .eq("template_id", templateId)
        .eq("pricing_grid_id", pricingGridId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template-grid-assignments", templateId] });
      toast({ title: "Grid removed" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove grid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle grid assignment
  const toggleGrid = (pricingGridId: string) => {
    if (assignedGridIds.includes(pricingGridId)) {
      unassignGrid.mutate(pricingGridId);
    } else {
      assignGrid.mutate(pricingGridId);
    }
  };

  return {
    assignments,
    assignedGridIds,
    assignedPriceGroups,
    availableGrids,
    isLoading: isLoadingAssignments || isLoadingGrids,
    assignGrid: assignGrid.mutate,
    unassignGrid: unassignGrid.mutate,
    toggleGrid,
    isAssigning: assignGrid.isPending,
    isUnassigning: unassignGrid.isPending,
  };
};
