
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const useFabricLibrary = () => {
  return useQuery({
    queryKey: ["fabric-library"],
    queryFn: async () => {
      // Mock implementation
      console.log('useFabricLibrary - Mock implementation');
      return mockFabricItems;
    },
  });
};

export const useCreateFabricItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<FabricItem, "id" | "user_id" | "created_at" | "updated_at">) => {
      // Mock implementation
      const newItem: FabricItem = {
        ...item,
        id: `fabric-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockFabricItems.push(newItem);
      return newItem;
    },
    onSuccess: () => {
      // Invalidate ALL fabric-related queries to ensure data consistency across the app
      queryClient.invalidateQueries({ queryKey: ["fabric-library"] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['treatment-specific-fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['window-summaries'] });
    },
  });
};
