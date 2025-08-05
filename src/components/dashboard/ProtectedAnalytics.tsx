import { useHasPermission } from "@/hooks/usePermissions";
import { ReactNode } from "react";

interface ProtectedAnalyticsProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedAnalytics = ({ children, fallback }: ProtectedAnalyticsProps) => {
  const canViewAnalytics = useHasPermission('view_analytics');

  // Show nothing while loading permissions
  if (canViewAnalytics === undefined) {
    return null;
  }

  if (!canViewAnalytics) {
    return fallback || (
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Analytics Access Required</h3>
        <p className="text-muted-foreground">You need analytics permissions to view this data.</p>
      </div>
    );
  }

  return <>{children}</>;
};