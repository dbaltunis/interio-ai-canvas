import { useHasPermission } from "@/hooks/usePermissions";

/**
 * Hook to check if a user can view email KPIs based on permissions.
 * Uses the centralized useHasPermission hook which merges role-based + custom permissions.
 */
export const useCanViewEmailKPIs = () => {
  const canViewEmailKPIs = useHasPermission('view_email_kpis') !== false;

  return {
    canViewEmailKPIs,
    isPermissionLoaded: true,
    isLoading: false,
  };
};
