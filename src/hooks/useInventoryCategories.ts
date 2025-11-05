import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type InventoryCategoryRow = Database['public']['Tables']['inventory_categories']['Row'];
type InventoryCategoryInsert = Database['public']['Tables']['inventory_categories']['Insert'];
type InventoryCategoryUpdate = Database['public']['Tables']['inventory_categories']['Update'];

export interface InventoryCategory extends InventoryCategoryRow {
  children?: InventoryCategory[];
}

export const useInventoryCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('user_id', user.user.id)
        .order('sort_order');

      if (error) throw error;
      return data as InventoryCategory[];
    },
  });

  // Build hierarchical structure
  const buildHierarchy = (categories: InventoryCategory[]): InventoryCategory[] => {
    const categoryMap = new Map<string, InventoryCategory>();
    const rootCategories: InventoryCategory[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
      const cat = categoryMap.get(category.id)!;
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(cat);
        } else {
          rootCategories.push(cat);
        }
      } else {
        rootCategories.push(cat);
      }
    });

    return rootCategories;
  };

  const hierarchicalCategories = buildHierarchy(categories);

  return {
    data: categories,
    categories,
    hierarchicalCategories,
    isLoading,
  };
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<InventoryCategoryInsert, 'user_id'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({
          ...category,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryCategoryUpdate> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};
