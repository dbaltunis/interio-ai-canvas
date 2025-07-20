
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CalculationFormula {
  id: string;
  name: string;
  description?: string;
  formula: string;
  variables: string[];
  category: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockFormulas: CalculationFormula[] = [
  {
    id: 'formula-1',
    name: 'Basic Fabric Calculation',
    description: 'Standard fabric calculation for curtains',
    formula: 'width * fullness * (drop + allowances)',
    variables: ['width', 'fullness', 'drop', 'allowances'],
    category: 'fabric',
    active: true,
    user_id: 'mock-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useCalculationFormulas = () => {
  return useQuery({
    queryKey: ["calculation-formulas"],
    queryFn: async () => {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockFormulas;
    },
  });
};

export const useCreateCalculationFormula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formula: Omit<CalculationFormula, "id" | "user_id" | "created_at" | "updated_at">) => {
      const newFormula: CalculationFormula = {
        ...formula,
        id: `formula-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockFormulas.push(newFormula);
      return newFormula;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculation-formulas"] });
    },
  });
};

export const useUpdateCalculationFormula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalculationFormula> & { id: string }) => {
      const index = mockFormulas.findIndex(f => f.id === id);
      if (index === -1) {
        throw new Error('Formula not found');
      }

      mockFormulas[index] = {
        ...mockFormulas[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      return mockFormulas[index];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculation-formulas"] });
    },
  });
};

export const useDeleteCalculationFormula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const index = mockFormulas.findIndex(f => f.id === id);
      if (index !== -1) {
        mockFormulas.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculation-formulas"] });
    },
  });
};
