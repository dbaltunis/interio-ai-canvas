
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export const usePricingMethods = () => {
  const queryClient = useQueryClient();

  const { data: pricingMethods, isLoading, error } = useQuery({
    queryKey: ['pricing-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_methods')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data as PricingMethod[];
    }
  });

  const createPricingMethod = useMutation({
    mutationFn: async (pricingMethod: Omit<PricingMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('pricing_methods')
        .insert([{ ...pricingMethod, user_id: (await supabase.auth.getUser()).data.user?.id! }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('pricing_methods')
        .update(pricingMethod)
        .eq('id', pricingMethod.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('pricing_methods')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
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
