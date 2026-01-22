/**
 * Workshop Item Sync Hook
 * 
 * CRITICAL: This hook ensures workshop_items stay in sync with windows_summary
 * for accurate shared work orders.
 * 
 * The sync uses UPSERT to always update existing records, ensuring shared
 * work orders reflect the latest measurements, fabric, and manufacturing details.
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WindowSummaryData {
  window_id: string;
  project_id?: string;
  room_id?: string;
  surface_name?: string;
  template_name?: string;
  treatment_type?: string;
  fabric_details?: {
    id?: string;
    name?: string;
    fabric_width?: number;
    selling_price?: number;
    image_url?: string;
    color?: string;
    pattern_repeat?: number;
  };
  rail_width?: number;
  drop?: number;
  measurements_details?: Record<string, any>;
  selected_heading_id?: string;
  heading_details?: {
    heading_name?: string;
    fullness_ratio?: number;
  };
  template_details?: {
    treatment_category?: string;
    fullness_ratio?: number;
    header_allowance?: number;
    bottom_hem?: number;
    side_hems?: number;
    seam_hems?: number;
    manufacturing_type?: string;
    return_left?: number;
    return_right?: number;
  };
  lining_type?: string;
  lining_name?: string;
  linear_meters?: number;
  widths_required?: number;
  total_cost?: number;
  manufacturing_cost?: number;
  manufacturing_type?: string;
  selected_options?: Array<{
    optionKey?: string;
    option_name?: string;
    name?: string;
    price?: number;
    quantity?: number;
  }>;
  hardware_details?: Record<string, any>;
  fabric_rotated?: boolean;
}

interface SyncResult {
  success: boolean;
  error?: string;
}

/**
 * Sync a single window's data to workshop_items
 * Uses UPSERT to always update existing records
 */
export async function syncWindowToWorkshopItem(
  windowId: string,
  summaryData: WindowSummaryData,
  roomName?: string
): Promise<SyncResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('⚠️ WorkshopItemSync: No authenticated user, skipping sync');
      return { success: false, error: 'No authenticated user' };
    }

    // Get project_id from windows_summary if not provided
    let projectId = summaryData.project_id;
    if (!projectId) {
      const { data: existingItem } = await supabase
        .from('workshop_items')
        .select('project_id')
        .eq('window_id', windowId)
        .maybeSingle();
      
      projectId = existingItem?.project_id;
    }

    // If still no project_id, try to get from surfaces
    if (!projectId) {
      const { data: surface } = await supabase
        .from('surfaces')
        .select('room_id, rooms!inner(project_id)')
        .eq('id', windowId)
        .maybeSingle();
      
      projectId = (surface?.rooms as any)?.project_id;
    }

    if (!projectId) {
      console.warn('⚠️ WorkshopItemSync: Could not determine project_id');
      return { success: false, error: 'Could not determine project_id' };
    }

    // Extract fullness ratio from heading_details or template_details
    const fullnessRatio = 
      summaryData.heading_details?.fullness_ratio || 
      summaryData.template_details?.fullness_ratio || 
      1.0;

    // Build comprehensive manufacturing_details with ALL required fields
    const manufacturingDetails = {
      type: summaryData.manufacturing_type || summaryData.template_details?.manufacturing_type || 'machine',
      cost: summaryData.manufacturing_cost,
      
      // Heading and fullness - CRITICAL for production
      heading_type: summaryData.heading_details?.heading_name || 
                    summaryData.selected_heading_id || 
                    'Standard',
      fullness_ratio: fullnessRatio,
      
      // Lining
      lining_type: summaryData.lining_type || 'none',
      lining_name: summaryData.lining_name,
      
      // Hems - stored in nested object for clarity
      hems: {
        header: summaryData.template_details?.header_allowance || 0,
        bottom: summaryData.template_details?.bottom_hem || 0,
        side: summaryData.template_details?.side_hems || 0,
        seam: summaryData.template_details?.seam_hems || 0,
      },
      
      // Returns
      return_left: summaryData.template_details?.return_left || 0,
      return_right: summaryData.template_details?.return_right || 0,
      
      // Fabric orientation
      fabric_rotated: summaryData.fabric_rotated || false,
      
      // Hand finished flag
      hand_finished: summaryData.template_details?.manufacturing_type === 'hand',
      
      // Selected options for production notes
      selected_options: summaryData.selected_options || [],
      
      // Hardware reference
      hardware_details: summaryData.hardware_details,
      
      // Cut dimensions (calculated from drop + hems)
      total_drop_cm: summaryData.drop ? 
        Math.round((summaryData.drop + 
          (summaryData.template_details?.header_allowance || 0) + 
          (summaryData.template_details?.bottom_hem || 0)) / 10) : undefined,
    };

    // Build measurements object - ALWAYS in MM (database standard)
    const measurements = {
      rail_width: summaryData.rail_width,
      drop: summaryData.drop,
      window_width: summaryData.measurements_details?.window_width,
      window_height: summaryData.measurements_details?.window_height,
      pooling: summaryData.measurements_details?.pooling_amount || 
               summaryData.measurements_details?.pooling,
      stackback_left: summaryData.measurements_details?.stackback_left,
      stackback_right: summaryData.measurements_details?.stackback_right,
    };

    // Build the workshop item data
    const workshopItemData = {
      project_id: projectId,
      window_id: windowId,
      room_name: roomName || summaryData.surface_name || 'Unassigned Room',
      surface_name: summaryData.surface_name || 'Window',
      treatment_type: summaryData.treatment_type || 
                      summaryData.template_details?.treatment_category || 
                      summaryData.template_name || 
                      'curtains',
      fabric_details: summaryData.fabric_details,
      measurements,
      manufacturing_details: manufacturingDetails,
      linear_meters: summaryData.linear_meters,
      widths_required: summaryData.widths_required,
      total_cost: summaryData.total_cost,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    console.log('🔄 WorkshopItemSync: Upserting workshop item', {
      windowId,
      treatmentType: workshopItemData.treatment_type,
      fullnessRatio: manufacturingDetails.fullness_ratio,
      headingType: manufacturingDetails.heading_type,
    });

    // UPSERT: Update if exists, insert if new
    const { error } = await supabase
      .from('workshop_items')
      .upsert(workshopItemData, { 
        onConflict: 'window_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('❌ WorkshopItemSync: Upsert failed', error);
      return { success: false, error: error.message };
    }

    console.log('✅ WorkshopItemSync: Successfully synced workshop item');
    return { success: true };
    
  } catch (error) {
    console.error('❌ WorkshopItemSync: Exception during sync', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Hook for syncing workshop items
 */
export function useWorkshopItemSync() {
  const syncWindow = useCallback(async (
    windowId: string,
    summaryData: WindowSummaryData,
    roomName?: string
  ) => {
    return syncWindowToWorkshopItem(windowId, summaryData, roomName);
  }, []);

  const syncMultipleWindows = useCallback(async (
    items: Array<{ windowId: string; summaryData: WindowSummaryData; roomName?: string }>
  ) => {
    const results = await Promise.all(
      items.map(item => syncWindowToWorkshopItem(item.windowId, item.summaryData, item.roomName))
    );
    return results;
  }, []);

  return {
    syncWindow,
    syncMultipleWindows,
  };
}
