import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InventoryCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  parent_category_id?: string | null;
  sort_order: number;
  color?: string | null;
  icon?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
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
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;
      return data as InventoryCategory[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (category: Omit<InventoryCategory, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'children'>) => {
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

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InventoryCategory> & { id: string }) => {
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

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_categories')
        .update({ active: false })
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

  // Build hierarchical structure
  const buildHierarchy = (categories: InventoryCategory[]): InventoryCategory[] => {
    const categoryMap = new Map<string, InventoryCategory>();
    const rootCategories: InventoryCategory[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build hierarchy
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
    categories,
    hierarchicalCategories,
    isLoading,
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
  };
};
