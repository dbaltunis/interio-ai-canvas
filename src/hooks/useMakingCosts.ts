
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MakingCost {
  id: string;
  user_id: string;
  name: string;
  pricing_method: string;
  include_fabric_selection: boolean;
  measurement_type: string;
  heading_options: any;
  hardware_options: any;
  lining_options: any;
  drop_ranges: any;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MakingCostFormData {
  name: string;
  pricing_method: string;
  include_fabric_selection: boolean;
  measurement_type: string;
  heading_options: any;
  hardware_options: any;
  lining_options: any;
  drop_ranges: any;
  description?: string;
  active: boolean;
}

export const useMakingCosts = () => {
  const queryClient = useQueryClient();

  const {
    data: makingCosts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['making_costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('making_costs')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as MakingCost[];
    }
  });

  const createMakingCost = useMutation({
    mutationFn: async (makingCost: MakingCostFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('making_costs')
        .insert({
          ...makingCost,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['making_costs'] });
      toast.success('Making cost created successfully');
    },
    onError: (error) => {
      console.error('Error creating making cost:', error);
      toast.error('Failed to create making cost');
    }
  });

  const updateMakingCost = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MakingCostFormData>) => {
      const { data, error } = await supabase
        .from('making_costs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['making_costs'] });
      toast.success('Making cost updated successfully');
    },
    onError: (error) => {
      console.error('Error updating making cost:', error);
      toast.error('Failed to update making cost');
    }
  });

  const deleteMakingCost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('making_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['making_costs'] });
      toast.success('Making cost deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting making cost:', error);
      toast.error('Failed to delete making cost');
    }
  });

  return {
    makingCosts,
    isLoading,
    error,
    createMakingCost,
    updateMakingCost,
    deleteMakingCost
  };
};
