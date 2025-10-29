import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EyeletRing {
  id: string;
  user_id?: string;
  name: string;
  color: string;
  diameter: number;
  material: string;
  finish: string;
  image_url?: string;
  cost_price: number;
  selling_price: number;
  supplier?: string;
  vendor_id?: string;
  is_default: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEyeletRings = () => {
  return useQuery({
    queryKey: ['eyelet-rings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('eyelet_rings')
        .select('*')
        .eq('active', true)
        .order('is_default', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as EyeletRing[];
    }
  });
};

export const useCreateEyeletRing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ring: Omit<EyeletRing, 'id' | 'created_at' | 'updated_at' | 'is_default' | 'active'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('eyelet_rings')
        .insert({
          ...ring,
          user_id: user.id,
          is_default: false,
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eyelet-rings'] });
      toast.success("Eyelet ring created successfully");
    },
    onError: (error) => {
      console.error("Error creating eyelet ring:", error);
      toast.error("Failed to create eyelet ring");
    }
  });
};

export const useUpdateEyeletRing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...ring }: Partial<EyeletRing> & { id: string }) => {
      const { data, error } = await supabase
        .from('eyelet_rings')
        .update(ring)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eyelet-rings'] });
      toast.success("Eyelet ring updated successfully");
    },
    onError: (error) => {
      console.error("Error updating eyelet ring:", error);
      toast.error("Failed to update eyelet ring");
    }
  });
};

export const useDeleteEyeletRing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eyelet_rings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eyelet-rings'] });
      toast.success("Eyelet ring deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting eyelet ring:", error);
      toast.error("Failed to delete eyelet ring");
    }
  });
};
