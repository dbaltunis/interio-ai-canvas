import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/clipboard';
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
        order_number,
        work_order_pin,
        work_order_shared_at,
        due_date,
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

// Fetch treatments for a project (for public page)
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
    
    // Helper to format treatment types nicely
    const formatTreatmentType = (type: string): string => {
      return type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    };
    
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
