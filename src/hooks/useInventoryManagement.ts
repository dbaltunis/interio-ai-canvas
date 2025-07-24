
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Inventory {
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
  unit_price?: number; // Added this property
  supplier?: string;
  location?: string;
  width?: number;
  reorder_point?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockInventory: Inventory[] = [
  {
    id: "inv-1",
    user_id: "mock-user",
    name: "Curtain Rails - White",
    description: "Premium white curtain rails",
    sku: "CR-WHT-001",
    category: "Hardware",
    quantity: 25,
    unit: "pieces",
    cost_price: 15.50,
    selling_price: 25.00,
    unit_price: 25.00,
    supplier: "Hardware Plus",
    location: "Warehouse A",
    width: 200,
    reorder_point: 5,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      // Mock implementation with enhanced data
      return mockInventory.map(item => ({
        ...item,
        vendor: item.supplier ? { 
          name: item.supplier, 
          email: `${item.supplier.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: "555-0000"
        } : null,
        collection: { 
          name: "Default Collection", 
          season: "All Season", 
          year: 2024 
        },
        product_code: item.sku,
        fabric_width: item.width,
        tags: [],
        images: [],
        specifications: {},
        status: item.quantity > 0 ? 'in_stock' : 'out_of_stock'
      }));
    },
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<Inventory, "id" | "user_id" | "created_at" | "updated_at">) => {
      // Mock implementation
      const newItem: Inventory = {
        ...item,
        id: `inv-${Date.now()}`,
        user_id: 'mock-user',
        unit_price: item.selling_price || item.cost_price || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockInventory.push(newItem);
      
      toast.success("Inventory item created successfully");
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<Inventory> & { id: string }) => {
      // Mock implementation
      const index = mockInventory.findIndex(inv => inv.id === id);
      if (index !== -1) {
        mockInventory[index] = {
          ...mockInventory[index],
          ...item,
          unit_price: item.selling_price || item.cost_price || mockInventory[index].unit_price || 0,
          updated_at: new Date().toISOString()
        };
        
        toast.success("Inventory item updated successfully");
        return mockInventory[index];
      }
      throw new Error("Item not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation
      const index = mockInventory.findIndex(inv => inv.id === id);
      if (index !== -1) {
        mockInventory.splice(index, 1);
        toast.success("Inventory item deleted successfully");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

// Add the missing export
export const useInventoryManagement = () => {
  return {
    inventory: useInventory(),
    createItem: useCreateInventoryItem(),
    updateItem: useUpdateInventoryItem(),
    deleteItem: useDeleteInventoryItem()
  };
};
