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

      // Fetch surfaces for the project
      const { data: surfaces, error: surfacesError } = await supabase
        .from('surfaces')
        .select('id, name')
        .eq('project_id', projectId);

      if (surfacesError) throw surfacesError;
      
      const surfaceIds = (surfaces || []).map(s => s.id);
      if (surfaceIds.length === 0) return [];

      // Fetch window summaries for those surfaces
      const { data: summaries, error } = await supabase
        .from('windows_summary')
        .select('*')
        .in('window_id', surfaceIds);

      if (error) throw error;
      if (!summaries || summaries.length === 0) return [];

      const materials: MaterialUsage[] = [];
      
      // Create surface lookup map
      const surfaceMap = new Map(surfaces.map(s => [s.id, s]));

      for (const summary of summaries) {
        const surface = surfaceMap.get(summary.window_id);
        
        // Parse JSON fields
        const fabricDetails = summary.fabric_details as any || {};
        const hardwareDetails = summary.hardware_details as any || {};
        const headingDetails = summary.heading_details as any || {};

        // FABRIC - Calculate actual usage
        const fabricId = fabricDetails.id || summary.selected_fabric_id;
        if (fabricId && summary.linear_meters > 0) {
          // Fetch current fabric inventory from enhanced_inventory_items
          const { data: fabricData } = await supabase
            .from('enhanced_inventory_items')
            .select('quantity, name, reorder_point, unit')
            .eq('id', fabricId)
            .maybeSingle();

          if (fabricData) {
            const quantity = fabricData.quantity || 0;
            const reorderPoint = fabricData.reorder_point || 0;
            
            // Only include if item is being tracked (quantity > 0 OR reorder_point > 0)
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (fabricData.name && isTracked) {
              const usedMeters = summary.linear_meters || 0;
              
              materials.push({
                itemId: fabricId,
                itemTable: 'enhanced_inventory_items',
                itemName: fabricData.name || fabricDetails.name || 'Fabric',
                quantityUsed: usedMeters,
                unit: fabricData.unit || 'm',
                currentQuantity: quantity,
                costImpact: summary.fabric_cost || 0,
                surfaceId: summary.window_id,
                surfaceName: surface?.name,
                lowStock: quantity < usedMeters,
                isTracked: true
              });
            }
          }
        }

        // HARDWARE - Calculate actual usage
        const hardwareId = hardwareDetails.id || summary.selected_hardware_id;
        if (hardwareId) {
          const { data: hardwareData } = await supabase
            .from('enhanced_inventory_items')
            .select('quantity, name, unit, reorder_point')
            .eq('id', hardwareId)
            .maybeSingle();

          if (hardwareData) {
            const quantity = hardwareData.quantity || 0;
            const reorderPoint = hardwareData.reorder_point || 0;
            
            // Only include if item is being tracked (quantity > 0 OR reorder_point > 0)
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (hardwareData.name && isTracked) {
              const trackWidthCm = summary.rail_width || summary.drop || 0;
              const usedMeters = trackWidthCm / 100;
              
              if (usedMeters > 0) {
                materials.push({
                  itemId: hardwareId,
                  itemTable: 'enhanced_inventory_items',
                  itemName: hardwareData.name || hardwareDetails.name || 'Hardware',
                  quantityUsed: usedMeters,
                  unit: hardwareData.unit || 'm',
                  currentQuantity: quantity,
                  costImpact: summary.hardware_cost || 0,
                  surfaceId: summary.window_id,
                  surfaceName: surface?.name,
                  lowStock: quantity < usedMeters,
                  isTracked: true
                });
              }
            }
          }
        }

        // HEADING - Calculate actual usage
        const headingId = headingDetails.id || summary.selected_heading_id;
        if (headingId) {
          const { data: headingData } = await supabase
            .from('enhanced_inventory_items')
            .select('quantity, name, unit, reorder_point')
            .eq('id', headingId)
            .maybeSingle();

          if (headingData) {
            const quantity = headingData.quantity || 0;
            const reorderPoint = headingData.reorder_point || 0;
            
            // Only include if item is being tracked (quantity > 0 OR reorder_point > 0)
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (headingData.name && isTracked) {
              const widthsRequired = summary.widths_required || 0;
              const fabricWidth = fabricDetails.width || 137;
              const finishedWidthCm = widthsRequired * fabricWidth;
              const usedMeters = finishedWidthCm / 100;
              
              if (usedMeters > 0) {
                materials.push({
                  itemId: headingId,
                  itemTable: 'enhanced_inventory_items',
                  itemName: headingData.name || headingDetails.heading_name || 'Heading',
                  quantityUsed: usedMeters,
                  unit: headingData.unit || 'm',
                  currentQuantity: quantity,
                  costImpact: summary.heading_cost || 0,
                  surfaceId: summary.window_id,
                  surfaceName: surface?.name,
                  lowStock: quantity < usedMeters,
                  isTracked: true
                });
              }
            }
          }
        }
      }

      return materials;
    }
  });
};
