
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WindowCovering {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  margin_percentage: number;
  active: boolean;
  unit_price?: number;
  making_cost_id?: string;
  fabric_id?: string;
  default_components?: string[];
  calculation_method_id?: string;
  minimum_width?: number;
  maximum_width?: number;
  minimum_height?: number;
  maximum_height?: number;
  pricing_grid_data?: string;
  image_url?: string;
  fabrication_pricing_method?: string;
  created_at: string;
  updated_at: string;
}

export const useWindowCoverings = () => {
  const queryClient = useQueryClient();

  const { data: windowCoverings, isLoading, error } = useQuery({
    queryKey: ['window-coverings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('window_coverings')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data as WindowCovering[];
    }
  });

  const createWindowCovering = useMutation({
    mutationFn: async (windowCovering: Omit<WindowCovering, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('window_coverings')
        .insert([{ ...windowCovering, user_id: (await supabase.auth.getUser()).data.user?.id! }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['window-coverings'] });
      toast.success('Window covering created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create window covering');
      console.error('Error creating window covering:', error);
    }
  });

  const updateWindowCovering = useMutation({
    mutationFn: async (windowCovering: Partial<WindowCovering> & { id: string }) => {
      const { data, error } = await supabase
        .from('window_coverings')
        .update(windowCovering)
        .eq('id', windowCovering.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['window-coverings'] });
      toast.success('Window covering updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update window covering');
      console.error('Error updating window covering:', error);
    }
  });

  const deleteWindowCovering = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('window_coverings')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['window-coverings'] });
      toast.success('Window covering deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete window covering');
      console.error('Error deleting window covering:', error);
    }
  });

  return {
    windowCoverings,
    isLoading,
    error,
    createWindowCovering: createWindowCovering.mutateAsync,
    updateWindowCovering: updateWindowCovering.mutateAsync,
    deleteWindowCovering: deleteWindowCovering.mutateAsync
  };
};
