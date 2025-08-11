import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from "@/hooks/usePermissions";
import { ReactNode } from "react";

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  fallback?: ReactNode;
  children: ReactNode;
  requireAll?: boolean; // For multiple permissions, require all vs any
}

export const PermissionGuard = ({ 
  permission, 
  permissions, 
  fallback, 
  children, 
  requireAll = false 
}: PermissionGuardProps) => {
  let hasPermission: boolean | undefined = false;

  if (permission) {
    hasPermission = useHasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasPermission = useHasAllPermissions(permissions);
    } else {
      hasPermission = useHasAnyPermission(permissions);
    }
  }

  // Show loading state while permissions are being checked
  if (hasPermission === undefined) {
    return null; // Or return a loading spinner if desired
  }

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
};