
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PricingMethod {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  method_type: 'linear_meter' | 'per_drop' | 'per_panel' | 'pricing_grid' | 'fixed_price';
  base_price: number;
  pricing_grid_id?: string;
  calculation_formula_id?: string;
  height_tiers: any[];
  width_tiers: any[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockPricingMethods: PricingMethod[] = [
  {
    id: "pm-1",
    user_id: "mock-user",
    name: "Linear Meter Pricing",
    description: "Price per linear meter",
    method_type: "linear_meter",
    base_price: 25.00,
    height_tiers: [],
    width_tiers: [],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const usePricingMethods = () => {
  const queryClient = useQueryClient();

  const { data: pricingMethods, isLoading, error } = useQuery({
    queryKey: ['pricing-methods'],
    queryFn: async () => {
      // Mock implementation
      return mockPricingMethods.filter(method => method.active);
    }
  });

  const createPricingMethod = useMutation({
    mutationFn: async (pricingMethod: Omit<PricingMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      // Mock implementation
      const newMethod: PricingMethod = {
        ...pricingMethod,
        id: `pm-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockPricingMethods.push(newMethod);
      return newMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-methods'] });
      toast.success('Pricing method created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create pricing method');
      console.error('Error creating pricing method:', error);
    }
  });

  const updatePricingMethod = useMutation({
    mutationFn: async (pricingMethod: Partial<PricingMethod> & { id: string }) => {
      // Mock implementation
      const index = mockPricingMethods.findIndex(method => method.id === pricingMethod.id);
      if (index !== -1) {
        mockPricingMethods[index] = {
          ...mockPricingMethods[index],
          ...pricingMethod,
          updated_at: new Date().toISOString()
        };
        return mockPricingMethods[index];
      }
      throw new Error("Method not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-methods'] });
      toast.success('Pricing method updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update pricing method');
      console.error('Error updating pricing method:', error);
    }
  });

  const deletePricingMethod = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      const index = mockPricingMethods.findIndex(method => method.id === id);
      if (index !== -1) {
        mockPricingMethods[index].active = false;
        mockPricingMethods[index].updated_at = new Date().toISOString();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-methods'] });
      toast.success('Pricing method deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete pricing method');
      console.error('Error deleting pricing method:', error);
    }
  });

  return {
    pricingMethods,
    isLoading,
    error,
    createPricingMethod: createPricingMethod.mutateAsync,
    updatePricingMethod: updatePricingMethod.mutateAsync,
    deletePricingMethod: deletePricingMethod.mutateAsync
  };
};
