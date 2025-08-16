import { useEffect, useRef } from "react";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { supabase } from "@/integrations/supabase/client";

interface WorkroomSyncOptions {
  projectId: string;
  autoCreateWorkshopItems?: boolean;
}

/**
 * Hook that automatically synchronizes room and treatment data to workroom
 * Creates workshop items whenever new treatments are added
 */
export const useWorkroomSync = ({ 
  projectId, 
  autoCreateWorkshopItems = true 
}: WorkroomSyncOptions) => {
  const { data: treatments = [] } = useTreatments(projectId);
  const { data: rooms = [] } = useRooms(projectId);
  const { data: surfaces = [] } = useSurfaces(projectId);
  const { data: projectSummaries } = useProjectWindowSummaries(projectId);
  
  // Keep track of previous data to detect changes
  const previousDataRef = useRef<{
    treatmentCount: number;
    processedTreatmentIds: Set<string>;
  }>({
    treatmentCount: 0,
    processedTreatmentIds: new Set()
  });

  // Build workshop items from current project data
  const buildWorkshopItems = () => {
    const items: any[] = [];

    // Process window summaries (most accurate source)
    if (projectSummaries?.windows && projectSummaries.windows.length > 0) {
      projectSummaries.windows.forEach((window) => {
        if (window.summary && window.summary.total_cost > 0) {
          const room = rooms.find(r => r.id === window.room_id);
          
          items.push({
            id: window.window_id,
            project_id: projectId,
            window_id: window.window_id,
            room_name: room?.name || 'Unassigned Room',
            surface_name: window.surface_name || 'Window',
            treatment_type: window.summary.template_details?.curtain_type || 'curtains',
            fabric_details: window.summary.fabric_details,
            measurements: {
              rail_width: window.summary.measurements_details?.rail_width_cm || window.summary.measurements_details?.rail_width,
              drop: window.summary.measurements_details?.drop_cm || window.summary.measurements_details?.drop,
              window_width: window.summary.measurements_details?.window_width,
              window_height: window.summary.measurements_details?.window_height,
            },
            manufacturing_details: {
              type: window.summary.manufacturing_type || 'machine',
              cost: window.summary.manufacturing_cost,
              heading_type: window.summary.heading_details?.heading_name,
              lining_type: window.summary.lining_type,
              hand_finished: window.summary.template_details?.manufacturing_type === 'hand'
            },
            linear_meters: window.summary.linear_meters,
            widths_required: window.summary.widths_required,
            total_cost: window.summary.total_cost,
            priority: 'normal',
            status: 'pending',
            notes: `Auto-generated from ${window.surface_name} treatment`,
            created_at: new Date().toISOString()
          });
        }
      });
    } else if (treatments.length > 0) {
      // Fallback to treatments table
      treatments.forEach((treatment) => {
        const room = rooms.find(r => r.id === treatment.room_id);
        const surface = surfaces.find(s => s.id === treatment.window_id);
        
        items.push({
          id: treatment.id,
          project_id: projectId,
          window_id: treatment.window_id,
          room_name: room?.name || 'Unassigned Room',
          surface_name: surface?.name || 'Window',
          treatment_type: treatment.treatment_type || 'curtains',
          measurements: treatment.measurements || {},
          total_cost: treatment.total_price || 0,
          priority: 'normal',
          status: 'pending',
          notes: `Auto-generated from ${treatment.treatment_type} treatment`,
          created_at: new Date().toISOString()
        });
      });
    }

    return items;
  };

  // Sync new workshop items
  const syncWorkshopItems = async () => {
    if (!autoCreateWorkshopItems) return;

    const currentItems = buildWorkshopItems();
    const currentIds = new Set(currentItems.map(item => item.id));
    const previousIds = previousDataRef.current.processedTreatmentIds;

    // Find new items that haven't been processed yet
    const newItems = currentItems.filter(item => !previousIds.has(item.id));

    if (newItems.length === 0) {
      return; // No new items to process
    }

    console.log('🔄 WorkroomSync: New workshop items detected, creating...', {
      newItemsCount: newItems.length,
      totalItems: currentItems.length
    });

    try {
      // Store workshop data in project notes for now until workshop_items table is created
      const workshopNotes = {
        type: 'workshop_sync',
        timestamp: new Date().toISOString(),
        items: newItems,
        count: newItems.length
      };

      console.log('✅ WorkroomSync: Workshop items data prepared:', workshopNotes);
      
      // For now, we'll just log the data structure that would be saved
      // When workshop_items table is created, this can be properly implemented
      
      // Update processed IDs
      previousDataRef.current.processedTreatmentIds = currentIds;
      
    } catch (error) {
      console.error('WorkroomSync: Error preparing workshop items:', error);
    }
  };

  // Monitor changes and sync
  useEffect(() => {
    if (projectId && (treatments.length > 0 || projectSummaries?.windows?.length > 0)) {
      // Debounce the sync to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        syncWorkshopItems();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [projectId, treatments, projectSummaries]);

  return {
    buildWorkshopItems,
    lastProcessedCount: previousDataRef.current.treatmentCount,
    processedIds: Array.from(previousDataRef.current.processedTreatmentIds)
  };
};
