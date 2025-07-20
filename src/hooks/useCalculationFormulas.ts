
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CalculationFormula {
  id: string;
  name: string;
  category: string;
  formula_expression: string;
  description?: string;
  variables: any[];
  active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  applies_to?: string[];
  conditions?: Record<string, any>;
}

// Mock data store
let mockFormulas: CalculationFormula[] = [];

export const useCalculationFormulas = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['calculation-formulas'],
    queryFn: async () => {
      // Mock implementation
      return mockFormulas;
    }
  });

  const createFormula = useMutation({
    mutationFn: async (formula: Omit<CalculationFormula, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      // Mock implementation
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
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
    }
  });

  const updateFormula = useMutation({
    mutationFn: async (formula: Partial<CalculationFormula> & { id: string }) => {
      // Mock implementation
      const index = mockFormulas.findIndex(f => f.id === formula.id);
      if (index !== -1) {
        mockFormulas[index] = { ...mockFormulas[index], ...formula, updated_at: new Date().toISOString() };
        return mockFormulas[index];
      }
      throw new Error('Formula not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
    }
  });

  const deleteFormula = useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      const index = mockFormulas.findIndex(f => f.id === id);
      if (index !== -1) {
        mockFormulas.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
    }
  });

  return {
    data,
    isLoading,
    error,
    createFormula,
    updateFormula,
    deleteFormula
  };
};
