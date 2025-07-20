
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface FabricOrder {
  id: string;
  fabric_code: string;
  fabric_type: string;
  color: string;
  pattern?: string;
  supplier: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  work_order_ids: string[];
  status?: string;
  order_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockFabricOrders: FabricOrder[] = [
  {
    id: "fo-1",
    fabric_code: "FB001",
    fabric_type: "Cotton",
    color: "Cream",
    pattern: "Solid",
    supplier: "Fabric Warehouse",
    quantity: 20,
    unit: "meters",
    unit_price: 15.50,
    total_price: 310.00,
    work_order_ids: [],
    status: "pending",
    order_date: new Date().toISOString(),
    user_id: "mock-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useFabricOrders = () => {
  return useQuery({
    queryKey: ["fabric-orders"],
    queryFn: async () => {
      // Mock implementation
      return mockFabricOrders;
    },
  });
};

export const useCreateFabricOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fabricOrder: Omit<FabricOrder, "id" | "user_id" | "created_at" | "updated_at">) => {
      // Mock implementation
      const newOrder: FabricOrder = {
        ...fabricOrder,
        id: `fo-${Date.now()}`,
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockFabricOrders.push(newOrder);
      
      toast.success("Fabric order created successfully");
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabric-orders"] });
    },
  });
};

export const useUpdateFabricOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FabricOrder> & { id: string }) => {
      // Mock implementation
      const index = mockFabricOrders.findIndex(order => order.id === id);
      if (index !== -1) {
        mockFabricOrders[index] = {
          ...mockFabricOrders[index],
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        toast.success("Fabric order updated successfully");
        return mockFabricOrders[index];
      }
      throw new Error("Order not found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fabric-orders"] });
    },
  });
};
