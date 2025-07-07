
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectInventoryUsage = (projectId?: string) => {
  return useQuery({
    queryKey: ["project_inventory_usage", projectId],
    queryFn: async () => {
      // Mock implementation for now until project_inventory_usage table is synced
      return [
        {
          id: "1",
          project: { name: "Living Room Curtains", job_number: "JOB-001" },
          inventory: { name: "Blue Velvet Fabric", product_code: "BVF-001", unit: "yard" },
          hardware: null,
          quantity_used: 5.5,
          unit: "yard",
          cost_per_unit: 25.00,
          total_cost: 137.50,
          usage_date: "2024-01-15",
          notes: "Used for main curtains",
          created_at: new Date().toISOString(),
        }
      ];
    },
    enabled: !!projectId || projectId === undefined,
  });
};

export const useCreateProjectInventoryUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (usage: any) => {
      // Mock implementation for now
      const newUsage = {
        id: Date.now().toString(),
        ...usage,
        created_at: new Date().toISOString(),
      };
      return newUsage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_inventory_usage"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};
