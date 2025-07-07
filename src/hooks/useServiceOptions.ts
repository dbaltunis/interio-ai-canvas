
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceOption {
  id: string;
  user_id?: string;
  name: string;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServiceOptions = () => {
  return useQuery({
    queryKey: ['service-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching service options:', error);
        throw error;
      }
      
      return data as ServiceOption[];
    },
  });
};

export const useCreateServiceOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<ServiceOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('service_options')
        .insert([{
          ...option,
          user_id: session.user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating service option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
    },
  });
};

export const useUpdateServiceOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating service option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
    },
  });
};

export const useDeleteServiceOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_options')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting service option:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
    },
  });
};
