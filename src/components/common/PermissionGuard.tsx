import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from "@/hooks/usePermissions";
import { ReactNode, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequestAccessDialog } from "@/components/settings/RequestAccessDialog";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { user, loading: authLoading } = useAuth();
  const { data: roleData } = useUserRole();
  const [showAccessDialog, setShowAccessDialog] = useState(false);

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL
  // Call all permission hooks unconditionally with safe defaults
  const singlePermissionResult = useHasPermission(permission || '');
  const allPermissionsResult = useHasAllPermissions(permissions || []);
  const anyPermissionResult = useHasAnyPermission(permissions || []);

  // If authentication is still loading, don't render anything
  if (authLoading) {
    return null;
  }

  // If user is not authenticated, don't show protected content
  if (!user) {
    return (fallback || null) as JSX.Element;
  }

  // Determine permission result based on props AFTER hooks are called
  let hasPermission: boolean | undefined = false;

  if (permission) {
    hasPermission = singlePermissionResult;
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasPermission = allPermissionsResult;
    } else {
      hasPermission = anyPermissionResult;
    }
  } else {
    // No permission specified - allow access
    hasPermission = true;
  }

  // Show loading state while permissions are being checked
  if (hasPermission === undefined) {
    return null; // Or return a loading spinner if desired
  }

  if (!hasPermission) {
    // If user has a role but no permissions, show access request dialog
    if (roleData?.role && roleData.role !== 'User') {
      return (
        <>
          <RequestAccessDialog 
            open={showAccessDialog}
            onOpenChange={setShowAccessDialog}
            userRole={roleData.role}
          />
          {fallback || (
            <div className="text-center text-muted-foreground">
              <button 
                onClick={() => setShowAccessDialog(true)}
                className="text-primary underline"
              >
                Request access
              </button>
            </div>
          )}
        </>
      );
    }
    
    return (fallback || null) as JSX.Element;
  }

  return <>{children}</>;
};