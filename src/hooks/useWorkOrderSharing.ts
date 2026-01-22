import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/clipboard';
import { convertFromMM } from '@/utils/measurementFormatters';
import type { WorkshopData, WorkshopRoomSection, WorkshopRoomItem } from '@/hooks/useWorkshopData';

interface ShareResult {
  token: string;
  url: string;
  pin?: string | null;
}

export function useWorkOrderSharing(projectId: string | undefined) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState<ShareResult | null>(null);

  // Generate a unique token for the work order
  const generateToken = useCallback(async (): Promise<ShareResult | null> => {
    if (!projectId) return null;
    
    setIsSharing(true);
    try {
      // Check if token already exists
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('work_order_token')
        .eq('id', projectId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let token = existingProject?.work_order_token;

      // Generate new token if none exists
      if (!token) {
        token = crypto.randomUUID();
        
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            work_order_token: token,
            work_order_shared_at: new Date().toISOString()
          })
          .eq('id', projectId);

        if (updateError) throw updateError;
      }

      const url = `${window.location.origin}/work-order/${token}`;
      const result = { token, url };
      setShareData(result);
      return result;
    } catch (error) {
      console.error('Error generating share token:', error);
      showErrorToast('Failed to generate share link');
      return null;
    } finally {
      setIsSharing(false);
    }
  }, [projectId]);

  // Copy link to clipboard
  const copyShareLink = useCallback(async (): Promise<boolean> => {
    const result = await generateToken();
    if (result) {
      const success = await copyToClipboard(result.url);
      if (success) {
        showSuccessToast('Link copied!', 'Share this link with your installer', 'normal');
        return true;
      } else {
        showErrorToast('Could not copy', 'Please copy the link manually');
        return false;
      }
    }
    return false;
  }, [generateToken]);

  // Set optional PIN for the work order
  const setWorkOrderPIN = useCallback(async (pin: string): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ work_order_pin: pin })
        .eq('id', projectId);

      if (error) throw error;
      showSuccessToast('PIN set', 'Work order now requires PIN to access', 'normal');
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      showErrorToast('Failed to set PIN');
      return false;
    }
  }, [projectId]);

  // Remove sharing access
  const revokeAccess = useCallback(async (): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          work_order_token: null,
          work_order_pin: null,
          work_order_shared_at: null
        })
        .eq('id', projectId);

      if (error) throw error;
      setShareData(null);
      showSuccessToast('Access revoked', 'Share link is no longer valid', 'normal');
      return true;
    } catch (error) {
      console.error('Error revoking access:', error);
      showErrorToast('Failed to revoke access');
      return false;
    }
  }, [projectId]);

  // Remove PIN protection (keep the link active)
  const removeWorkOrderPIN = useCallback(async (): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({ work_order_pin: null })
        .eq('id', projectId);

      if (error) throw error;
      
      // Update local state to reflect PIN removal
      if (shareData) {
        setShareData({ ...shareData, pin: null });
      }
      
      showSuccessToast('PIN removed', 'Work order is now accessible without a PIN', 'normal');
      return true;
    } catch (error) {
      console.error('Error removing PIN:', error);
      showErrorToast('Failed to remove PIN');
      return false;
    }
  }, [projectId, shareData]);

  // Get existing share data
  const getShareData = useCallback(async (): Promise<ShareResult | null> => {
    if (!projectId) return null;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('work_order_token, work_order_pin, work_order_shared_at')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.work_order_token) {
        const url = `${window.location.origin}/work-order/${data.work_order_token}`;
        const result = { 
          token: data.work_order_token, 
          url,
          pin: data.work_order_pin 
        };
        setShareData(result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error getting share data:', error);
      return null;
    }
  }, [projectId]);

  // Update share settings (document type, content filter, treatment types)
  const updateShareSettings = useCallback(async (settings: {
    documentType?: string;
    contentFilter?: string;
    treatmentTypes?: string[];
  }): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      const updateData: Record<string, unknown> = {};
      if (settings.documentType) {
        updateData.work_order_document_type = settings.documentType;
      }
      if (settings.contentFilter) {
        updateData.work_order_content_filter = { type: settings.contentFilter };
      }
      if (settings.treatmentTypes !== undefined) {
        updateData.work_order_treatment_filter = settings.treatmentTypes;
      }
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating share settings:', error);
      return false;
    }
  }, [projectId]);

  return {
    isSharing,
    shareData,
    generateToken,
    copyShareLink,
    setWorkOrderPIN,
    removeWorkOrderPIN,
    revokeAccess,
    getShareData,
    updateShareSettings
  };
}

// Get available treatment types for a project
export async function getAvailableTreatments(projectId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('workshop_items')
      .select('treatment_type')
      .eq('project_id', projectId);

    if (error) throw error;
    
    // Get unique treatment types
    const types = new Set<string>();
    data?.forEach(item => {
      if (item.treatment_type) {
        types.add(item.treatment_type);
      }
    });
    
    return Array.from(types);
  } catch (error) {
    console.error('Error getting available treatments:', error);
    return [];
  }
}

// Fetch project by token (for public page)
export async function fetchProjectByToken(token: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        job_number,
        order_number,
        work_order_pin,
        work_order_shared_at,
        work_order_document_type,
        work_order_content_filter,
        work_order_treatment_filter,
        due_date,
        created_at,
        clients (
          id,
          name,
          phone,
          email,
          address
        )
      `)
      .eq('work_order_token', token)
      .not('work_order_shared_at', 'is', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching project by token:', error);
    return null;
  }
}

// Fetch workshop data for a project with optional treatment type filtering
export async function fetchWorkshopDataForProject(
  projectId: string, 
  projectMeta?: {
    name?: string;
    job_number?: string;
    order_number?: string;
    due_date?: string;
    created_at?: string;
    clients?: { name?: string; phone?: string; address?: string };
  },
  options?: {
    treatmentTypes?: string[];
  }
): Promise<WorkshopData | null> {
  try {
    let query = supabase
      .from('workshop_items')
      .select(`
        id,
        treatment_type,
        surface_name,
        room_name,
        fabric_details,
        measurements,
        manufacturing_details,
        notes,
        status,
        linear_meters,
        widths_required
      `)
      .eq('project_id', projectId);

    // Apply treatment type filter if specified
    if (options?.treatmentTypes && options.treatmentTypes.length > 0) {
      query = query.in('treatment_type', options.treatmentTypes);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    // DEBUG: Log fetched data to trace unit issues
    console.log('🔍 fetchWorkshopDataForProject: Fetched', data.length, 'items for project', projectId);
    
    // Group items by room
    const roomsMap = new Map<string, WorkshopRoomSection>();
    
    data.forEach((item, index) => {
      const roomName = item.room_name || 'Unassigned';
      
      if (!roomsMap.has(roomName)) {
        roomsMap.set(roomName, {
          roomName,
          items: [],
          totals: { count: 0 }
        });
      }
      
      const room = roomsMap.get(roomName)!;
      
      // Extract JSONB fields
      const fabricDetails = item.fabric_details as Record<string, any> | null;
      const manufacturingDetails = item.manufacturing_details as Record<string, any> | null;
      const measurements = item.measurements as Record<string, any> | null;
      
      // Build workshop item matching the WorkshopRoomItem interface
      // CRITICAL: Use stored display_unit preference, fallback to 'cm'
      const displayUnit = measurements?.display_unit || 'cm';
      
      // DEBUG: Log first few items to verify display_unit is correct
      if (index < 3) {
        console.log(`📏 Item ${index + 1}: display_unit="${displayUnit}", rail_width=${measurements?.rail_width}mm, drop=${measurements?.drop}mm`);
      }
      
      // Convert MM to the stored display unit (respects user preference)
      const convertMeasurement = (valueMM: number | undefined) => {
        if (!valueMM) return undefined;
        const converted = Math.round(convertFromMM(valueMM, displayUnit) * 100) / 100;
        // DEBUG: Log first conversion to verify it works
        if (index === 0 && valueMM) {
          console.log(`📐 Converting ${valueMM}mm to ${displayUnit}: result = ${converted}`);
        }
        return converted;
      };
      
      const workshopItem: WorkshopRoomItem = {
        id: item.id,
        name: item.surface_name || 'Window',
        roomName: roomName,
        location: item.surface_name || 'Window',
        quantity: 1,
        measurements: {
          // Convert from MM (database) to user's preferred display unit
          width: convertMeasurement(measurements?.rail_width),
          height: convertMeasurement(measurements?.drop),
          drop: convertMeasurement(measurements?.drop),
          pooling: measurements?.pooling,
          unit: displayUnit, // Use stored preference, not hardcoded 'cm'
        },
        treatmentType: formatTreatmentType(item.treatment_type || 'Treatment'),
        notes: item.notes || undefined,
        
        // Fabric details - ensure color is included
        fabricDetails: fabricDetails ? {
          name: fabricDetails.name || 'Unknown Fabric',
          fabricWidth: fabricDetails.fabric_width || 0,
          imageUrl: fabricDetails.image_url,
          pricePerUnit: fabricDetails.selling_price,
          rollDirection: manufacturingDetails?.fabric_rotated ? 'Horizontal' : 'Vertical',
          patternRepeat: fabricDetails.pattern_repeat,
          color: fabricDetails.color, // CRITICAL: Include color
        } : undefined,
        
        // Fabric usage from calculated fields
        fabricUsage: {
          linearMeters: item.linear_meters || 0,
          linearYards: (item.linear_meters || 0) * 1.09361,
          widthsRequired: item.widths_required || 1,
          seamsRequired: Math.max(0, (item.widths_required || 1) - 1),
          // Add cut dimensions
          totalDropCm: manufacturingDetails?.total_drop_cm || manufacturingDetails?.cut_length_cm,
          totalWidthCm: manufacturingDetails?.total_width_cm || manufacturingDetails?.cut_width_cm,
        },
        
        // Hems from manufacturing details (check nested hems object first, then flat fields)
        hems: manufacturingDetails ? {
          header: manufacturingDetails.hems?.header || manufacturingDetails.header_hem || manufacturingDetails.header_allowance || 0,
          bottom: manufacturingDetails.hems?.bottom || manufacturingDetails.bottom_hem || 0,
          side: manufacturingDetails.hems?.side || manufacturingDetails.side_hem || manufacturingDetails.side_hems || 0,
          seam: manufacturingDetails.hems?.seam || manufacturingDetails.seam_hem || manufacturingDetails.seam_hems || 0,
        } : undefined,
        
        // Fullness - check manufacturing_details directly  
        fullness: manufacturingDetails ? {
          ratio: manufacturingDetails.fullness_ratio || 1.0,
          headingType: manufacturingDetails.heading_type || 'Standard',
        } : undefined,
        
        // Options - parse from manufacturing details
        options: parseOptions(manufacturingDetails?.selected_options),
        
        // Lining
        liningDetails: manufacturingDetails?.lining_type ? {
          type: manufacturingDetails.lining_type,
          name: manufacturingDetails.lining_name || manufacturingDetails.lining_type,
        } : undefined,
        
        // Visual
        visualDetails: {
          thumbnailUrl: fabricDetails?.image_url,
          showImage: true,
        },
      };
      
      room.items.push(workshopItem);
      room.totals = { count: room.items.length };
    });
    
    // Convert to array and sort
    const rooms = Array.from(roomsMap.values()).sort((a, b) => 
      a.roomName.localeCompare(b.roomName)
    );
    
    // Build WorkshopData structure
    return {
      header: {
        orderNumber: projectMeta?.job_number || projectMeta?.order_number || undefined,
        clientName: projectMeta?.clients?.name || undefined,
        shippingAddress: projectMeta?.clients?.address || undefined,
        projectName: projectMeta?.name || undefined,
        createdDate: projectMeta?.created_at ? String(projectMeta.created_at).slice(0, 10) : undefined,
        dueDate: projectMeta?.due_date || undefined,
        assignedMaker: undefined,
      },
      rooms,
      projectTotals: { itemsCount: data.length },
    };
  } catch (error) {
    console.error('Error fetching workshop data:', error);
    return null;
  }
}

// Parse options from manufacturing details
function parseOptions(selectedOptions: any): Array<{ name: string; optionKey: string; price: number; quantity: number }> {
  if (!selectedOptions || !Array.isArray(selectedOptions)) return [];
  
  return selectedOptions.map((opt: any) => ({
    name: opt.name || opt.option_name || opt.label || 'Option',
    optionKey: opt.optionKey || opt.option_key || '',
    price: opt.price || 0,
    quantity: opt.quantity || 1,
  }));
}

// Helper to format treatment types nicely
function formatTreatmentType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Legacy: Fetch treatments for a project (for public page)
export async function fetchTreatmentsForProject(projectId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('workshop_items')
      .select(`
        id,
        treatment_type,
        surface_name,
        room_name,
        fabric_details,
        measurements,
        manufacturing_details,
        notes,
        status
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    
    // Transform to match expected format with meaningful display names
    return (data || []).map(item => {
      const fabricDetails = item.fabric_details as Record<string, any> | null;
      const manufacturingDetails = item.manufacturing_details as Record<string, any> | null;
      const measurements = item.measurements as Record<string, any> | null;
      
      // Build a meaningful treatment display name
      const fabricName = fabricDetails?.name;
      const treatmentType = item.treatment_type || 'Treatment';
      
      // Format: "Curtains - ADARA" or just "Roller Blinds"
      const displayName = fabricName 
        ? `${formatTreatmentType(treatmentType)} - ${fabricName}`
        : formatTreatmentType(treatmentType);
      
      return {
        id: item.id,
        treatment_type: treatmentType,
        treatment_name: displayName,
        product_name: fabricName,
        mounting_type: manufacturingDetails?.mounting_type || undefined,
        surface_name: item.surface_name,
        measurements: {
          width: measurements?.rail_width,
          height: measurements?.drop,
          ...measurements
        },
        notes: item.notes,
        status: item.status,
        rooms: { 
          id: item.room_name, 
          name: item.room_name 
        }
      };
    });
  } catch (error) {
    console.error('Error fetching treatments:', error);
    return [];
  }
}

// Create a viewer session when someone accesses the public work order
export async function createViewerSession(
  projectId: string,
  name: string,
  email?: string,
  shareLinkId?: string
): Promise<{ session_token: string; permission_level: string } | null> {
  try {
    const sessionToken = crypto.randomUUID();
    
    // Use type assertion since shared_by is now nullable for viewer-created sessions
    const insertData = {
      project_id: projectId,
      recipient_name: name,
      recipient_email: email || null,
      permission_level: 'edit', // Default to edit so viewers can save notes
      session_token: sessionToken,
      created_by_viewer: true,
      last_accessed_at: new Date().toISOString(),
      access_count: 1,
      share_link_id: shareLinkId || null,
    } as any;
    
    const { data, error } = await supabase
      .from('work_order_shares')
      .insert(insertData)
      .select('session_token, permission_level')
      .single();

    if (error) {
      console.error('Error creating viewer session:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating viewer session:', error);
    return null;
  }
}

// Get viewer session by token
export async function getViewerSession(sessionToken: string): Promise<{
  recipient_name: string;
  recipient_email?: string;
  permission_level: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('work_order_shares')
      .select('recipient_name, recipient_email, permission_level')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (error) {
      console.error('Error getting viewer session:', error);
      return null;
    }

    if (data) {
      // Update last accessed time
      await supabase
        .from('work_order_shares')
        .update({ 
          last_accessed_at: new Date().toISOString(),
          access_count: supabase.rpc ? undefined : 1 // Increment handled by trigger if available
        })
        .eq('session_token', sessionToken);
    }

    return data;
  } catch (error) {
    console.error('Error getting viewer session:', error);
    return null;
  }
}
