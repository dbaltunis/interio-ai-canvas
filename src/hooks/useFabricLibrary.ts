
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FabricItem {
  id: string;
  name: string;
  description?: string;
  fabric_type: string;
  color: string;
  pattern?: string;
  fabric_width: number;
  cost_per_unit: number;
  quantity_in_stock: number;
  reorder_point: number;
  vendor_id?: string;
  collection_id?: string;
  product_code?: string;
  tags: string[];
  images: string[];
  specifications: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useFabricLibrary = () => {
  return useQuery({
    queryKey: ["fabric-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fabric_library")
        .select(`
          *,
          vendor:vendor_id(*),
          collection:collection_id(*)
        `)
        .order("name");
      
      if (error) throw error;
      return data as FabricItem[];
    },
  });
};

export const useCreateFabricItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<FabricItem, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("fabric_library")
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabric-library"] });
    },
  });
};

// Mock data for development
export const mockFabricItems: FabricItem[] = [
  {
    id: "1",
    name: "Cotton Canvas",
    description: "Heavy duty cotton canvas",
    fabric_type: "Cotton",
    color: "Natural",
    pattern: "Solid",
    fabric_width: 140,
    cost_per_unit: 25.50,
    quantity_in_stock: 50,
    reorder_point: 10,
    product_code: "CC001",
    tags: ["cotton", "canvas", "heavy-duty"],
    images: [],
    specifications: { weight: "12oz", composition: "100% Cotton" },
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Silk Dupioni",
    description: "Luxury silk dupioni fabric",
    fabric_type: "Silk",
    color: "Gold",
    pattern: "Textured",
    fabric_width: 110,
    cost_per_unit: 89.00,
    quantity_in_stock: 25,
    reorder_point: 5,
    product_code: "SD002",
    tags: ["silk", "luxury", "dupioni"],
    images: [],
    specifications: { weight: "4oz", composition: "100% Silk" },
    user_id: "mock",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
