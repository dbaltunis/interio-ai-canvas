
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  quantity: number;
  unit?: string;
  cost_price?: number;
  selling_price?: number;
  supplier?: string;
  location?: string;
  width?: number;
  reorder_point?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockInventoryItems: InventoryItem[] = [
  {
    id: "inv-1",
    user_id: "mock-user",
    name: "Curtain Hooks",
    description: "Standard curtain hooks",
    sku: "CH-001",
    category: "Hardware",
    quantity: 15,
    unit: "pieces",
    cost_price: 2.50,
    selling_price: 5.00,
    supplier: "Hardware Supplies",
    location: "Storage Room",
    reorder_point: 10,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      // Mock implementation
      return mockInventoryItems.filter(item => item.active);
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, "id" | "user_id" | "created_at" | "updated_at">) => {
      // Mock implementation
      const newItem: InventoryItem = {
        ...item,
        id: `inv-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockInventoryItems.push(newItem);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: async () => {
      // Mock implementation
      return mockInventoryItems.filter(item => 
        item.active && 
        item.reorder_point && 
        item.quantity <= item.reorder_point
      );
    },
  });
};
