
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductTemplate {
  id: string;
  name: string;
  description?: string;
  treatment_type: string;
  product_type: string;
  product_category?: string;
  calculation_method?: string;
  pricing_grid_id?: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  components?: {
    headings?: { [key: string]: boolean };
    lining?: { [key: string]: boolean };
    hardware?: { [key: string]: boolean };
  };
  calculation_rules?: {
    labor_rate?: number;
    markup_percentage?: number;
    baseMakingCost?: number;
    baseHeightLimit?: number;
    heightSurcharge1?: number;
    selectedPricingGrid?: string;
  };
}

export const useProductTemplates = () => {
  return useQuery({
    queryKey: ["product-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_templates")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as ProductTemplate[];
    },
  });
};

export const useCreateProductTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<ProductTemplate, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("product_templates")
        .insert([{ ...template, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
    },
  });
};

export const useUpdateProductTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("product_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
    },
  });
};

export const useDeleteProductTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-templates"] });
    },
  });
};

// Mock data for now until templates are properly implemented
export const mockTemplates: ProductTemplate[] = [
  {
    id: "1",
    name: "Curtains",
    description: "Standard curtain treatment",
    treatment_type: "curtains",
    product_type: "curtains",
    product_category: "soft-furnishing",
    calculation_method: "fabric-based",
    active: true,
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    components: {
      headings: { "pencil-pleat": true, "eyelet": true },
      lining: { "standard": true, "blackout": true }
    },
    calculation_rules: {
      labor_rate: 45,
      markup_percentage: 40,
      baseMakingCost: 50,
      baseHeightLimit: 240,
      heightSurcharge1: 15
    }
  },
  {
    id: "2", 
    name: "Blinds",
    description: "Window blinds treatment",
    treatment_type: "blinds",
    product_type: "blinds",
    product_category: "hard-furnishing",
    calculation_method: "per-sqm",
    active: true,
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    calculation_rules: {
      labor_rate: 30,
      markup_percentage: 35
    }
  },
  {
    id: "3",
    name: "Shutters", 
    description: "Window shutters treatment",
    treatment_type: "shutters",
    product_type: "shutters",
    product_category: "hard-furnishing",
    calculation_method: "per-sqm",
    active: true,
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    calculation_rules: {
      labor_rate: 60,
      markup_percentage: 50
    }
  }
];
