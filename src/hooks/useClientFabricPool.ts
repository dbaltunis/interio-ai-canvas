import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FabricPoolItem {
  id: string;
  client_id: string;
  fabric_id: string;
  project_id: string | null;
  window_id: string | null;
  treatment_name: string | null;
  leftover_length_cm: number;
  fabric_width_cm: number;
  orientation: 'vertical' | 'horizontal';
  is_available: boolean;
  used_in_window_id: string | null;
  used_in_treatment_name: string | null;
  used_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  // Joined fabric details
  fabric_name?: string;
  fabric_image_url?: string;
}

export const useClientFabricPool = (clientId: string | undefined) => {
  const queryClient = useQueryClient();

  // Fetch available leftover fabric for a client
  const {
    data: availableLeftover = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['client-fabric-pool', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('client_fabric_pool')
        .select(`
          *,
          fabric:enhanced_inventory_items(name, image_url)
        `)
        .eq('client_id', clientId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        fabric_name: item.fabric?.name,
        fabric_image_url: item.fabric?.image_url
      })) as FabricPoolItem[];
    },
    enabled: !!clientId
  });

  // Get all leftover fabric (including used) for project summary
  const {
    data: allLeftover = [],
  } = useQuery({
    queryKey: ['client-fabric-pool-all', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('client_fabric_pool')
        .select(`
          *,
          fabric:enhanced_inventory_items(name, image_url)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        fabric_name: item.fabric?.name,
        fabric_image_url: item.fabric?.image_url
      })) as FabricPoolItem[];
    },
    enabled: !!clientId
  });

  // Add leftover to pool
  const addToPoolMutation = useMutation({
    mutationFn: async (params: {
      client_id: string;
      fabric_id: string;
      project_id: string;
      window_id: string;
      treatment_name: string;
      leftover_length_cm: number;
      fabric_width_cm: number;
      orientation: 'vertical' | 'horizontal';
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('client_fabric_pool')
        .insert([params])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool-all', clientId] });
      toast.success('Leftover fabric added to pool');
    },
    onError: (error: Error) => {
      console.error('Error adding to fabric pool:', error);
      toast.error('Failed to add leftover to fabric pool');
    }
  });

  // Mark leftover as used
  const useLeftoverMutation = useMutation({
    mutationFn: async (params: {
      leftover_id: string;
      used_in_window_id: string;
      used_in_treatment_name: string;
    }) => {
      const { data, error } = await supabase
        .from('client_fabric_pool')
        .update({
          is_available: false,
          used_in_window_id: params.used_in_window_id,
          used_in_treatment_name: params.used_in_treatment_name,
          used_at: new Date().toISOString()
        })
        .eq('id', params.leftover_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool-all', clientId] });
      toast.success('Leftover fabric marked as used');
    },
    onError: (error: Error) => {
      console.error('Error marking leftover as used:', error);
      toast.error('Failed to mark leftover as used');
    }
  });

  // Release leftover back to available
  const releaseLeftoverMutation = useMutation({
    mutationFn: async (leftoverId: string) => {
      const { data, error } = await supabase
        .from('client_fabric_pool')
        .update({
          is_available: true,
          used_in_window_id: null,
          used_in_treatment_name: null,
          used_at: null
        })
        .eq('id', leftoverId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool-all', clientId] });
      toast.success('Leftover fabric released back to pool');
    },
    onError: (error: Error) => {
      console.error('Error releasing leftover:', error);
      toast.error('Failed to release leftover');
    }
  });

  // Delete leftover from pool
  const deleteLeftoverMutation = useMutation({
    mutationFn: async (leftoverId: string) => {
      const { error } = await supabase
        .from('client_fabric_pool')
        .delete()
        .eq('id', leftoverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-fabric-pool-all', clientId] });
      toast.success('Leftover fabric removed from pool');
    },
    onError: (error: Error) => {
      console.error('Error deleting leftover:', error);
      toast.error('Failed to remove leftover from pool');
    }
  });

  // Find matching leftover for a specific fabric and required length
  const findMatchingLeftover = (fabricId: string, requiredLengthCm: number, orientation: 'vertical' | 'horizontal') => {
    return availableLeftover.filter(item => 
      item.fabric_id === fabricId &&
      item.orientation === orientation &&
      item.leftover_length_cm >= requiredLengthCm
    ).sort((a, b) => a.leftover_length_cm - b.leftover_length_cm); // Smallest suitable piece first
  };

  return {
    availableLeftover,
    allLeftover,
    isLoading,
    error,
    addToPool: addToPoolMutation.mutate,
    useLeftover: useLeftoverMutation.mutate,
    releaseLeftover: releaseLeftoverMutation.mutate,
    deleteLeftover: deleteLeftoverMutation.mutate,
    findMatchingLeftover,
    isAddingToPool: addToPoolMutation.isPending,
    isUsingLeftover: useLeftoverMutation.isPending
  };
};