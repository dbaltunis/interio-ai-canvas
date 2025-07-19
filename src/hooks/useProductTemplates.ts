
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductTemplate {
  id: string;
  name: string;
  description?: string;
  treatment_type: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
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

// Mock data for now until templates are properly implemented
export const mockTemplates: ProductTemplate[] = [
  {
    id: "1",
    name: "Curtains",
    description: "Standard curtain treatment",
    treatment_type: "curtains",
    active: true,
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2", 
    name: "Blinds",
    description: "Window blinds treatment",
    treatment_type: "blinds",
    active: true,
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Shutters", 
    description: "Window shutters treatment",
    treatment_type: "shutters",
    active: true,
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Use mock data until we have proper templates
export const templates = mockTemplates;
