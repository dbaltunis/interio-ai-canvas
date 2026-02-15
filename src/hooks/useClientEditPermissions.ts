import { useAuth } from "@/components/auth/AuthProvider";
import { useHasPermission } from "@/hooks/usePermissions";

/**
 * Hook to check if a user can edit a specific client based on permissions
 *
 * Logic:
 * - Edit Any Client: Can edit any client (if enabled)
 * - Edit Assigned Clients: Can edit clients created by them (user_id === user.id) OR assigned to them (assigned_to === user.id)
 * - Neither enabled: Cannot edit any client
 */
export const useCanEditClient = (client: any) => {
  const { user } = useAuth();

  const canEditAllClients = useHasPermission('edit_all_clients') !== false;
  const canEditAssignedClients = useHasPermission('edit_assigned_clients') !== false;

  // Determine if this specific client can be edited
  const canEditClient = (() => {
    // If both permissions are disabled, cannot edit
    if (!canEditAllClients && !canEditAssignedClients) {
      return false;
    }

    // If edit all clients is enabled, can edit any client
    if (canEditAllClients) {
      return true;
    }

    // If only "Edit Assigned Clients" is enabled, can edit clients:
    // - Created by the current user (created_by === user.id), OR
    // - Assigned to the current user (assigned_to === user.id)
    if (canEditAssignedClients && !canEditAllClients) {
      if (!client || !user) {
        return false;
      }

      const isCreatedByUser = client.created_by === user.id;
      const isAssignedToUser = client.assigned_to === user.id;
      const isCreatedByUserFallback = client.created_by === null && client.user_id === user.id;

      return isCreatedByUser || isAssignedToUser || isCreatedByUserFallback;
    }

    return false;
  })();

  return {
    canEditClient,
    canEditAllClients,
    canEditAssignedClients,
    isLoading: false,
  };
};
