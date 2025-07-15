
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
      console.log('Fetching service options...');
      
      try {
        // Get current user first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user for service options');
          return [];
        }

        const { data, error } = await supabase
          .from('service_options')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('name');
        
        if (error) {
          console.error('Error fetching service options:', error);
          throw error;
        }
        
        console.log('Service options fetched:', data);
        return data as ServiceOption[];
      } catch (err) {
        console.error('Failed to fetch service options:', err);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCreateServiceOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<ServiceOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating service option:', option);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('service_options')
        .insert([{
          ...option,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating service option:', error);
        throw error;
      }
      
      console.log('Service option created:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Service option created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
    },
    onError: (error) => {
      console.error('Service option creation failed:', error);
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
