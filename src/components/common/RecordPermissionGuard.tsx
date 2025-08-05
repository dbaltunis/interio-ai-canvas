import { useAuth } from "@/components/auth/AuthProvider";
import { useRecordPermissions } from "@/hooks/useRecordPermissions";
import { ReactNode } from "react";

interface RecordPermissionGuardProps {
  recordType: 'client' | 'job' | 'project';
  action: 'view' | 'edit';
  recordUserId?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const RecordPermissionGuard = ({ 
  recordType, 
  action, 
  recordUserId, 
  fallback, 
  children 
}: RecordPermissionGuardProps) => {
  const { user } = useAuth();
  const permissions = useRecordPermissions();

  let hasPermission = false;

  switch (recordType) {
    case 'client':
      hasPermission = action === 'view' 
        ? permissions.canViewClient(recordUserId, user?.id)
        : permissions.canEditClient(recordUserId, user?.id);
      break;
    case 'job':
      hasPermission = action === 'view'
        ? permissions.canViewJob(recordUserId, user?.id)
        : permissions.canEditJob(recordUserId, user?.id);
      break;
    case 'project':
      hasPermission = action === 'view'
        ? permissions.canViewProject(recordUserId, user?.id)
        : permissions.canEditProject(recordUserId, user?.id);
      break;
  }

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
};