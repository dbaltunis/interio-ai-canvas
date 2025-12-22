import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Helper to get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export interface BundleRule {
  id: string;
  user_id: string;
  parent_item_id?: string;
  parent_item_key?: string;
  child_item_key: string;
  child_item_id?: string;
  child_unit_price?: number;
  qty_formula: string;
  condition?: Record<string, any>;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBundleRules = (parentItemId?: string, parentItemKey?: string) => {
  return useQuery({
    queryKey: ['bundle-rules', parentItemId, parentItemKey],
    queryFn: async () => {
      let query = supabase
        .from('bundle_rules')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });
      
      if (parentItemId) {
        query = query.eq('parent_item_id', parentItemId);
      } else if (parentItemKey) {
        query = query.eq('parent_item_key', parentItemKey);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as BundleRule[];
    },
    enabled: !!(parentItemId || parentItemKey),
  });
};

export const useAllBundleRules = () => {
  return useQuery({
    queryKey: ['bundle-rules', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_rules')
        .select('*')
        .order('parent_item_key', { ascending: true })
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return (data || []) as BundleRule[];
    },
  });
};

export const useCreateBundleRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: Omit<BundleRule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const user = await getCurrentUser();
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('bundle_rules')
        .insert({
          ...rule,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundle-rules'] });
      toast.success('Bundle rule created');
    },
    onError: (error) => {
      toast.error('Failed to create bundle rule: ' + error.message);
    },
  });
};

export const useUpdateBundleRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BundleRule> }) => {
      const { data, error } = await supabase
        .from('bundle_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundle-rules'] });
      toast.success('Bundle rule updated');
    },
    onError: (error) => {
      toast.error('Failed to update bundle rule: ' + error.message);
    },
  });
};

export const useDeleteBundleRule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bundle_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bundle-rules'] });
      toast.success('Bundle rule deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete bundle rule: ' + error.message);
    },
  });
};
