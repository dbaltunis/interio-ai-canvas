import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBusinessSettings, type InventoryConfig } from "./useBusinessSettings";

interface InventoryUsageItem {
  inventory_item_id: string;
  quantity_used: number;
  item_name?: string;
}

interface ReverseInventoryParams {
  projectId: string;
  statusName: string;
  statusId: string;
  items: InventoryUsageItem[];
}

/**
 * Hook to handle inventory reversal when project status changes to configured reversal statuses
 * Adds inventory back to stock with proper transaction tracking and duplicate prevention
 */
export const useProjectInventoryReversal = () => {
  const queryClient = useQueryClient();
  const { data: businessSettings } = useBusinessSettings();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, statusName, statusId, items }: ReverseInventoryParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const inventoryConfig = businessSettings?.inventory_config as unknown as InventoryConfig;

      // Check if inventory tracking is enabled
      if (!inventoryConfig?.track_inventory) {
        console.log('Inventory tracking is disabled');
        toast({
          title: "Inventory Not Tracked",
          description: "Enable inventory tracking in Settings to automatically return materials",
          importance: 'normal'
        });
        return { reversed: false, reason: 'Inventory tracking is disabled' };
      }

      // Get reversal status IDs
      const reversalStatusIds = inventoryConfig.reversal_status_ids || [];

      // Check if this status ID is configured to trigger reversal
      if (!reversalStatusIds.includes(statusId)) {
        console.log(`Status "${statusName}" (ID: ${statusId}) is not configured to trigger inventory reversal`);
        return { reversed: false, reason: 'Status not configured for reversal' };
      }

      console.log(`✓ Status "${statusName}" is configured for reversal. Checking for previous deduction...`);

      // Check if inventory was previously deducted for this project
      const { data: deductionTransactions } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('reference_id', projectId)
        .eq('reference_type', 'project')
        .eq('transaction_type', 'project_usage')
        .order('created_at', { ascending: false });

      if (!deductionTransactions || deductionTransactions.length === 0) {
        console.log('No previous deduction found for this project - nothing to reverse');
        toast({
          title: "Nothing to Reverse",
          description: "No inventory was deducted from this project",
          importance: 'normal'
        });
        return { reversed: false, reason: 'No previous deduction found' };
      }

      // Check if reversal already occurred
      const { data: existingReversals } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('reference_id', projectId)
        .eq('reference_type', 'project')
        .eq('transaction_type', 'project_reversal');

      if (existingReversals && existingReversals.length > 0) {
        console.log('Inventory already reversed for this project');
        toast({
          title: "Already Reversed",
          description: "Inventory was already returned to stock for this project",
          importance: 'normal'
        });
        return { reversed: false, reason: 'Already reversed' };
      }

      console.log(`✓ Found ${deductionTransactions.length} previous deduction(s). Processing reversal...`);

      // Reverse inventory for each item based on original deduction amounts
      const reversedItems = [];
      for (const deduction of deductionTransactions) {
        const itemId = deduction.inventory_item_id;
        const originalQuantity = Math.abs(deduction.quantity); // Deductions are negative

        // Get current item quantity
        const { data: currentItem, error: fetchError } = await supabase
          .from('enhanced_inventory_items')
          .select('quantity')
          .eq('id', itemId)
          .single();

        if (fetchError) {
          console.error(`Error fetching item ${itemId}:`, fetchError);
          continue;
        }

        const newQuantity = (currentItem.quantity || 0) + originalQuantity;

        // Update inventory quantity
        const { error: updateError } = await supabase
          .from('enhanced_inventory_items')
          .update({ quantity: newQuantity })
          .eq('id', itemId);

        if (updateError) {
          console.error(`Error updating item ${itemId}:`, updateError);
          continue;
        }

        // Create reversal transaction record
        const { error: transactionError } = await supabase
          .from('inventory_transactions')
          .insert({
            user_id: user.id,
            inventory_item_id: itemId,
            transaction_type: 'project_reversal',
            quantity: originalQuantity, // Positive for reversal (adding back)
            reference_id: projectId,
            reference_type: 'project',
            notes: `Reversed from project ${projectId} - Status: ${statusName} (Original deduction: ${deduction.id})`,
          });

        if (transactionError) {
          console.error(`Error creating reversal transaction for item ${itemId}:`, transactionError);
          continue;
        }

        const itemName = items.find(i => i.inventory_item_id === itemId)?.item_name || 'Unknown';
        reversedItems.push({
          itemId,
          quantity: originalQuantity,
          name: itemName
        });

        console.log(`✓ Reversed ${originalQuantity} units of item ${itemId}`);
      }

      console.log(`✓ Successfully reversed ${reversedItems.length} items`);

      return {
        reversed: true,
        projectId,
        statusName,
        itemsReversed: reversedItems.length,
        details: reversedItems
      };
    },
    onSuccess: (result) => {
      if (result.reversed) {
        const materialNames = result.details?.map(d => d.name).join(', ') || '';
        toast({
          title: "Inventory Returned",
          description: `${result.itemsReversed} material(s) returned: ${materialNames}`,
          importance: 'important'
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['enhanced-inventory-items'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      }
    },
    onError: (error) => {
      console.error('Error reversing inventory:', error);
      toast({
        title: "Error",
        description: "Failed to return inventory to stock",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get project inventory items for reversal
 * Reuses the same logic from useProjectInventoryDeduction
 */
export const useProjectInventoryItemsForReversal = () => {
  return {
    getProjectItems: async (projectId: string): Promise<InventoryUsageItem[]> => {
      const { data: project } = await supabase
        .from('projects')
        .select(`
          id,
          quotes (
            id,
            quote_items (
              id,
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

      if (!project?.quotes || project.quotes.length === 0) {
        return [];
      }

      const items: InventoryUsageItem[] = [];
      for (const quote of project.quotes as any[]) {
        if (!quote.quote_items) continue;

        for (const item of quote.quote_items as any[]) {
          if (item.inventory_item_id && item.quantity) {
            items.push({
              inventory_item_id: item.inventory_item_id,
              quantity_used: item.quantity,
              item_name: item.enhanced_inventory_items?.[0]?.name || 'Unknown'
            });
          }
        }
      }

      return items;
    }
  };
};
