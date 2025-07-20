
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PricingRule {
  id: string;
  name: string;
  category: string;
  rule_type: 'percentage' | 'fixed_amount';
  value: number;
  conditions: any;
  active: boolean;
  priority: number;
  formula?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Mock data store
let mockPricingRules: PricingRule[] = [
  {
    id: "pr-1",
    name: "Bulk Discount",
    category: "discount",
    rule_type: "percentage",
    value: 10,
    conditions: { min_quantity: 5 },
    active: true,
    priority: 1,
    formula: "base_price * 0.9",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: "mock-user"
  }
];

export const usePricingRules = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      console.log("Mock fetching pricing rules...");
      // Mock implementation
      return mockPricingRules.filter(rule => rule.active);
    }
  });

  const createPricingRule = useMutation({
    mutationFn: async (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      console.log("Mock creating pricing rule:", rule);
      
      const newRule: PricingRule = {
        ...rule,
        id: `pr-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockPricingRules.push(newRule);
      
      console.log("Mock rule created successfully:", newRule);
      return newRule;
    },
    onSuccess: () => {
      console.log("Invalidating pricing rules query");
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  const updatePricingRule = useMutation({
    mutationFn: async (rule: Partial<PricingRule> & { id: string }) => {
      console.log("Mock updating pricing rule:", rule);
      
      const index = mockPricingRules.findIndex(r => r.id === rule.id);
      if (index !== -1) {
        mockPricingRules[index] = {
          ...mockPricingRules[index],
          ...rule,
          updated_at: new Date().toISOString()
        };
        return mockPricingRules[index];
      }
      throw new Error("Rule not found");
    },
    onSuccess: () => {
      console.log("Invalidating pricing rules query after update");
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  const deletePricingRule = useMutation({
    mutationFn: async (id: string) => {
      console.log("Mock deleting pricing rule:", id);
      
      const index = mockPricingRules.findIndex(r => r.id === id);
      if (index !== -1) {
        mockPricingRules.splice(index, 1);
      }
    },
    onSuccess: () => {
      console.log("Invalidating pricing rules query after delete");
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  console.log("usePricingRules hook state:", {
    data,
    isLoading,
    error,
    dataLength: data?.length
  });

  return {
    data,
    isLoading,
    error,
    createPricingRule,
    updatePricingRule,
    deletePricingRule
  };
};
