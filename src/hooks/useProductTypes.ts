
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductType {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description?: string;
  default_calculation_method: string;
  default_fullness_ratio: number;
  requires_track_measurement: boolean;
  requires_drop_measurement: boolean;
  requires_pattern_repeat: boolean;
  default_waste_percentage: number;
  default_hem_allowance: number;
  default_seam_allowance: number;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductTypeFormData {
  name: string;
  category: string;
  description?: string;
  default_calculation_method: string;
  default_fullness_ratio: number;
  requires_track_measurement: boolean;
  requires_drop_measurement: boolean;
  requires_pattern_repeat: boolean;
  default_waste_percentage: number;
  default_hem_allowance: number;
  default_seam_allowance: number;
  image_url?: string;
  active: boolean;
}

export const useProductTypes = () => {
  const queryClient = useQueryClient();

  const {
    data: productTypes = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['product_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ProductType[];
    }
  });

  const createProductType = useMutation({
    mutationFn: async (productType: ProductTypeFormData) => {
      const { data, error } = await supabase
        .from('product_types')
        .insert([productType])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_types'] });
      toast.success('Product type created successfully');
    },
    onError: (error) => {
      console.error('Error creating product type:', error);
      toast.error('Failed to create product type');
    }
  });

  const updateProductType = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ProductTypeFormData>) => {
      const { data, error } = await supabase
        .from('product_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_types'] });
      toast.success('Product type updated successfully');
    },
    onError: (error) => {
      console.error('Error updating product type:', error);
      toast.error('Failed to update product type');
    }
  });

  const deleteProductType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_types'] });
      toast.success('Product type deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting product type:', error);
      toast.error('Failed to delete product type');
    }
  });

  return {
    productTypes,
    isLoading,
    error,
    createProductType,
    updateProductType,
    deleteProductType
  };
};
