import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeftoverItem {
  id: string;
  name: string;
  category: 'fabric' | 'hardware' | 'heading';
  quantity: number;
  unit: string;
  originalCost: number;
  proratedCost: number;
  originalQuantity: number;
  inventoryItemId?: string;
  roomName?: string;
  surfaceName?: string;
}

export const useProjectLeftovers = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-leftovers', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];

      // Fetch surfaces for the project
      const { data: surfaces, error: surfacesError } = await supabase
        .from('surfaces')
        .select('id, name, room_id')
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

      const leftovers: LeftoverItem[] = [];
      
      // Create surface lookup map
      const surfaceMap = new Map(surfaces.map(s => [s.id, s]));

      for (const summary of summaries) {
        const surface = surfaceMap.get(summary.window_id);
        const roomName = surface?.room_id ? 'Room' : undefined;
        
        // Parse JSON fields if they exist
        const fabricDetails = summary.fabric_details as any || {};
        const hardwareDetails = summary.hardware_details as any || {};
        const headingDetails = summary.heading_details as any || {};
        const measurementsDetails = summary.measurements_details as any || {};

        // Extract leftover fabric from measurements_details
        const leftoverWidthCm = measurementsDetails?.leftover_width_total_cm || 
                               measurementsDetails?.leftover_total_cm || 
                               measurementsDetails?.leftover_width_cm || 0;

        if (leftoverWidthCm > 10) { // Only track leftovers > 10cm (threshold)
          const fabricCost = summary.fabric_cost || 0;
          const totalMeters = summary.linear_meters || 0;
          const leftoverMeters = leftoverWidthCm / 100;
          
          if (totalMeters > 0 && leftoverMeters > 0.1) { // >10cm = 0.1m
            const proratedCost = (fabricCost / totalMeters) * leftoverMeters;
            
            leftovers.push({
              id: `fabric-${summary.window_id}`,
              name: `Remnant - ${fabricDetails.name || summary.template_name || 'Fabric'}`,
              category: 'fabric',
              quantity: leftoverMeters,
              unit: 'm',
              originalCost: fabricDetails.cost_price || fabricDetails.unit_price || 0,
              proratedCost: proratedCost,
              originalQuantity: totalMeters,
              inventoryItemId: fabricDetails.id || summary.selected_fabric_id,
              roomName: roomName,
              surfaceName: surface?.name
            });
          }
        }

        // Extract leftover track/hardware (if ordered length > used length)
        const trackWidthCm = summary.rail_width || summary.drop || 0;
        const hardwareCost = summary.hardware_cost || 0;
        
        if (trackWidthCm > 0 && hardwareCost > 0) {
          const orderedLength = hardwareDetails.ordered_length || trackWidthCm;
          const usedLength = trackWidthCm;
          const leftoverTrackCm = orderedLength - usedLength;
          
          if (leftoverTrackCm > 50) { // Only track track leftovers > 50cm
            const leftoverTrackM = leftoverTrackCm / 100;
            const trackCostPerCm = hardwareCost / orderedLength;
            const proratedCost = trackCostPerCm * leftoverTrackCm;
            
            leftovers.push({
              id: `hardware-${summary.window_id}`,
              name: `Remnant - ${hardwareDetails.name || 'Track/Rod'}`,
              category: 'hardware',
              quantity: leftoverTrackM,
              unit: 'm',
              originalCost: hardwareDetails.cost_price || hardwareDetails.unit_price || 0,
              proratedCost: proratedCost,
              originalQuantity: orderedLength / 100,
              inventoryItemId: hardwareDetails.id || summary.selected_hardware_id,
              roomName: roomName,
              surfaceName: surface?.name
            });
          }
        }

        // Extract leftover heading tape
        const headingCost = summary.heading_cost || 0;
        const widthsRequired = summary.widths_required || 0;
        const fabricWidth = (fabricDetails.width || 137); // Default fabric width 137cm
        const finishedWidthCm = widthsRequired * fabricWidth;
        
        if (headingCost > 0 && finishedWidthCm > 0) {
          // Assume we order slightly more than needed
          const orderedHeadingCm = finishedWidthCm * 1.05; // 5% extra
          const leftoverHeadingCm = orderedHeadingCm - finishedWidthCm;
          
          if (leftoverHeadingCm > 50) { // Only track heading leftovers > 50cm
            const leftoverHeadingM = leftoverHeadingCm / 100;
            const headingCostPerCm = headingCost / orderedHeadingCm;
            const proratedCost = headingCostPerCm * leftoverHeadingCm;
            
            leftovers.push({
              id: `heading-${summary.window_id}`,
              name: `Remnant - ${headingDetails.heading_name || headingDetails.name || 'Heading Tape'}`,
              category: 'heading',
              quantity: leftoverHeadingM,
              unit: 'm',
              originalCost: headingDetails.cost || headingDetails.price_per_metre || 0,
              proratedCost: proratedCost,
              originalQuantity: orderedHeadingCm / 100,
              inventoryItemId: headingDetails.id || summary.selected_heading_id,
              roomName: roomName,
              surfaceName: surface?.name
            });
          }
        }
      }

      return leftovers;
    }
  });
};
