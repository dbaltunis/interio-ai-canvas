
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface MakingCost {
  id: string;
  name: string;
  pricing_method: string;
  include_fabric_selection: boolean;
  measurement_type: string;
  heading_options: any[];
  hardware_options: any[];
  lining_options: any[];
  drop_ranges: any[];
  description: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data since the table doesn't exist yet
const mockMakingCosts: MakingCost[] = [
  {
    id: '1',
    name: 'Standard Curtains',
    pricing_method: 'drop_range',
    include_fabric_selection: true,
    measurement_type: 'standard',
    heading_options: [
      { name: 'Pencil Pleat', fullness: 2.5, cost: 0 },
      { name: 'Eyelet', fullness: 2.0, cost: 10 }
    ],
    hardware_options: [
      { name: 'Standard Track', cost: 25 },
      { name: 'Curtain Rod', cost: 35 }
    ],
    lining_options: [
      { name: 'No Lining', cost: 0 },
      { name: 'Standard Lining', cost: 15 }
    ],
    drop_ranges: [
      { min: 0, max: 150, price: 50 },
      { min: 151, max: 250, price: 75 },
      { min: 251, max: 350, price: 100 }
    ],
    description: 'Standard curtain making service',
    active: true,
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useMakingCosts = () => {
  const queryClient = useQueryClient();

  const { data: makingCosts = [], isLoading, error } = useQuery({
    queryKey: ["making-costs"],
    queryFn: async () => {
      // Return mock data for now
      return mockMakingCosts;
    },
  });

  const createMakingCost = useMutation({
    mutationFn: async (makingCostData: Omit<MakingCost, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      // Mock implementation
      const newMakingCost: MakingCost = {
        ...makingCostData,
        id: Date.now().toString(),
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newMakingCost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-costs"] });
      toast.success("Making cost created successfully");
    },
    onError: (error) => {
      console.error("Error creating making cost:", error);
      toast.error("Failed to create making cost");
    },
  });

  const updateMakingCost = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MakingCost> & { id: string }) => {
      // Mock implementation
      return { id, ...updateData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-costs"] });
      toast.success("Making cost updated successfully");
    },
    onError: (error) => {
      console.error("Error updating making cost:", error);
      toast.error("Failed to update making cost");
    },
  });

  const deleteMakingCost = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      console.log('Deleting making cost:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["making-costs"] });
      toast.success("Making cost deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting making cost:", error);
      toast.error("Failed to delete making cost");
    },
  });

  return {
    makingCosts,
    isLoading,
    error,
    createMakingCost: createMakingCost.mutate,
    updateMakingCost: updateMakingCost.mutate,
    deleteMakingCost: deleteMakingCost.mutate,
  };
};
