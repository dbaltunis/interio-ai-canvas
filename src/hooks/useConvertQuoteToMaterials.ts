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

export const useConvertQuoteToMaterials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      // Get project treatments
      const { data: treatments, error: treatmentsError } = await supabase
        .from('treatments')
        .select('*, calculation_details')
        .eq('project_id', projectId);

      if (treatmentsError) throw treatmentsError;
      if (!treatments || treatments.length === 0) {
        throw new Error("No treatments found for this project");
      }

      const createdOrders: MaterialOrder[] = [];

      // Process each treatment's calculation details for materials
      for (const treatment of treatments) {
        const calcDetails = (treatment.calculation_details as any) || {};
        const breakdown = calcDetails.breakdown || [];

        for (const item of breakdown) {
          if (!item.name || !item.quantity) continue;

          // Try to find matching inventory item
          const { data: inventoryItem } = await supabase
            .from('enhanced_inventory_items')
            .select('id, quantity, name, unit, cost_price')
            .ilike('name', `%${item.name}%`)
            .maybeSingle();

          if (inventoryItem && inventoryItem.quantity >= item.quantity) {
            // Allocate from inventory
            const { error: allocationError } = await supabase
              .from('project_material_allocations')
              .insert({
                project_id: projectId,
                inventory_item_id: inventoryItem.id,
                allocated_quantity: item.quantity,
                used_quantity: 0,
                status: 'allocated'
              });

            if (!allocationError) {
              // Update inventory quantity
              await supabase
                .from('enhanced_inventory_items')
                .update({ quantity: inventoryItem.quantity - item.quantity })
                .eq('id', inventoryItem.id);

              createdOrders.push({
                type: 'allocated',
                material: item.name,
                quantity: item.quantity,
                status: 'allocated',
                inventoryId: inventoryItem.id
              });
            }
          } else {
            // Material needs to be ordered
            createdOrders.push({
              type: 'needed',
              material: item.name,
              quantity: item.quantity,
              status: 'needs_purchase',
              inventoryId: inventoryItem?.id
            });
          }
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
