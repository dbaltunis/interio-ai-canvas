
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHardwareInventory = () => {
  return useQuery({
    queryKey: ["hardware_inventory"],
    queryFn: async () => {
      // For now, return mock data until the hardware_inventory table is properly synced
      return [
        {
          id: "1",
          name: "Curtain Brackets - Chrome",
          product_code: "CB-CHR-001",
          category: "Brackets",
          subcategory: "Wall Mount",
          material: "Chrome Steel",
          finish: "Polished Chrome",
          quantity: 50,
          unit: "each",
          cost_per_unit: 12.50,
          retail_price: 25.00,
          reorder_point: 10,
          location: "Shelf A-1",
          status: "in_stock",
          vendor: { name: "Hardware Plus", email: "orders@hardwareplus.com", phone: "555-0123" },
          tags: ["chrome", "brackets", "wall-mount"],
          images: [],
          specifications: { weight_capacity: "10kg", installation_type: "wall_mount" },
          notes: "Popular chrome bracket for modern curtains",
          active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Curtain Rails - White 2m",
          product_code: "CR-WHT-200",
          category: "Rails",
          subcategory: "Ceiling Mount",
          material: "Aluminum",
          finish: "Powder Coated White",
          quantity: 25,
          unit: "each",
          cost_per_unit: 35.00,
          retail_price: 70.00,
          reorder_point: 5,
          location: "Shelf B-2",
          status: "in_stock",
          vendor: { name: "Rail Systems Ltd", email: "info@railsystems.com", phone: "555-0456" },
          tags: ["white", "rails", "ceiling-mount", "2m"],
          images: [],
          specifications: { length: "2000mm", weight_capacity: "15kg" },
          notes: "Standard white rail system",
          active: true,
          created_at: new Date().toISOString(),
        }
      ];
    },
  });
};

export const useCreateHardwareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: any) => {
      // Mock implementation for now
      const newItem = {
        id: Date.now().toString(),
        ...item,
        created_at: new Date().toISOString(),
      };
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};

export const useUpdateHardwareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...item }: any) => {
      // Mock implementation for now
      return { id, ...item };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};

export const useDeleteHardwareItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock implementation for now
      console.log("Deleting hardware item:", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hardware_inventory"] });
    },
  });
};
