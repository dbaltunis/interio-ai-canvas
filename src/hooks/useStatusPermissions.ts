import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Updated to use status ID instead of status name
export const useStatusPermissions = (statusId: string | null | undefined) => {
  return useQuery({
    queryKey: ["status_permissions", statusId],
    queryFn: async () => {
      if (!statusId) {
        return {
          canEdit: true,
          isLocked: false,
          isViewOnly: false,
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
          isViewOnly: false,
          requiresReason: false,
          statusAction: 'editable' as const,
          statusInfo: null
        };
      }

      const canEdit = statusInfo.action === 'editable' || statusInfo.action === 'progress_only';
      const isLocked = statusInfo.action === 'locked' || statusInfo.action === 'completed';
      const isViewOnly = statusInfo.action === 'view_only';
      const requiresReason = statusInfo.action === 'requires_reason';

      return {
        canEdit,
        isLocked,
        isViewOnly,
        requiresReason,
        statusAction: statusInfo.action || 'editable',
        statusInfo
      };
    },
    enabled: !!statusId,
    staleTime: 5 * 60 * 1000,
  });
};
