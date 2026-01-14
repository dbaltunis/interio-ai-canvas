import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/clipboard';
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

  // Update share settings (document type & content filter)
  const updateShareSettings = useCallback(async (settings: {
    documentType?: string;
    contentFilter?: string;
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

// Fetch workshop data for a project - returns same structure as useWorkshopData
// This fetches from workshop_items which contains the denormalized work order data
export async function fetchWorkshopDataForProject(projectId: string, projectMeta?: {
  name?: string;
  job_number?: string;
  order_number?: string;
  due_date?: string;
  created_at?: string;
  clients?: { name?: string };
}): Promise<WorkshopData | null> {
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
        status,
        linear_meters,
        widths_required
      `)
      .eq('project_id', projectId);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    // Group items by room
    const roomsMap = new Map<string, WorkshopRoomSection>();
    
    data.forEach(item => {
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
      const workshopItem: WorkshopRoomItem = {
        id: item.id,
        name: item.surface_name || 'Window',
        roomName: roomName,
        location: item.surface_name || 'Window',
        quantity: 1,
        measurements: {
          width: measurements?.rail_width ? Math.round(measurements.rail_width / 10) : undefined, // Convert mm to cm
          height: measurements?.drop ? Math.round(measurements.drop / 10) : undefined,
          drop: measurements?.drop ? Math.round(measurements.drop / 10) : undefined,
          pooling: measurements?.pooling_amount || measurements?.pooling,
          unit: 'cm',
        },
        treatmentType: formatTreatmentType(item.treatment_type || 'Treatment'),
        notes: item.notes || undefined,
        
        // Fabric details
        fabricDetails: fabricDetails ? {
          name: fabricDetails.name || 'Unknown Fabric',
          fabricWidth: fabricDetails.fabric_width || 0,
          imageUrl: fabricDetails.image_url,
          pricePerUnit: fabricDetails.selling_price,
          rollDirection: manufacturingDetails?.fabric_rotated ? 'Horizontal' : 'Vertical',
          patternRepeat: fabricDetails.pattern_repeat,
          color: fabricDetails.color,
        } : undefined,
        
        // Fabric usage from calculated fields
        fabricUsage: {
          linearMeters: item.linear_meters || 0,
          linearYards: (item.linear_meters || 0) * 1.09361,
          widthsRequired: item.widths_required || 1,
          seamsRequired: Math.max(0, (item.widths_required || 1) - 1),
        },
        
        // Hems from manufacturing details
        hems: manufacturingDetails ? {
          header: manufacturingDetails.header_hem || manufacturingDetails.header_allowance || 0,
          bottom: manufacturingDetails.bottom_hem || 0,
          side: manufacturingDetails.side_hem || manufacturingDetails.side_hems || 0,
          seam: manufacturingDetails.seam_hem || manufacturingDetails.seam_hems || 0,
        } : undefined,
        
        // Fullness
        fullness: manufacturingDetails ? {
          ratio: manufacturingDetails.fullness_ratio || 1.0,
          headingType: manufacturingDetails.heading_type || 'Standard',
        } : undefined,
        
        // Options
        options: manufacturingDetails?.selected_options?.map((opt: any) => ({
          name: opt.name || opt.option_name || 'Option',
          optionKey: opt.optionKey || opt.option_key || '',
          price: opt.price || 0,
          quantity: opt.quantity || 1,
        })) || [],
        
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
        projectName: projectMeta?.name || undefined,
        createdDate: projectMeta?.created_at ? String(projectMeta.created_at).slice(0, 10) : undefined,
        dueDate: projectMeta?.due_date || undefined,
        assignedMaker: undefined,
        shippingAddress: undefined,
      },
      rooms,
      projectTotals: { itemsCount: data.length },
    };
  } catch (error) {
    console.error('Error fetching workshop data:', error);
    return null;
  }
}

// Helper to format treatment types nicely
function formatTreatmentType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Legacy: Fetch treatments for a project (for public page)
// Uses workshop_items table which contains the actual work order data
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
