
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Component {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  component_type: 'hardware' | 'fabric_accessory' | 'heading' | 'service' | 'part';
  category?: string;
  price: number;
  unit: string;
  fullness_ratio?: number;
  specifications: any;
  active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useComponents = () => {
  const queryClient = useQueryClient();

  const { data: components, isLoading, error } = useQuery({
    queryKey: ['components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('active', true)
        .order('component_type, name');
      
      if (error) throw error;
      return data as Component[];
    }
  });

  const createComponent = useMutation({
    mutationFn: async (component: Omit<Component, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('components')
        .insert([{ ...component, user_id: (await supabase.auth.getUser()).data.user?.id! }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create component');
      console.error('Error creating component:', error);
    }
  });

  const updateComponent = useMutation({
    mutationFn: async (component: Partial<Component> & { id: string }) => {
      const { data, error } = await supabase
        .from('components')
        .update(component)
        .eq('id', component.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update component');
      console.error('Error updating component:', error);
    }
  });

  const deleteComponent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('components')
        .update({ active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete component');
      console.error('Error deleting component:', error);
    }
  });

  return {
    components,
    isLoading,
    error,
    createComponent: createComponent.mutateAsync,
    updateComponent: updateComponent.mutateAsync,
    deleteComponent: deleteComponent.mutateAsync
  };
};
