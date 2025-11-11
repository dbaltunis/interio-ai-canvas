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

      console.log('[MATERIALS] Fetching materials for project:', projectId);

      const materials: MaterialUsage[] = [];

      // Fetch from windows_summary (new system)
      const { data: surfaces } = await supabase
        .from('surfaces')
        .select('id, name')
        .eq('project_id', projectId);

      const surfaceIds = surfaces?.map(s => s.id) || [];
      
      if (surfaceIds.length > 0) {
        const { data: windowSummaries, error: summariesError } = await supabase
          .from('windows_summary')
          .select('*')
          .in('window_id', surfaceIds);

        if (summariesError) {
          console.error('[MATERIALS] Error fetching window summaries:', summariesError);
        } else if (windowSummaries && windowSummaries.length > 0) {
          console.log('[MATERIALS] Found window summaries:', windowSummaries.length);
          
          const surfaceMap = new Map(surfaces?.map(s => [s.id, s.name]) || []);

          for (const summary of windowSummaries) {
            const fabricDetails = summary.fabric_details as any;
            const liningDetails = summary.lining_details as any;
            const headingDetails = summary.heading_details as any;

            // Add fabric
            if (summary.selected_fabric_id && fabricDetails?.name) {
              materials.push({
                itemId: summary.selected_fabric_id,
                itemTable: 'enhanced_inventory_items',
                itemName: fabricDetails.name,
                quantityUsed: summary.linear_meters || 0,
                unit: 'm',
                currentQuantity: 0,
                costImpact: summary.fabric_cost || 0,
                surfaceId: summary.window_id,
                surfaceName: surfaceMap.get(summary.window_id) || 'Window',
                lowStock: false,
                isTracked: true
              });
            }

            // Add lining if present
            if (liningDetails?.id && liningDetails?.name && summary.lining_cost > 0) {
              materials.push({
                itemId: liningDetails.id,
                itemTable: 'enhanced_inventory_items',
                itemName: liningDetails.name,
                quantityUsed: summary.linear_meters || 0,
                unit: 'm',
                currentQuantity: 0,
                costImpact: summary.lining_cost || 0,
                surfaceId: summary.window_id,
                surfaceName: surfaceMap.get(summary.window_id) || 'Window',
                lowStock: false,
                isTracked: true
              });
            }

            // Add heading if present
            if (headingDetails?.id && headingDetails?.heading_name) {
              const railWidth = summary.rail_width || 0;
              const fullnessRatio = 2;
              const headingLength = (railWidth / 100) * fullnessRatio;

              materials.push({
                itemId: headingDetails.id,
                itemTable: 'enhanced_inventory_items',
                itemName: `${headingDetails.heading_name} (Heading)`,
                quantityUsed: headingLength,
                unit: 'm',
                currentQuantity: 0,
                costImpact: summary.heading_cost || 0,
                surfaceId: summary.window_id,
                surfaceName: surfaceMap.get(summary.window_id) || 'Window',
                lowStock: false,
                isTracked: true
              });
            }
          }
        }
      }

      // Also fetch from treatments table (old system)
      const { data: treatments, error: treatmentsError } = await supabase
        .from('treatments')
        .select('*')
        .eq('project_id', projectId);

      if (treatmentsError) {
        console.error('[MATERIALS] Error fetching treatments:', treatmentsError);
      } else if (treatments && treatments.length > 0) {
        console.log('[MATERIALS] Found treatments:', treatments.length);
        
        // Get surface names for display
        const windowIds = [...new Set(treatments.map((t: any) => t.window_id).filter(Boolean))];
        const { data: treatmentSurfaces } = await supabase
          .from('surfaces')
          .select('id, name')
          .in('id', windowIds);
        
        const surfaceMap = new Map(treatmentSurfaces?.map(s => [s.id, s.name]) || []);

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
        
        // Extract heading tape data from treatment configuration
        const treatmentConfig = (treatment as any).treatment_configuration || {};
        if (treatmentConfig.heading_id) {
          const { data: headingItem } = await supabase
            .from('enhanced_inventory_items')
            .select('*')
            .eq('id', treatmentConfig.heading_id)
            .single();

          if (headingItem) {
            const windowWidth = calcDetails.dimensions?.width || 0;
            const fullnessRatio = headingItem.fullness_ratio || 2;
            const headingLength = (windowWidth * fullnessRatio) + 0.2;

            materials.push({
              itemId: headingItem.id,
              itemTable: 'enhanced_inventory_items',
              itemName: `${headingItem.name} (Heading)`,
              quantityUsed: headingLength,
              unit: 'm',
              currentQuantity: headingItem.quantity || 0,
              costImpact: headingLength * (headingItem.cost_price || 0),
              surfaceId: treatment.window_id || treatment.id,
              surfaceName: surfaceMap.get(treatment.window_id) || treatment.product_name || 'Treatment',
              lowStock: (headingItem.quantity || 0) < headingLength,
              isTracked: (headingItem.quantity || 0) > 0
            });
          }
        }
        }
      }

      console.log('[MATERIALS] Total materials found:', materials.length);
      return materials;
    }
  });
};
