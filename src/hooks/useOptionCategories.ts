import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the interfaces for the hierarchical option structure
export interface OptionCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category_type: string;
  is_required: boolean;
  sort_order: number;
  image_url?: string;
  has_fullness_ratio?: boolean;
  fullness_ratio?: number;
  calculation_method?: string;
  affects_fabric_calculation?: boolean;
  affects_labor_calculation?: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  subcategories?: OptionSubcategory[];
}

export interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
  image_url?: string;
  calculation_method?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  sub_subcategories?: OptionSubSubcategory[];
}

export interface OptionSubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
  image_url?: string;
  calculation_method?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  extras?: OptionExtra[];
}

export interface OptionExtra {
  id: string;
  sub_subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  sort_order: number;
  image_url?: string;
  is_required: boolean;
  is_default: boolean;
  fullness_ratio?: number;
  calculation_method?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useOptionCategories = (categoryType?: string) => {
  return useQuery({
    queryKey: ["option-categories", categoryType],
    queryFn: async () => {
      let query = supabase
        .from('option_categories')
        .select(`
          *,
          subcategories:option_subcategories(
            *,
            sub_subcategories:option_sub_subcategories(
              *,
              extras:option_extras(*)
            )
          )
        `)
        .eq('active', true)
        .order('sort_order');

      if (categoryType) {
        query = query.eq('category_type', categoryType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching option categories:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateOptionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<OptionCategory, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from('option_categories')
        .insert([{
          ...category,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating option category:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option category created");
    },
  });
};

export const useCreateOptionSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subcategory: Omit<OptionSubcategory, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from('option_subcategories')
        .insert([subcategory])
        .select()
        .single();

      if (error) {
        console.error('Error creating option subcategory:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option subcategory created");
    },
  });
};
export const useUpdateOptionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OptionCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('option_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating option category:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option category updated");
    },
  });
};

export const useDeleteOptionCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('option_categories')
        .update({ active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting option category:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["option-categories"] });
      toast.success("Option category deleted");
    },
  });
};