import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffectiveAccountOwner } from "./useEffectiveAccountOwner";
import type { Json } from "@/integrations/supabase/types";

export interface StitchingPrice {
  id: string;
  name: string;
  description?: string;
  price_per_meter?: number;
  price_per_unit?: number;
  pricing_method: 'per_meter' | 'per_unit' | 'per_curtain';
  heading_ids: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface StitchingPriceInput {
  name: string;
  description?: string;
  price_per_meter?: number;
  price_per_unit?: number;
  pricing_method: 'per_meter' | 'per_unit' | 'per_curtain';
  heading_ids: string[];
}

/**
 * Hook to fetch stitching prices from enhanced_inventory_items with subcategory='stitching'
 */
export const useStitchingPrices = () => {
  const { effectiveOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ["stitching-prices", effectiveOwnerId],
    enabled: !!effectiveOwnerId && !ownerLoading,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!effectiveOwnerId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from("enhanced_inventory_items")
        .select("*")
        .eq("user_id", effectiveOwnerId)
        .eq("category", "service")
        .eq("subcategory", "stitching")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      // Transform database records to StitchingPrice interface
      return (data || []).map(item => {
        const specs = item.specifications as Record<string, any> || {};
        return {
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          price_per_meter: item.price_per_meter || undefined,
          price_per_unit: item.price_per_unit || undefined,
          pricing_method: (specs.pricing_method || 'per_meter') as StitchingPrice['pricing_method'],
          heading_ids: (specs.heading_ids || []) as string[],
          active: item.active ?? true,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as StitchingPrice;
      });
    }
  });
};

/**
 * Get stitching prices for a specific heading ID
 */
export const useStitchingPricesForHeading = (headingId: string | undefined) => {
  const { data: allPrices, isLoading } = useStitchingPrices();

  const matchingPrices = allPrices?.filter(price => 
    price.heading_ids.includes(headingId || '')
  ) || [];

  return {
    stitchingPrices: matchingPrices,
    isLoading
  };
};

/**
 * Create a new stitching price
 */
export const useCreateStitchingPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StitchingPriceInput) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (authError || !userId) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description || null,
          category: 'service',
          subcategory: 'stitching',
          price_per_meter: input.price_per_meter || null,
          price_per_unit: input.price_per_unit || null,
          active: true,
          specifications: {
            pricing_method: input.pricing_method,
            heading_ids: input.heading_ids
          } as unknown as Json
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stitching-prices'] });
      toast.success('Stitching price created');
    },
    onError: (error) => {
      toast.error(`Error creating stitching price: ${error.message}`);
    }
  });
};

/**
 * Update an existing stitching price
 */
export const useUpdateStitchingPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: StitchingPriceInput & { id: string }) => {
      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .update({
          name: input.name,
          description: input.description || null,
          price_per_meter: input.price_per_meter || null,
          price_per_unit: input.price_per_unit || null,
          specifications: {
            pricing_method: input.pricing_method,
            heading_ids: input.heading_ids
          } as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stitching-prices'] });
      toast.success('Stitching price updated');
    },
    onError: (error) => {
      toast.error(`Error updating stitching price: ${error.message}`);
    }
  });
};

/**
 * Delete a stitching price (soft delete - set active=false)
 */
export const useDeleteStitchingPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enhanced_inventory_items')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stitching-prices'] });
      toast.success('Stitching price deleted');
    },
    onError: (error) => {
      toast.error(`Error deleting stitching price: ${error.message}`);
    }
  });
};
