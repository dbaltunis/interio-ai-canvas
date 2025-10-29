import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductVariant {
  id: string;
  user_id?: string;
  variant_type: string;
  name: string;
  value: string;
  hex_color?: string;
  image_url?: string;
  is_default: boolean;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductVariants = (variantType?: string) => {
  return useQuery({
    queryKey: ['product-variants', variantType],
    queryFn: async () => {
      let query = supabase
        .from('product_variants')
        .select('*')
        .eq('active', true);

      if (variantType) {
        query = query.eq('variant_type', variantType);
      }

      const { data, error } = await query.order('sort_order');
      
      if (error) throw error;
      return data as ProductVariant[];
    }
  });
};

export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'is_default'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          ...variant,
          user_id: user.id,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success("Variant created successfully");
    },
    onError: (error) => {
      console.error("Error creating variant:", error);
      toast.error("Failed to create variant");
    }
  });
};

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...variant }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(variant)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success("Variant updated successfully");
    },
    onError: (error) => {
      console.error("Error updating variant:", error);
      toast.error("Failed to update variant");
    }
  });
};

export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      toast.success("Variant deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant");
    }
  });
};
