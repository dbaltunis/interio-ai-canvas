import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
          // Fetch current fabric inventory
          const { data: fabricData } = await supabase
            .from('fabrics' as any)
            .select('quantity, name, reorder_point')
            .eq('id', fabricId)
            .single();

          if (fabricData) {
            const name = (fabricData as any).name;
            const quantity = (fabricData as any).quantity || 0;
            const reorderPoint = (fabricData as any).reorder_point || 0;
            
            // Only include if item is being tracked (quantity > 0 OR reorder_point > 0)
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (name && isTracked) {
              const usedMeters = summary.linear_meters || 0;
              
              materials.push({
                itemId: fabricId,
                itemTable: 'fabrics',
                itemName: name || fabricDetails.name || 'Fabric',
                quantityUsed: usedMeters,
                unit: 'm',
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
            .from('hardware_inventory' as any)
            .select('quantity, name, unit, reorder_point')
            .eq('id', hardwareId)
            .single();

          if (hardwareData) {
            const name = (hardwareData as any).name;
            const quantity = (hardwareData as any).quantity || 0;
            const unit = (hardwareData as any).unit;
            const reorderPoint = (hardwareData as any).reorder_point || 0;
            
            // Only include if item is being tracked (quantity > 0 OR reorder_point > 0)
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (name && isTracked) {
              const trackWidthCm = summary.rail_width || summary.drop || 0;
              const usedMeters = trackWidthCm / 100;
              
              if (usedMeters > 0) {
                materials.push({
                  itemId: hardwareId,
                  itemTable: 'hardware_inventory',
                  itemName: name || hardwareDetails.name || 'Hardware',
                  quantityUsed: usedMeters,
                  unit: unit || 'm',
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
            .from('heading_inventory' as any)
            .select('quantity, name, unit, reorder_point')
            .eq('id', headingId)
            .single();

          if (headingData) {
            const name = (headingData as any).name;
            const quantity = (headingData as any).quantity || 0;
            const unit = (headingData as any).unit;
            const reorderPoint = (headingData as any).reorder_point || 0;
            
            // Only include if item is being tracked (quantity > 0 OR reorder_point > 0)
            const isTracked = quantity > 0 || reorderPoint > 0;
            
            if (name && isTracked) {
              const widthsRequired = summary.widths_required || 0;
              const fabricWidth = fabricDetails.width || 137;
              const finishedWidthCm = widthsRequired * fabricWidth;
              const usedMeters = finishedWidthCm / 100;
              
              if (usedMeters > 0) {
                materials.push({
                  itemId: headingId,
                  itemTable: 'heading_inventory',
                  itemName: name || headingDetails.heading_name || 'Heading',
                  quantityUsed: usedMeters,
                  unit: unit || 'm',
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
