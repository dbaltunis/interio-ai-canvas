import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaterialOrder {
  type: 'allocated' | 'needed';
  material: string;
  quantity: number;
  status: string;
  inventoryId?: string;
}

interface MaterialToProcess {
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
  currentQuantity: number;
}

export const useConvertQuoteToMaterials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      materials 
    }: { 
      projectId: string;
      materials: MaterialToProcess[];
    }) => {
      if (!materials || materials.length === 0) {
        throw new Error("No materials found for this project. Please ensure treatments with fabrics are added.");
      }

      // Simply return the materials that need processing
      // The actual queue insertion happens in ProjectMaterialsTab
      const inStock: MaterialOrder[] = [];
      const outOfStock: MaterialOrder[] = [];

      for (const material of materials) {
        const quantityNeeded = material.quantityUsed;
        const availableQuantity = material.currentQuantity;

        if (quantityNeeded <= 0) continue;

        if (availableQuantity >= quantityNeeded) {
          inStock.push({
            type: 'allocated',
            material: material.itemName,
            quantity: quantityNeeded,
            status: 'in_stock',
            inventoryId: material.itemId
          });
        } else {
          outOfStock.push({
            type: 'needed',
            material: material.itemName,
            quantity: quantityNeeded - Math.max(0, availableQuantity),
            status: 'needs_purchase',
            inventoryId: material.itemId
          });
        }
      }

      return { 
        createdOrders: [...inStock, ...outOfStock], 
        totalOrders: inStock.length + outOfStock.length,
        inStockCount: inStock.length,
        outOfStockCount: outOfStock.length
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-materials-usage"] });
      queryClient.invalidateQueries({ queryKey: ["material-order-queue"] });
      
      // Don't show toast here - let ProjectMaterialsTab handle it after queue insertion
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process materials",
        variant: "destructive"
      });
    }
  });
};
