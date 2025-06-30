
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TreatmentTypeOption {
  id?: string;
  name: string;
  description?: string;
  cost?: number;
}

export interface TreatmentTypeSpecifications {
  options?: TreatmentTypeOption[];
  [key: string]: any;
}

export interface TreatmentType {
  id: string;
  name: string;
  description?: string;
  labor_rate?: number;
  specifications?: TreatmentTypeSpecifications;
  created_at?: string;
  updated_at?: string;
}

export const useTreatmentTypes = () => {
  return useQuery({
    queryKey: ['treatment-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treatment_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching treatment types:', error);
        throw error;
      }
      
      return data as TreatmentType[];
    },
  });
};

export const useCreateTreatmentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (treatmentType: Omit<TreatmentType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('treatment_types')
        .insert([treatmentType])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-types'] });
    },
  });
};

export const useUpdateTreatmentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TreatmentType> & { id: string }) => {
      const { data, error } = await supabase
        .from('treatment_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-types'] });
    },
  });
};

export const useDeleteTreatmentType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treatment_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-types'] });
    },
  });
};
