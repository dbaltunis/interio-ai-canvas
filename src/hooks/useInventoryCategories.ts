
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InventoryCategory {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  category_type: string;
  sort_order: number;
  is_active: boolean;
  shopify_category_id?: string;
  shopify_handle?: string;
  sync_with_shopify: boolean;
  last_shopify_sync?: string;
  requires_dimensions: boolean;
  requires_fabric_specs: boolean;
  requires_material_info: boolean;
  default_unit: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
  children?: InventoryCategory[];
}

export const useInventoryCategories = () => {
  return useQuery({
    queryKey: ["inventory_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Build hierarchy
      const categoriesMap = new Map<string, InventoryCategory>();
      const rootCategories: InventoryCategory[] = [];

      // First pass: create map
      data.forEach(category => {
        categoriesMap.set(category.id, { ...category, children: [] });
      });

      // Second pass: build hierarchy
      data.forEach(category => {
        const cat = categoriesMap.get(category.id)!;
        if (category.parent_id) {
          const parent = categoriesMap.get(category.parent_id);
          if (parent) {
            parent.children!.push(cat);
          }
        } else {
          rootCategories.push(cat);
        }
      });

      return rootCategories;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<InventoryCategory, "id" | "user_id" | "created_at" | "updated_at" | "children">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("inventory_categories")
        .insert({ ...category, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create category: " + error.message);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<InventoryCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from("inventory_categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update category: " + error.message);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inventory_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory_categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });
};

export const useCategoriesByType = (categoryType?: string) => {
  return useQuery({
    queryKey: ["inventory_categories", categoryType],
    queryFn: async () => {
      let query = supabase
        .from("inventory_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (categoryType) {
        query = query.eq("category_type", categoryType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
