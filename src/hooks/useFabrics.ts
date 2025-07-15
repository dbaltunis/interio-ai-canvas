
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Fabric {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  fabric_width: number;
  pattern_repeat: number;
  rotation_allowed: boolean;
  fabric_type?: string;
  weight?: string;
  care_instructions?: string;
  supplier?: string;
  fabric_code?: string;
  cost_per_meter: number;
  active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useFabrics = () => {
  const queryClient = useQueryClient();

  const { data: fabrics, isLoading, error } = useQuery({
    queryKey: ['fabrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fabrics')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data as Fabric[];
    }
  });

  const createFabric = useMutation({
    mutationFn: async (fabric: Omit<Fabric, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('fabrics')
        .insert([{ ...fabric, user_id: (await supabase.auth.getUser()).data.user?.id! }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      toast.success('Fabric created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create fabric');
      console.error('Error creating fabric:', error);
    }
  });

  const updateFabric = useMutation({
    mutationFn: async (fabric: Partial<Fabric> & { id: string }) => {
      const { data, error } = await supabase
        .from('fabrics')
        .update(fabric)
        .eq('id', fabric.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      toast.success('Fabric updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update fabric');
      console.error('Error updating fabric:', error);
    }
  });

  const deleteFabric = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fabrics')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      toast.success('Fabric deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete fabric');
      console.error('Error deleting fabric:', error);
    }
  });

  return {
    fabrics,
    isLoading,
    error,
    createFabric: createFabric.mutateAsync,
    updateFabric: updateFabric.mutateAsync,
    deleteFabric: deleteFabric.mutateAsync
  };
};
