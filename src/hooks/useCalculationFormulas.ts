import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

export const useCalculationFormulas = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['calculation-formulas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calculation_formulas')
        .select('*')
        .order('category')
        .order('name');
      
      if (error) throw error;
      return data as CalculationFormula[];
    }
  });

  const createFormula = useMutation({
    mutationFn: async (formula: Omit<CalculationFormula, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('calculation_formulas')
        .insert([{ ...formula, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
    }
  });

  const updateFormula = useMutation({
    mutationFn: async (formula: Partial<CalculationFormula> & { id: string }) => {
      const { data, error } = await supabase
        .from('calculation_formulas')
        .update(formula)
        .eq('id', formula.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calculation-formulas'] });
    }
  });

  const deleteFormula = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calculation_formulas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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