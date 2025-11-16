import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InventoryUsageItem {
  inventory_item_id: string;
  quantity_used: number;
  item_name?: string;
}

interface DeductInventoryParams {
  projectId: string;
  statusName: string;
  items: InventoryUsageItem[];
}

/**
 * Hook to handle automatic inventory deduction when project status changes
 * Deducts inventory quantities and logs transactions
 */
export const useProjectInventoryDeduction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, statusName, items }: DeductInventoryParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check business settings for which statuses trigger deduction
      const { data: settings } = await supabase
        .from('business_settings')
        .select('inventory_config')
        .eq('user_id', user.id)
        .single();

      const inventoryConfig = (settings?.inventory_config && typeof settings.inventory_config === 'object') 
        ? settings.inventory_config as Record<string, any>
        : {};
        
      const deductionStatuses = (inventoryConfig.deduction_statuses as string[]) || ['order', 'ordered', 'confirmed', 'in production'];
      
      // Check if this status should trigger deduction
      const shouldDeduct = deductionStatuses.some((s: string) => 
        statusName.toLowerCase().includes(s.toLowerCase())
      );

      if (!shouldDeduct) {
        console.log(`Status "${statusName}" does not trigger inventory deduction`);
        return { deducted: false, reason: 'Status not configured for deduction' };
      }

      // Check if inventory has already been deducted for this project
      const { data: existingDeductions } = await supabase
        .from('inventory_transactions')
        .select('id')
        .eq('reference_id', projectId)
        .eq('reference_type', 'project')
        .eq('transaction_type', 'project_usage')
        .limit(1);

      if (existingDeductions && existingDeductions.length > 0) {
        console.log(`Inventory already deducted for project ${projectId}`);
        return { deducted: false, reason: 'Already deducted' };
      }

      const deductionResults = [];
      const errors = [];

      // Deduct each item
      for (const item of items) {
        try {
          // Get current quantity
          const { data: inventoryItem, error: fetchError } = await supabase
            .from('enhanced_inventory_items')
            .select('quantity, name')
            .eq('id', item.inventory_item_id)
            .single();

          if (fetchError) throw fetchError;

          const currentQuantity = inventoryItem?.quantity || 0;
          const newQuantity = Math.max(0, currentQuantity - item.quantity_used);

          // Update inventory quantity
          const { error: updateError } = await supabase
            .from('enhanced_inventory_items')
            .update({ 
              quantity: newQuantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.inventory_item_id);

          if (updateError) throw updateError;

          // Create transaction record
          const { error: transactionError } = await supabase
            .from('inventory_transactions')
            .insert({
              user_id: user.id,
              inventory_item_id: item.inventory_item_id,
              transaction_type: 'project_usage',
              quantity: -item.quantity_used, // Negative for deduction
              reference_id: projectId,
              reference_type: 'project',
              notes: `Used in project - Status: ${statusName}`,
            });

          if (transactionError) throw transactionError;

          deductionResults.push({
            item_id: item.inventory_item_id,
            item_name: item.item_name || inventoryItem?.name,
            quantity_deducted: item.quantity_used,
            new_quantity: newQuantity,
            success: true
          });

        } catch (error: any) {
          console.error(`Error deducting inventory for item ${item.inventory_item_id}:`, error);
          errors.push({
            item_id: item.inventory_item_id,
            item_name: item.item_name,
            error: error.message
          });
        }
      }

      return {
        deducted: true,
        results: deductionResults,
        errors,
        projectId,
        statusName
      };
    },
    onSuccess: (data) => {
      if (data.deducted && data.results && data.results.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.invalidateQueries({ queryKey: ["enhanced_inventory"] });
        queryClient.invalidateQueries({ queryKey: ["inventory_transactions"] });
        
        toast({
          title: "Inventory Updated",
          description: `${data.results.length} item(s) deducted from inventory for project`,
        });

        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Some Items Failed",
            description: `${data.errors.length} item(s) could not be deducted`,
            variant: "destructive"
          });
        }
      }
    },
    onError: (error: any) => {
      console.error('Inventory deduction error:', error);
      toast({
        title: "Inventory Deduction Failed",
        description: error.message || "Could not update inventory quantities",
        variant: "destructive"
      });
    }
  });
};

/**
 * Hook to get project's inventory items for deduction
 */
export const useProjectInventoryItems = () => {
  const getProjectItems = async (projectId: string): Promise<InventoryUsageItem[]> => {
    if (!projectId) return [];

    // Get quote items from the project's quote
    const { data: project } = await supabase
      .from('projects')
      .select(`
        id,
        quotes (
          id,
          quote_items (
            inventory_item_id,
            quantity,
            enhanced_inventory_items (
              id,
              name
            )
          )
        )
      `)
      .eq('id', projectId)
      .single();

    if (!project || !project.quotes) return [];

    const items: InventoryUsageItem[] = [];
    
    for (const quote of project.quotes as any[]) {
      if (quote.quote_items) {
        for (const item of quote.quote_items) {
          if (item.inventory_item_id && item.quantity) {
            items.push({
              inventory_item_id: item.inventory_item_id,
              quantity_used: item.quantity,
              item_name: item.enhanced_inventory_items?.name
            });
          }
        }
      }
    }

    return items;
  };

  return { getProjectItems };
};
