import { useHasPermission } from "@/hooks/usePermissions";

/**
 * Hook to check if a user can send emails based on permissions.
 * Uses the centralized useHasPermission hook which merges role-based + custom permissions.
 */
export const useCanSendEmails = () => {
  const canSendEmails = useHasPermission('send_emails') !== false;

  return {
    canSendEmails,
    isPermissionLoaded: true,
    isLoading: false,
  };
};
