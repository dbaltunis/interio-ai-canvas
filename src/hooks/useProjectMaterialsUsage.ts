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
        const fabricDetails = (treatment.fabric_details as any) || {};
        
        console.log('[MATERIALS] Processing treatment:', {
          id: treatment.id,
          fabricDetails,
          calcDetails: Object.keys(calcDetails)
        });
        
        // FABRIC - Get from fabric_details.fabric_id or fabric_details.id
        const fabricId = fabricDetails.fabric_id || fabricDetails.id;
        if (fabricId) {
          const { data: fabricData } = await supabase
            .from('enhanced_inventory_items')
            .select('quantity, name, reorder_point, unit')
            .eq('id', fabricId)
            .maybeSingle();

          if (fabricData) {
            const quantity = fabricData.quantity || 0;
            const reorderPoint = fabricData.reorder_point || 0;
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            // Get fabric usage from calculation details
            const fabricMeters = calcDetails.fabricMeters || calcDetails.fabricUsage?.meters || 0;
            
            if (fabricData.name && fabricMeters > 0) {
              materials.push({
                itemId: fabricId,
                itemTable: 'enhanced_inventory_items',
                itemName: fabricData.name,
                quantityUsed: fabricMeters,
                unit: fabricData.unit || 'm',
                currentQuantity: quantity,
                costImpact: treatment.material_cost || 0,
                surfaceId: treatment.window_id || treatment.id,
                surfaceName: surfaceMap.get(treatment.window_id) || 'Treatment',
                lowStock: quantity < fabricMeters,
                isTracked
              });
            }
          }
        }

        // PRODUCTS - Extract from breakdown in calculation_details
        const breakdown = calcDetails.breakdown || [];
        for (const item of breakdown) {
          if (!item.name || !item.quantity) continue;
          
          // Try to match to inventory
          const { data: inventoryItem } = await supabase
            .from('enhanced_inventory_items')
            .select('id, quantity, name, unit, reorder_point')
            .ilike('name', `%${item.name}%`)
            .maybeSingle();

          if (inventoryItem) {
            const quantity = inventoryItem.quantity || 0;
            const reorderPoint = inventoryItem.reorder_point || 0;
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (isTracked) {
              materials.push({
                itemId: inventoryItem.id,
                itemTable: 'enhanced_inventory_items',
                itemName: inventoryItem.name,
                quantityUsed: item.quantity,
                unit: inventoryItem.unit || item.unit || 'unit',
                currentQuantity: quantity,
                costImpact: item.cost || 0,
                surfaceId: treatment.window_id || treatment.id,
                surfaceName: surfaceMap.get(treatment.window_id) || 'Treatment',
                lowStock: quantity < item.quantity,
                isTracked
              });
            }
          }
        }
      }

      return materials;
    }
  });
};
