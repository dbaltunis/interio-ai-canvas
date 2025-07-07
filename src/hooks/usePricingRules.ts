import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const usePricingRules = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pricing-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PricingRule[];
    }
  });

  const createPricingRule = useMutation({
    mutationFn: async (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert([{ ...rule, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  const updatePricingRule = useMutation({
    mutationFn: async (rule: Partial<PricingRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('pricing_rules')
        .update(rule)
        .eq('id', rule.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  const deletePricingRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
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