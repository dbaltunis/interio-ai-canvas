
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
      // Mock data until types are regenerated
      const mockCategories: InventoryCategory[] = [
        {
          id: "1",
          user_id: "user-1",
          name: "Fabrics",
          slug: "fabrics",
          description: "All fabric products",
          parent_id: null,
          category_type: "fabric",
          sort_order: 1,
          is_active: true,
          shopify_category_id: null,
          shopify_handle: null,
          sync_with_shopify: false,
          last_shopify_sync: null,
          requires_dimensions: true,
          requires_fabric_specs: true,
          requires_material_info: false,
          default_unit: "yard",
          tags: ["textiles"],
          custom_fields: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          children: []
        },
        {
          id: "2",
          user_id: "user-1",
          name: "Hardware",
          slug: "hardware",
          description: "Hardware and accessories",
          parent_id: null,
          category_type: "hardware",
          sort_order: 2,
          is_active: true,
          shopify_category_id: null,
          shopify_handle: null,
          sync_with_shopify: false,
          last_shopify_sync: null,
          requires_dimensions: false,
          requires_fabric_specs: false,
          requires_material_info: true,
          default_unit: "each",
          tags: ["accessories"],
          custom_fields: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          children: []
        }
      ];

      return mockCategories;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<InventoryCategory, "id" | "user_id" | "created_at" | "updated_at" | "children">) => {
      // Mock implementation
      console.log("Creating category:", category);
      return { id: Date.now().toString(), ...category, user_id: "user-1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
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
      // Mock implementation
      console.log("Updating category:", id, category);
      return { id, ...category };
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
      // Mock implementation
      console.log("Deleting category:", id);
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
      // Mock implementation
      const allCategories = [
        { id: "1", name: "Fabrics", category_type: "fabric", is_active: true, sort_order: 1 },
        { id: "2", name: "Hardware", category_type: "hardware", is_active: true, sort_order: 2 }
      ];
      
      if (categoryType) {
        return allCategories.filter(cat => cat.category_type === categoryType);
      }
      
      return allCategories;
    },
  });
};
