import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check status permissions for a project
 * 
 * Simplified status system:
 * - editable: Full edit access
 * - locked: No editing allowed (includes legacy view_only, completed)
 * - requires_reason: Editing allowed, but status changes need reason
 */
export const useStatusPermissions = (statusId: string | null | undefined) => {
  return useQuery({
    queryKey: ["status_permissions", statusId],
    queryFn: async () => {
      if (!statusId) {
        return {
          canEdit: true,
          isLocked: false,
          requiresReason: false,
          statusAction: 'editable' as const,
          statusInfo: null
        };
      }

      const { data: statusInfo, error } = await supabase
        .from("job_statuses")
        .select("*")
        .eq("id", statusId)
        .single();

      if (error || !statusInfo) {
        console.error("Error fetching status:", error);
        return {
          canEdit: true,
          isLocked: false,
          requiresReason: false,
          statusAction: 'editable' as const,
          statusInfo: null
        };
      }

      // Simplified logic: only 'editable' allows editing
      // 'locked', 'view_only', 'completed' all treated as locked
      const action = statusInfo.action || 'editable';
      const canEdit = action === 'editable';
      const isLocked = action === 'locked' || action === 'view_only' || action === 'completed';
      const requiresReason = action === 'requires_reason';

      return {
        canEdit,
        isLocked,
        requiresReason,
        statusAction: action,
        statusInfo
      };
    },
    enabled: !!statusId,
    staleTime: 30 * 1000, // 30 seconds - reduced to ensure status changes are reflected quickly
  });
};
