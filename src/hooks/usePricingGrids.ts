
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PricingGrid {
  id: string;
  user_id: string;
  name: string;
  grid_data: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePricingGrids = () => {
  return useQuery({
    queryKey: ['pricing-grids'],
    queryFn: async () => {
      console.log('Fetching pricing grids...');
      const { data, error } = await supabase
        .from('pricing_grids')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching pricing grids:', error);
        throw error;
      }
      
      console.log('Pricing grids fetched:', data);
      return data as PricingGrid[];
    },
  });
};

export const useCreatePricingGrid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (gridData: { name: string; grid_data: any }) => {
      console.log('Creating pricing grid:', gridData);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pricing_grids')
        .insert([{
          ...gridData,
          user_id: session.user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating pricing grid:', error);
        throw error;
      }
      
      console.log('Pricing grid created:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Pricing grid created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['pricing-grids'] });
    },
    onError: (error) => {
      console.error('Pricing grid creation failed:', error);
    },
  });
};

export const useDeletePricingGrid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pricing_grids')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting pricing grid:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-grids'] });
    },
  });
};
