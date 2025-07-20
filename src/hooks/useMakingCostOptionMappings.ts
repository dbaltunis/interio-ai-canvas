
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface MakingCostOptionMapping {
  id: string;
  making_cost_id: string;
  option_category_id: string;
  option_type: 'heading' | 'hardware' | 'lining';
  is_included: boolean;
  option_category?: {
    id: string;
    name: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

// Mock data
const mockMappings: MakingCostOptionMapping[] = [
  {
    id: "1",
    making_cost_id: "1",
    option_category_id: "1", 
    option_type: "heading",
    is_included: true,
    option_category: {
      id: "1",
      name: "Standard Heading",
      description: "Basic heading option"
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useMakingCostOptionMappings = (makingCostId?: string) => {
  return useQuery({
    queryKey: ["making-cost-option-mappings", makingCostId],
    queryFn: async () => {
      return mockMappings.filter(mapping => 
        !makingCostId || mapping.making_cost_id === makingCostId
      );
    },
  });
};

export const useCreateMakingCostOptionMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mapping: Omit<MakingCostOptionMapping, "id" | "created_at" | "updated_at">) => {
      const newMapping = {
        ...mapping,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newMapping;
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
      return { id, ...updates, updated_at: new Date().toISOString() };
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
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-cost-option-mappings"] });
      toast.success("Option mapping deleted");
    },
  });
};
