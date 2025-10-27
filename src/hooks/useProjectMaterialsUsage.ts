import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaterialUsage {
  itemId: string;
  itemTable: 'enhanced_inventory_items';
  itemName: string;
  quantityUsed: number;
  unit: string;
  currentQuantity: number;
  costImpact: number;
  surfaceId: string;
  surfaceName?: string;
  lowStock: boolean;
  isTracked: boolean;
}

export const useProjectMaterialsUsage = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-materials-usage', projectId],
    enabled: !!projectId,
    staleTime: 0, // Always fetch fresh data
    queryFn: async () => {
      if (!projectId) return [];

      console.log('[MATERIALS] Fetching treatments for project:', projectId);

      // Fetch treatments for the project
      const { data: treatments, error: treatmentsError } = await supabase
        .from('treatments')
        .select('*')
        .eq('project_id', projectId);

      if (treatmentsError) {
        console.error('[MATERIALS] Error fetching treatments:', treatmentsError);
        throw treatmentsError;
      }
      
      console.log('[MATERIALS] Found treatments:', treatments?.length || 0);
      
      if (!treatments || treatments.length === 0) {
        console.warn('[MATERIALS] No treatments found - user needs to save treatments with fabrics');
        return [];
      }

      const materials: MaterialUsage[] = [];
      
      // Get surface names for display
      const windowIds = [...new Set(treatments.map((t: any) => t.window_id).filter(Boolean))];
      const { data: surfaces } = await supabase
        .from('surfaces')
        .select('id, name')
        .in('id', windowIds);
      
      const surfaceMap = new Map(surfaces?.map(s => [s.id, s.name]) || []);

      for (const treatment of treatments) {
        const calcDetails = (treatment.calculation_details as any) || {};
        const breakdown = calcDetails.breakdown || [];
        
        console.log('[MATERIALS] Processing treatment:', {
          id: treatment.id,
          treatmentName: treatment.product_name,
          breakdownCount: breakdown.length
        });
        
        // Process each item in the enhanced breakdown
        for (const item of breakdown) {
          if (!item.itemId || !item.itemTable || !item.quantity) {
            console.warn('[MATERIALS] Skipping item with missing data:', item);
            continue;
          }
          
          // Fetch current inventory data using the stored itemId
          const { data: inventoryData, error: inventoryError } = await supabase
            .from(item.itemTable)
            .select('quantity, name, reorder_point, unit')
            .eq('id', item.itemId)
            .maybeSingle();

          if (inventoryError || !inventoryData) {
            if (inventoryError) {
              console.error('[MATERIALS] Error fetching inventory item:', inventoryError);
            }
            continue;
          }

          if (item.quantity > 0 && 'name' in inventoryData) {
            const quantity = (inventoryData as any).quantity || 0;
            const reorderPoint = (inventoryData as any).reorder_point || 0;
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            materials.push({
              itemId: item.itemId,
              itemTable: item.itemTable as 'enhanced_inventory_items',
              itemName: (inventoryData as any).name,
              quantityUsed: item.quantity,
              unit: (inventoryData as any).unit || item.unit || 'unit',
              currentQuantity: quantity,
              costImpact: item.total_cost || 0,
              surfaceId: treatment.window_id || treatment.id,
              surfaceName: surfaceMap.get(treatment.window_id) || treatment.product_name || 'Treatment',
              lowStock: quantity < item.quantity,
              isTracked
            });
            
            console.log('[MATERIALS] Added material:', {
              name: (inventoryData as any).name,
              category: item.category,
              quantityUsed: item.quantity,
              currentStock: quantity
            });
          }
        }
      }

      return materials;
    }
  });
};
