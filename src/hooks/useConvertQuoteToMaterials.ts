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

      const createdOrders: MaterialOrder[] = [];

      // Process each material
      for (const material of materials) {
        const quantityNeeded = material.quantityUsed;
        const availableQuantity = material.currentQuantity;

        if (quantityNeeded <= 0) continue;

        if (availableQuantity >= quantityNeeded) {
          // Allocate from inventory
          const { error: allocationError } = await supabase
            .from('project_material_allocations')
            .insert({
              project_id: projectId,
              inventory_item_id: material.itemId,
              allocated_quantity: quantityNeeded,
              used_quantity: 0,
              status: 'allocated'
            });

          if (!allocationError) {
            // Update inventory quantity
            await supabase
              .from('enhanced_inventory_items')
              .update({ quantity: availableQuantity - quantityNeeded })
              .eq('id', material.itemId);

            createdOrders.push({
              type: 'allocated',
              material: material.itemName,
              quantity: quantityNeeded,
              status: 'allocated',
              inventoryId: material.itemId
            });
          }
        } else {
          // Material needs to be ordered
          createdOrders.push({
            type: 'needed',
            material: material.itemName,
            quantity: quantityNeeded - availableQuantity,
            status: 'needs_purchase',
            inventoryId: material.itemId
          });
        }
      }

      return { createdOrders, totalOrders: createdOrders.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-materials-usage"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["project-material-allocations"] });
      
      const allocated = data.createdOrders.filter(o => o.type === 'allocated').length;
      const needed = data.createdOrders.filter(o => o.type === 'needed').length;
      
      toast({
        title: "Materials Processed",
        description: `${allocated} items allocated from inventory${needed > 0 ? `, ${needed} items need to be ordered` : ''}`,
      });
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
