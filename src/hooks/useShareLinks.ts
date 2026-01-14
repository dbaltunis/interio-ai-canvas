import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/components/ui/use-toast';

export interface ShareLink {
  id: string;
  project_id: string;
  token: string;
  name: string | null;
  document_type: 'work_order' | 'installation' | 'fitting';
  content_filter: 'all' | 'field_ready' | 'specs_only';
  treatment_filter: string[];
  pin: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  is_active: boolean;
  viewer_count?: number;
}

export interface CreateShareLinkInput {
  name?: string;
  document_type?: 'work_order' | 'installation' | 'fitting';
  content_filter?: 'all' | 'field_ready' | 'specs_only';
  treatment_filter?: string[];
  pin?: string;
}

export function useShareLinks(projectId: string | undefined) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all share links for this project
  const fetchShareLinks = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_order_share_links')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get viewer counts for each link
      const linksWithCounts = await Promise.all(
        (data || []).map(async (link) => {
          const { count } = await supabase
            .from('work_order_shares')
            .select('*', { count: 'exact', head: true })
            .eq('share_link_id', link.id)
            .eq('is_active', true);
          
          return {
            id: link.id,
            project_id: link.project_id,
            token: link.token,
            name: link.name,
            document_type: (link.document_type || 'work_order') as 'work_order' | 'installation' | 'fitting',
            content_filter: (link.content_filter || 'all') as 'all' | 'field_ready' | 'specs_only',
            treatment_filter: Array.isArray(link.treatment_filter) 
              ? (link.treatment_filter as unknown as string[]) 
              : [],
            pin: link.pin,
            created_at: link.created_at,
            updated_at: link.updated_at,
            expires_at: link.expires_at,
            is_active: link.is_active,
            viewer_count: count || 0,
          } as ShareLink;
        })
      );

      setShareLinks(linksWithCounts);
    } catch (error) {
      console.error('Error fetching share links:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Load on mount
  useEffect(() => {
    fetchShareLinks();
  }, [fetchShareLinks]);

  // Create a new share link
  const createShareLink = useCallback(async (input: CreateShareLinkInput): Promise<ShareLink | null> => {
    if (!projectId) return null;
    
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showErrorToast('Please sign in to create share links');
        return null;
      }

      const { data, error } = await supabase
        .from('work_order_share_links')
        .insert({
          project_id: projectId,
          name: input.name || null,
          document_type: input.document_type || 'work_order',
          content_filter: input.content_filter || 'all',
          treatment_filter: input.treatment_filter || [],
          pin: input.pin || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newLink: ShareLink = {
        id: data.id,
        project_id: data.project_id,
        token: data.token,
        name: data.name,
        document_type: (data.document_type || 'work_order') as 'work_order' | 'installation' | 'fitting',
        content_filter: (data.content_filter || 'all') as 'all' | 'field_ready' | 'specs_only',
        treatment_filter: Array.isArray(data.treatment_filter) 
          ? (data.treatment_filter as unknown as string[]) 
          : [],
        pin: data.pin,
        created_at: data.created_at,
        updated_at: data.updated_at,
        expires_at: data.expires_at,
        is_active: data.is_active,
        viewer_count: 0,
      };

      setShareLinks(prev => [newLink, ...prev]);
      showSuccessToast('Share link created', undefined, 'normal');
      return newLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      showErrorToast('Failed to create share link');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [projectId]);

  // Update a share link
  const updateShareLink = useCallback(async (
    linkId: string, 
    updates: Partial<CreateShareLinkInput>
  ): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.document_type) updateData.document_type = updates.document_type;
      if (updates.content_filter) updateData.content_filter = updates.content_filter;
      if (updates.treatment_filter !== undefined) updateData.treatment_filter = updates.treatment_filter;
      if (updates.pin !== undefined) updateData.pin = updates.pin || null;

      const { error } = await supabase
        .from('work_order_share_links')
        .update(updateData)
        .eq('id', linkId);

      if (error) throw error;

      // Update local state
      setShareLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { 
              ...link, 
              ...updateData,
              treatment_filter: updates.treatment_filter !== undefined 
                ? updates.treatment_filter 
                : link.treatment_filter
            } as ShareLink
          : link
      ));

      return true;
    } catch (error) {
      console.error('Error updating share link:', error);
      showErrorToast('Failed to update share link');
      return false;
    }
  }, []);

  // Delete (soft) a share link
  const deleteShareLink = useCallback(async (linkId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('work_order_share_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;

      setShareLinks(prev => prev.filter(link => link.id !== linkId));
      showSuccessToast('Share link revoked', undefined, 'normal');
      return true;
    } catch (error) {
      console.error('Error deleting share link:', error);
      showErrorToast('Failed to revoke share link');
      return false;
    }
  }, []);

  // Set or remove PIN on a link
  const setLinkPIN = useCallback(async (linkId: string, pin: string | null): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('work_order_share_links')
        .update({ pin })
        .eq('id', linkId);

      if (error) throw error;

      setShareLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, pin } : link
      ));

      if (pin) {
        showSuccessToast('PIN set', undefined, 'normal');
      } else {
        showSuccessToast('PIN removed', undefined, 'normal');
      }
      return true;
    } catch (error) {
      console.error('Error setting PIN:', error);
      showErrorToast('Failed to set PIN');
      return false;
    }
  }, []);

  // Get URL for a share link
  const getShareUrl = useCallback((token: string): string => {
    return `${window.location.origin}/work-order/${token}`;
  }, []);

  return {
    shareLinks,
    isLoading,
    isCreating,
    fetchShareLinks,
    createShareLink,
    updateShareLink,
    deleteShareLink,
    setLinkPIN,
    getShareUrl,
  };
}

// Fetch share link by token (for public page)
export async function fetchShareLinkByToken(token: string): Promise<ShareLink | null> {
  try {
    const { data, error } = await supabase
      .from('work_order_share_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    return {
      id: data.id,
      project_id: data.project_id,
      token: data.token,
      name: data.name,
      document_type: (data.document_type || 'work_order') as 'work_order' | 'installation' | 'fitting',
      content_filter: (data.content_filter || 'all') as 'all' | 'field_ready' | 'specs_only',
      treatment_filter: Array.isArray(data.treatment_filter) 
        ? (data.treatment_filter as unknown as string[]) 
        : [],
      pin: data.pin,
      created_at: data.created_at,
      updated_at: data.updated_at,
      expires_at: data.expires_at,
      is_active: data.is_active,
    } as ShareLink;
  } catch (error) {
    console.error('Error fetching share link by token:', error);
    return null;
  }
}

// Fetch project data by project ID (for public page after getting share link)
export async function fetchProjectByShareLink(projectId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        job_number,
        order_number,
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
      .eq('id', projectId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
}
