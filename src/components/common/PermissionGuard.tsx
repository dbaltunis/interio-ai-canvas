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
  let hasPermission = false;

  if (permission) {
    hasPermission = useHasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasPermission = permissions.every(p => useHasPermission(p));
    } else {
      hasPermission = useHasAnyPermission(permissions);
    }
  }

  if (!hasPermission) {
    return fallback || null;
  }

  return <>{children}</>;
};