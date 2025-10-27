import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface MaterialUsage {
  itemId: string;
  itemTable: 'fabrics' | 'hardware_inventory' | 'heading_inventory' | 'enhanced_inventory_items';
  itemName: string;
  quantityUsed: number;
  unit: string;
  currentQuantity: number;
  costImpact: number;
  surfaceId: string;
  surfaceName?: string;
  isTracked: boolean;
}

interface DeductionParams {
  projectId: string;
  projectName: string;
  materials: MaterialUsage[];
}

export const useInventoryDeduction = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, projectName, materials }: DeductionParams) => {
      const results = [];
      
      // Safety check: only process tracked items
      const trackedMaterials = materials.filter(m => m.isTracked);
      
      for (const material of trackedMaterials) {
        // Calculate new quantity
        const newQuantity = material.currentQuantity - material.quantityUsed;
        
        // Update inventory quantity in the appropriate table
        const { error: updateError } = await supabase
          .from(material.itemTable as any)
          .update({ quantity: newQuantity })
          .eq('id', material.itemId);

        if (updateError) throw updateError;

        // Log the movement
        const { data: userData } = await supabase.auth.getUser();
        const { error: logError } = await supabase
          .from('inventory_movements' as any)
          .insert({
            user_id: userData.user?.id,
            inventory_id: material.itemId,
            item_table: material.itemTable,
            item_name: material.itemName,
            movement_type: 'deduction',
            quantity_before: material.currentQuantity,
            quantity_change: -material.quantityUsed,
            quantity_after: newQuantity,
            unit: material.unit,
            project_id: projectId,
            surface_id: material.surfaceId,
            reason: `Auto-deducted from project: ${projectName}`,
            cost_impact: -material.costImpact,
            notes: `Surface: ${material.surfaceName || 'Unknown'}`,
            metadata: {
              project_name: projectName,
              surface_name: material.surfaceName,
              auto_deducted: true
            },
            created_by: userData.user?.id
          });

        if (logError) throw logError;
        
        results.push({ itemId: material.itemId, success: true });
      }

      return results;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Inventory Updated",
        description: `Successfully deducted ${variables.materials.length} material${variables.materials.length !== 1 ? 's' : ''} from inventory`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['hardware-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['heading-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
    onError: (error) => {
      console.error('Inventory deduction error:', error);
      toast({
        title: "Deduction Failed",
        description: "Failed to update inventory. Please try again or update manually.",
        variant: "destructive",
      });
    },
  });
};
