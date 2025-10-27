import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaterialOrder {
  type: 'deduction' | 'purchase_order';
  material: string;
  quantity: number;
  status: string;
}

export const useConvertQuoteToMaterials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId }: { projectId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
                type: 'deduction',
                material: item.name,
                quantity: item.quantity,
                status: 'allocated'
              });
            }
          } else {
            // Create purchase order item
            const { data: po, error: poError } = await supabase
              .from('purchase_orders')
              .insert({
                user_id: user.id,
                order_number: `PO-${Date.now()}`,
                status: 'pending',
                order_date: new Date().toISOString(),
                total_amount: item.total_cost || 0,
                notes: `Materials for ${treatment.treatment_type} in project`
              })
              .select()
              .single();

            if (!poError && po) {
              await supabase
                .from('purchase_order_items')
                .insert({
                  purchase_order_id: po.id,
                  inventory_item_id: inventoryItem?.id,
                  quantity: item.quantity,
                  unit_price: item.unit_price || 0,
                  total_price: item.total_cost || 0
                });

              createdOrders.push({
                type: 'purchase_order',
                material: item.name,
                quantity: item.quantity,
                status: 'pending'
              });
            }
          }
        }
      }

      return { createdOrders, totalOrders: createdOrders.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-materials-usage"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["project-material-allocations"] });
      
      const deductions = data.createdOrders.filter(o => o.type === 'deduction').length;
      const orders = data.createdOrders.filter(o => o.type === 'purchase_order').length;
      
      toast({
        title: "Materials Processed",
        description: `${deductions} items allocated from inventory, ${orders} purchase orders created`,
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
