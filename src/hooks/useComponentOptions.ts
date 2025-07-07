
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hardware Options
export interface HardwareOption {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  unit: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useHardwareOptions = () => {
  return useQuery({
    queryKey: ['hardware-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hardware_options')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching hardware options:', error);
        throw error;
      }
      
      return data as HardwareOption[];
    },
  });
};

export const useCreateHardwareOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<HardwareOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('hardware_options')
        .insert([{
          ...option,
          user_id: session.user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating hardware option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
    },
  });
};

export const useUpdateHardwareOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HardwareOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('hardware_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating hardware option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
    },
  });
};

export const useDeleteHardwareOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hardware_options')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting hardware option:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
    },
  });
};

// Lining Options
export interface LiningOption {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  unit: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLiningOptions = () => {
  return useQuery({
    queryKey: ['lining-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lining_options')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching lining options:', error);
        throw error;
      }
      
      return data as LiningOption[];
    },
  });
};

export const useCreateLiningOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<LiningOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('lining_options')
        .insert([{
          ...option,
          user_id: session.user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating lining option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lining-options'] });
    },
  });
};

export const useUpdateLiningOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LiningOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('lining_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating lining option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lining-options'] });
    },
  });
};

export const useDeleteLiningOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lining_options')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting lining option:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lining-options'] });
    },
  });
};
