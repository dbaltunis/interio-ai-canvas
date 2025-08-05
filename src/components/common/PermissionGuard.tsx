import { useHasPermission, useHasAnyPermission } from "@/hooks/usePermissions";
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
      // For requireAll, check if any permission is still loading
      const permissionChecks = permissions.map(p => useHasPermission(p));
      if (permissionChecks.some(check => check === undefined)) {
        hasPermission = undefined; // Still loading
      } else {
        hasPermission = permissionChecks.every(check => check === true);
      }
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