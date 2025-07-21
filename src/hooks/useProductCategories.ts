
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from '@/hooks/use-toast';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Mock data store
let mockCategories: ProductCategory[] = [
  {
    id: '1',
    name: 'Curtains',
    description: 'Window treatments and curtains',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-1'
  },
  {
    id: '2',
    name: 'Blinds',
    description: 'Window blinds and shades',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-1'
  },
  {
    id: '3',
    name: 'Wallpaper',
    description: 'Wall coverings and wallpaper',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-1'
  }
];

export const useProductCategories = () => {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockCategories.sort((a, b) => a.name.localeCompare(b.name));
    },
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newCategory: ProductCategory = {
        ...category,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user-1'
      };
      mockCategories.push(newCategory);
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast({ title: 'Product category created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating product category', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductCategory> & { id: string }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCategories[index] = { ...mockCategories[index], ...updates, updated_at: new Date().toISOString() };
        return mockCategories[index];
      }
      throw new Error('Category not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast({ title: 'Product category updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating product category', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCategories.splice(index, 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast({ title: 'Product category deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting product category', description: error.message, variant: 'destructive' });
    },
  });
};
