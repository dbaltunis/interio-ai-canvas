
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeadingOption {
  id: string;
  user_id?: string;
  name: string;
  fullness: number;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useHeadingOptions = () => {
  return useQuery({
    queryKey: ['heading-options'],
    queryFn: async () => {
      console.log('Fetching heading options...');
      
      try {
        // Get current user first
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user for heading options');
          return [];
        }

        const { data, error } = await supabase
          .from('heading_options')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('name');
        
        if (error) {
          console.error('Error fetching heading options:', error);
          throw error;
        }
        
        console.log('Heading options fetched:', data);
        return data as HeadingOption[];
      } catch (err) {
        console.error('Failed to fetch heading options:', err);
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCreateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<HeadingOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating heading option:', option);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('heading_options')
        .insert([{
          ...option,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating heading option:', error);
        throw error;
      }
      
      console.log('Heading option created:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Heading option created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
    onError: (error) => {
      console.error('Heading option creation failed:', error);
    },
  });
};

export const useUpdateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeadingOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('heading_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating heading option:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
  });
};

export const useDeleteHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('heading_options')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting heading option:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
  });
};
