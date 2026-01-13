import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/use-toast';
import { ShareRecipient } from '@/components/workroom/SharedRecipientsDialog';

export function useWorkOrderRecipients(projectId: string | undefined) {
  const [recipients, setRecipients] = useState<ShareRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch recipients for this project
  const fetchRecipients = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_shares')
        .select('*')
        .eq('project_id', projectId)
        .order('shared_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Load recipients on mount
  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // Add a new recipient
  const addRecipient = useCallback(async (recipient: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
  }): Promise<boolean> => {
    if (!projectId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showErrorToast('Please sign in to add recipients');
        return false;
      }

      const { error } = await supabase
        .from('work_order_shares')
        .insert({
          project_id: projectId,
          recipient_name: recipient.name,
          recipient_email: recipient.email || null,
          recipient_phone: recipient.phone || null,
          notes: recipient.notes || null,
          shared_by: user.id
        });

      if (error) throw error;
      
      showSuccessToast('Recipient added', `${recipient.name} can now be tracked`, 'normal');
      await fetchRecipients();
      return true;
    } catch (error) {
      console.error('Error adding recipient:', error);
      showErrorToast('Failed to add recipient');
      return false;
    }
  }, [projectId, fetchRecipients]);

  // Remove a recipient (soft delete - set is_active to false)
  const removeRecipient = useCallback(async (recipientId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('work_order_shares')
        .update({ is_active: false })
        .eq('id', recipientId);

      if (error) throw error;
      
      showSuccessToast('Recipient removed', 'They can still access the link if they have it', 'normal');
      await fetchRecipients();
      return true;
    } catch (error) {
      console.error('Error removing recipient:', error);
      showErrorToast('Failed to remove recipient');
      return false;
    }
  }, [fetchRecipients]);

  const activeCount = recipients.filter(r => r.is_active).length;

  return {
    recipients,
    activeCount,
    isLoading,
    fetchRecipients,
    addRecipient,
    removeRecipient
  };
}

// Track access from public page (no auth required)
export async function trackWorkOrderAccess(projectId: string): Promise<void> {
  try {
    // Fetch current shares and increment manually
    const { data: shares } = await supabase
      .from('work_order_shares')
      .select('id, access_count')
      .eq('project_id', projectId)
      .eq('is_active', true);

    if (shares && shares.length > 0) {
      for (const share of shares) {
        await supabase
          .from('work_order_shares')
          .update({ 
            last_accessed_at: new Date().toISOString(),
            access_count: (share.access_count || 0) + 1
          })
          .eq('id', share.id);
      }
    }
  } catch (error) {
    // Silently fail - don't break the public page
    console.error('Error tracking access:', error);
  }
}
