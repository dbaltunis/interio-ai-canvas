import { supabase } from "@/integrations/supabase/client";

/**
 * Regenerates window summaries for a project by deleting old cached data
 * This allows the system to recalculate with the latest logic
 */
export const regenerateWindowSummaries = async (projectId: string) => {
  try {
    console.log('[REGENERATE] Starting window summary regeneration for project:', projectId);
    
    // Get all surfaces for this project
    const { data: surfaces, error: surfacesError } = await supabase
      .from('surfaces')
      .select('id')
      .eq('project_id', projectId);
    
    if (surfacesError) {
      console.error('[REGENERATE] Error fetching surfaces:', surfacesError);
      throw surfacesError;
    }
    
    if (!surfaces || surfaces.length === 0) {
      console.log('[REGENERATE] No surfaces found for project');
      return { success: true, deletedCount: 0 };
    }
    
    const surfaceIds = surfaces.map(s => s.id);
    
    // Delete existing window summaries for these surfaces
    const { error: deleteError, count } = await supabase
      .from('windows_summary')
      .delete()
      .in('window_id', surfaceIds);
    
    if (deleteError) {
      console.error('[REGENERATE] Error deleting summaries:', deleteError);
      throw deleteError;
    }
    
    console.log('[REGENERATE] Successfully deleted', count, 'window summaries');
    console.log('[REGENERATE] Window summaries will be regenerated on next calculation');
    
    return { 
      success: true, 
      deletedCount: count || 0,
      message: `Deleted ${count || 0} window summaries. Data will regenerate automatically.`
    };
  } catch (error) {
    console.error('[REGENERATE] Failed to regenerate window summaries:', error);
    throw error;
  }
};
