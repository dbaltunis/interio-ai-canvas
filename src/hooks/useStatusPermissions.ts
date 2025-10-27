import { useJobStatuses } from "./useJobStatuses";

export const useStatusPermissions = (currentStatus: string) => {
  const { data: jobStatuses = [] } = useJobStatuses();
  
  const statusInfo = jobStatuses.find(
    s => s.name.toLowerCase() === currentStatus?.toLowerCase()
  );

  const canEdit = statusInfo?.action === 'editable' || statusInfo?.action === 'progress_only';
  const isLocked = statusInfo?.action === 'locked' || statusInfo?.action === 'completed';
  const isViewOnly = statusInfo?.action === 'view_only';
  const requiresReason = statusInfo?.action === 'requires_reason';

  return {
    canEdit,
    isLocked,
    isViewOnly,
    requiresReason,
    statusAction: statusInfo?.action || 'editable',
    statusInfo
  };
};
