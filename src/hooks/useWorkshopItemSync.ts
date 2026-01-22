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

    // Get user's measurement unit preference
    // CRITICAL FIX: ALWAYS read from business_settings, NOT measurements_details.unit
    // measurements_details.unit contains "mm" (storage format), NOT user's display preference!
    const measurementsDetails = summaryData.measurements_details || {};
    
    // ALWAYS fetch user's DISPLAY preference from business_settings
    let userLengthUnit = 'cm'; // safe default
    try {
      const { data: businessSettings } = await supabase
        .from('business_settings')
        .select('measurement_units')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (businessSettings?.measurement_units) {
        const units = typeof businessSettings.measurement_units === 'string' 
          ? JSON.parse(businessSettings.measurement_units)
          : businessSettings.measurement_units;
        userLengthUnit = units?.length || 'cm';
        console.log('📏 WorkshopItemSync: User display unit preference:', userLengthUnit);
      }
    } catch (e) {
      console.warn('⚠️ WorkshopItemSync: Could not fetch user unit preference, using cm');
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

    // CRITICAL FIX: Read from measurements_details (user-entered) first, then template_details (defaults)
    // measurements_details was already extracted above for unit preference
    const templateDetails = summaryData.template_details || {};
    
    // Extract fullness ratio - priority: measurements_details > heading_details > template_details
    const fullnessRatio = 
      measurementsDetails.fullness_ratio ||
      summaryData.heading_details?.fullness_ratio || 
      templateDetails.fullness_ratio || 
      1.0;

    // Extract hems from the correct source (user-entered values in measurements_details)
    const headerHem = measurementsDetails.header_hem ?? templateDetails.header_allowance ?? 0;
    const bottomHem = measurementsDetails.bottom_hem ?? templateDetails.bottom_hem ?? 0;
    const sideHems = measurementsDetails.side_hems ?? templateDetails.side_hems ?? 0;
    const seamHems = measurementsDetails.seam_hems ?? templateDetails.seam_hems ?? 0;

    // Build comprehensive manufacturing_details with ALL required fields
    const manufacturingDetails = {
      type: summaryData.manufacturing_type || templateDetails.manufacturing_type || 'machine',
      cost: summaryData.manufacturing_cost,
      
      // Heading and fullness - CRITICAL for production
      // Use heading_name (human readable), NOT UUID
      heading_type: summaryData.heading_details?.heading_name || 'Standard',
      fullness_ratio: fullnessRatio,
      
      // Lining
      lining_type: summaryData.lining_type || 'none',
      lining_name: summaryData.lining_name,
      
      // Hems - FIXED: read from measurements_details (user-entered values)
      hems: {
        header: headerHem,
        bottom: bottomHem,
        side: sideHems,
        seam: seamHems,
      },
      
      // Returns
      return_left: templateDetails.return_left || 0,
      return_right: templateDetails.return_right || 0,
      
      // Fabric orientation - CRITICAL: read from measurementsDetails, NOT summaryData root
      fabric_rotated: measurementsDetails.fabric_rotated || false,
      
      // Hand finished flag
      hand_finished: templateDetails.manufacturing_type === 'hand',
      
      // Selected options for production notes - check measurements_details as backup
      selected_options: summaryData.selected_options || measurementsDetails.selected_options || [],
      
      // Hardware reference
      hardware_details: summaryData.hardware_details,
      
      // Cut dimensions (calculated from drop + hems) - all values in MM, convert to cm
      total_drop_cm: summaryData.drop ? 
        Math.round((summaryData.drop + headerHem + bottomHem) / 10) : undefined,
    };

    // Build measurements object
    // CRITICAL FIX: Read from top-level first, then measurements_details as fallback
    // Store values as-is (in their original unit) with the display_unit for conversion
    const measurements = {
      // Top-level rail_width/drop take priority (these are the calculated values)
      // Fall back to measurements_details if top-level is null
      rail_width: summaryData.rail_width ?? measurementsDetails.rail_width,
      drop: summaryData.drop ?? measurementsDetails.drop,
      window_width: measurementsDetails.window_width,
      window_height: measurementsDetails.window_height,
      pooling: measurementsDetails.pooling_amount || measurementsDetails.pooling,
      stackback_left: measurementsDetails.stackback_left,
      stackback_right: measurementsDetails.stackback_right,
      // CRITICAL: Store the user's preferred unit from the worksheet
      display_unit: userLengthUnit,
    };

    // Build fabric details with color from correct source
    const fabricDetailsWithColor = summaryData.fabric_details ? {
      ...summaryData.fabric_details,
      // Ensure color is synced from fabric_details or measurements_details
      color: summaryData.fabric_details.color || measurementsDetails.selected_color,
    } : undefined;

    // Build the workshop item data
    const workshopItemData = {
      project_id: projectId,
      window_id: windowId,
      room_name: roomName || summaryData.surface_name || 'Unassigned Room',
      surface_name: summaryData.surface_name || 'Window',
      treatment_type: summaryData.treatment_type || 
                      templateDetails.treatment_category || 
                      summaryData.template_name || 
                      'curtains',
      fabric_details: fabricDetailsWithColor,
      measurements,
      manufacturing_details: manufacturingDetails,
      linear_meters: summaryData.linear_meters,
      widths_required: summaryData.widths_required,
      total_cost: summaryData.total_cost,
      user_id: user.id,
      // Clear hardcoded notes - let UI handle notes display
      notes: measurementsDetails.production_notes || measurementsDetails.notes || null,
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
 * Force re-sync ALL workshop items for a project from windows_summary
 * Useful when shared data appears stale or incorrect
 */
export async function resyncAllWorkshopItemsForProject(projectId: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, count: 0, error: 'No authenticated user' };
    }

    console.log('🔄 Resync: Finding all window IDs for project:', projectId);

    // Get all window_ids for this project by querying workshop_items (which has project_id)
    const { data: workshopItems, error: wsError } = await supabase
      .from('workshop_items')
      .select('window_id, room_name')
      .eq('project_id', projectId);

    if (wsError) {
      console.error('❌ Resync: Failed to fetch workshop_items', wsError);
      return { success: false, count: 0, error: wsError.message };
    }

    if (!workshopItems || workshopItems.length === 0) {
      console.log('⚠️ Resync: No workshop items found for project');
      return { success: true, count: 0 };
    }

    console.log(`🔄 Resync: Found ${workshopItems.length} items to sync`);

    // Sync each window by fetching fresh windows_summary data
    let successCount = 0;
    for (const item of workshopItems) {
      if (!item.window_id) continue;

      // Fetch fresh windows_summary for this window
      const { data: summary, error: summaryError } = await supabase
        .from('windows_summary')
        .select('window_id, treatment_type, template_details, heading_details, fabric_details, lining_type, lining_details, manufacturing_type, manufacturing_cost, measurements_details, widths_required, linear_meters')
        .eq('window_id', item.window_id)
        .maybeSingle();

      if (summaryError || !summary) {
        console.warn(`⚠️ Resync: Could not fetch summary for window ${item.window_id}`);
        continue;
      }

      // Cast to the expected type
      const summaryData = {
        ...summary,
        project_id: projectId,
      } as WindowSummaryData;

      const result = await syncWindowToWorkshopItem(item.window_id, summaryData, item.room_name || 'Unassigned');
      if (result.success) {
        successCount++;
      }
    }

    console.log(`✅ Resync: Successfully synced ${successCount}/${workshopItems.length} items`);
    return { success: true, count: successCount };

  } catch (error) {
    console.error('❌ Resync: Exception', error);
    return { success: false, count: 0, error: String(error) };
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

  const resyncProject = useCallback(async (projectId: string) => {
    return resyncAllWorkshopItemsForProject(projectId);
  }, []);

  return {
    syncWindow,
    syncMultipleWindows,
    resyncProject,
  };
}
