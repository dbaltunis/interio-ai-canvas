import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeadingOption {
  id: string;
  user_id: string;
  name: string;
  fullness: number;
  price: number;
  type: string;
  extras: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useHeadingOptions = () => {
  return useQuery({
    queryKey: ['heading-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heading_options')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Error fetching heading options:', error);
        throw error;
      }
      
      return data as HeadingOption[];
    },
  });
};

export const useCreateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (headingOption: Omit<HeadingOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('heading_options')
        .insert([{
          ...headingOption,
          user_id: '' // Will be overridden by the database trigger
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
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
      
      if (error) throw error;
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
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
    },
  });
};