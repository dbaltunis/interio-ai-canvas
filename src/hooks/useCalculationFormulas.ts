
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CalculationFormula {
  id: string;
  name: string;
  description?: string;
  category: string;
  formula_expression: string;
  applies_to?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data for calculation formulas
const mockFormulas: CalculationFormula[] = [
  {
    id: "1",
    name: "Basic Fabric Calculation",
    description: "Calculate fabric needed for curtains",
    category: "fabric",
    formula_expression: "width * height * fullness / fabric_width",
    applies_to: ["curtains", "drapes"],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Labor Cost Calculation",
    description: "Calculate labor costs based on complexity",
    category: "labor",
    formula_expression: "base_rate * complexity_factor * hours",
    applies_to: ["installation", "making"],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useCalculationFormulas = () => {
  const queryClient = useQueryClient();

  const { data: formulas, isLoading, error } = useQuery({
    queryKey: ['calculation-formulas'],
    queryFn: async () => {
      // Mock API call - replace with actual Supabase call when database is ready
      return new Promise<CalculationFormula[]>((resolve) => {
        setTimeout(() => resolve(mockFormulas), 100);
      });
    }
  });

  const createFormula = useMutation({
    mutationFn: async (formula: Omit<CalculationFormula, 'id' | 'created_at' | 'updated_at'>) => {
      // Mock creation - replace with actual Supabase call when database is ready
      const newFormula: CalculationFormula = {
        ...formula,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newFormula;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
      toast.success('Formula created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create formula');
      console.error('Error creating formula:', error);
    }
  });

  const updateFormula = useMutation({
    mutationFn: async (formula: Partial<CalculationFormula> & { id: string }) => {
      // Mock update - replace with actual Supabase call when database is ready
      return { ...formula, updated_at: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
      toast.success('Formula updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update formula');
      console.error('Error updating formula:', error);
    }
  });

  const deleteFormula = useMutation({
    mutationFn: async (id: string) => {
      // Mock deletion - replace with actual Supabase call when database is ready
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
      toast.success('Formula deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete formula');
      console.error('Error deleting formula:', error);
    }
  });

  return {
    data: formulas,
    isLoading,
    error,
    createFormula,
    updateFormula,
    deleteFormula
  };
};
