
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
      console.log("Fetching pricing rules from database...");
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      console.log("Database response:", { data, error });
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Pricing rules fetched:", data);
      return data as PricingRule[];
    }
  });

  const createPricingRule = useMutation({
    mutationFn: async (rule: Omit<PricingRule, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      console.log("Creating pricing rule:", rule);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        throw new Error('User not authenticated');
      }
      
      console.log("User authenticated:", user.id);
      
      const { data, error } = await supabase
        .from('pricing_rules')
        .insert([{ ...rule, user_id: user.id }])
        .select()
        .single();
      
      console.log("Insert response:", { data, error });
      
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      
      console.log("Rule created successfully:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Invalidating pricing rules query");
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  const updatePricingRule = useMutation({
    mutationFn: async (rule: Partial<PricingRule> & { id: string }) => {
      console.log("Updating pricing rule:", rule);
      
      const { data, error } = await supabase
        .from('pricing_rules')
        .update(rule)
        .eq('id', rule.id)
        .select()
        .single();
      
      console.log("Update response:", { data, error });
      
      if (error) {
        console.error("Update error:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log("Invalidating pricing rules query after update");
      queryClient.invalidateQueries({ queryKey: ['pricing-rules'] });
    }
  });

  const deletePricingRule = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting pricing rule:", id);
      
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', id);
      
      console.log("Delete response:", { error });
      
      if (error) {
        console.error("Delete error:", error);
        throw error;
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
