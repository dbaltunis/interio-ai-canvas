import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OptionTypeCategory {
  id: string;
  user_id: string | null;
  treatment_category: string;
  type_key: string;
  type_label: string;
  is_system_default: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useOptionTypeCategories = (treatmentCategory?: string) => {
  return useQuery({
    queryKey: ['option-type-categories', treatmentCategory],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('option_type_categories')
        .select('*')
        .eq('active', true)
        .order('type_label');
      
      if (treatmentCategory) {
        query = query.eq('treatment_category', treatmentCategory);
      }
      
      // Get system defaults OR user's own option types
      if (user) {
        query = query.or(`is_system_default.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_system_default', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as OptionTypeCategory[];
    },
    enabled: !!treatmentCategory,
  });
};

export const useCreateOptionTypeCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (category: Omit<OptionTypeCategory, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_system_default' | 'active'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('option_type_categories')
        .insert({
          ...category,
          user_id: user.id,
          is_system_default: false,
          active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
      toast({
        title: "Option type created",
        description: "You can now add values to this option type.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create option type",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteOptionTypeCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('option_type_categories')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
      toast({
        title: "Option type deleted",
        description: "The option type has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete option type",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
