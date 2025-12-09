
/**
 * @deprecated This hook returned MOCK data and caused heading display failures.
 * Use useHeadingInventory() or useEnhancedInventoryByCategory('heading') instead.
 * 
 * MIGRATION: Replace all usages with:
 *   import { useHeadingInventory } from "@/hooks/useHeadingInventory";
 *   const { data: headingOptions = [] } = useHeadingInventory();
 */

import { useHeadingInventory } from "./useHeadingInventory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HeadingOption {
  id: string;
  user_id?: string;
  name: string;
  fullness_ratio?: number;
  fullness?: number;
  price?: number;
  selling_price?: number;
  price_per_meter?: number;
  type?: string;
  extras?: any;
  description?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  metadata?: any;
  category?: string;
}

/**
 * @deprecated Use useHeadingInventory() instead
 * This hook now redirects to real inventory data instead of empty mock data.
 */
export const useHeadingOptions = () => {
  console.warn('⚠️ [DEPRECATED] useHeadingOptions() is deprecated. Use useHeadingInventory() instead.');
  
  // ✅ REDIRECT TO REAL DATA: Return actual heading inventory items
  const result = useHeadingInventory();
  
  // Map inventory items to HeadingOption interface for backwards compatibility
  const mappedData = (result.data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    name: item.name,
    fullness_ratio: item.fullness_ratio,
    fullness: item.fullness_ratio, // Legacy alias
    price: item.selling_price || item.price_per_meter || 0,
    selling_price: item.selling_price,
    price_per_meter: item.price_per_meter,
    type: item.subcategory || 'heading',
    description: item.description,
    active: item.active !== false,
    created_at: item.created_at,
    updated_at: item.updated_at,
    metadata: item.metadata,
    category: item.category,
  })) as HeadingOption[];
  
  return {
    ...result,
    data: mappedData,
  };
};

export const useCreateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (option: Omit<HeadingOption, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          user_id: user.id,
          name: option.name,
          category: 'heading',
          subcategory: option.type || 'heading',
          fullness_ratio: option.fullness_ratio || option.fullness,
          selling_price: option.price || option.selling_price,
          price_per_meter: option.price_per_meter,
          description: option.description,
          active: option.active !== false,
          metadata: option.extras || option.metadata,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory', 'heading'] });
      toast.success('Heading created successfully');
    },
    onError: (error) => {
      toast.error(`Error creating heading: ${error.message}`);
    },
  });
};

export const useUpdateHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeadingOption> & { id: string }) => {
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.fullness_ratio !== undefined) updateData.fullness_ratio = updates.fullness_ratio;
      if (updates.fullness !== undefined) updateData.fullness_ratio = updates.fullness;
      if (updates.price !== undefined) updateData.selling_price = updates.price;
      if (updates.selling_price !== undefined) updateData.selling_price = updates.selling_price;
      if (updates.price_per_meter !== undefined) updateData.price_per_meter = updates.price_per_meter;
      if (updates.type !== undefined) updateData.subcategory = updates.type;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.active !== undefined) updateData.active = updates.active;
      if (updates.extras !== undefined) updateData.metadata = updates.extras;
      if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
      
      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory', 'heading'] });
      toast.success('Heading updated successfully');
    },
    onError: (error) => {
      toast.error(`Error updating heading: ${error.message}`);
    },
  });
};

export const useDeleteHeadingOption = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enhanced_inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heading-options'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory', 'heading'] });
      toast.success('Heading deleted successfully');
    },
    onError: (error) => {
      toast.error(`Error deleting heading: ${error.message}`);
    },
  });
};
