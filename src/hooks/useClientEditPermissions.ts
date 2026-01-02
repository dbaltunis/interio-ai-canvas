import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "./useUserRole";

/**
 * Hook to check if a user can edit a specific client based on explicit permissions
 * 
 * Logic:
 * - Edit Any Client: Can edit any client (if enabled)
 * - Edit Assigned Clients: Can edit clients created by them (user_id === user.id) OR assigned to them (assigned_to === user.id)
 * - Neither enabled: Cannot edit any client
 * 
 * For Owners/System Owners/Admins: Only bypass restrictions if NO explicit permissions exist in table at all
 * If ANY explicit permissions exist, respect ALL settings (missing = disabled)
 */
export const useCanEditClient = (client: any) => {
  const { user } = useAuth();
  const { data: userRoleData } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  // Fetch explicit permissions
  const { data: explicitPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[useCanEditClient] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
  
  // Check if user has ANY explicit permissions in the table
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  
  // Check if edit permissions are explicitly enabled
  // IMPORTANT: Only check if explicitPermissions is loaded (not undefined)
  const hasEditAllClientsPermission = explicitPermissions !== undefined && explicitPermissions.some(
    (p: { permission_name: string }) => p.permission_name === 'edit_all_clients'
  );
  const hasEditAssignedClientsPermission = explicitPermissions !== undefined && explicitPermissions.some(
    (p: { permission_name: string }) => p.permission_name === 'edit_assigned_clients'
  );
  
  // System Owner: ALWAYS has full access regardless of explicit permissions
  // Owner: Only bypass restrictions if NO explicit permissions exist in table at all
  // Admin: if NO explicit permissions exist, they have full access; if explicit permissions exist, MUST respect them (no bypass)
  // Staff: Always check explicit permissions (no special bypass)
  // Logic matches view permissions in ClientManagementPage - Admin gets special treatment only when no explicit permissions exist
  const canEditAllClients = userRoleData?.isSystemOwner
    ? true // System Owner ALWAYS has full access
    : isOwner && !hasAnyExplicitPermissions
      ? true // Owner with no explicit permissions = full access
      : isAdmin && !hasAnyExplicitPermissions
        ? true // Admin with no explicit permissions = full access
        : hasEditAllClientsPermission; // Owner/Admin with explicit permissions OR Staff: need edit permission
  
  const canEditAssignedClients = userRoleData?.isSystemOwner
    ? true // System Owner ALWAYS has full access
    : isOwner && !hasAnyExplicitPermissions
      ? true // Owner with no explicit permissions = full access
      : isAdmin && !hasAnyExplicitPermissions
        ? true // Admin with no explicit permissions = full access
        : hasEditAssignedClientsPermission; // Owner/Admin with explicit permissions OR Staff: need edit permission
  
  // Debug logging for permission issues
  console.log('[useCanEditClient] Permission check:', {
    isSystemOwner: userRoleData?.isSystemOwner,
    isOwner,
    isAdmin,
    hasAnyExplicitPermissions,
    hasEditAllClientsPermission,
    hasEditAssignedClientsPermission,
    canEditAllClients,
    canEditAssignedClients,
    explicitPermissions: explicitPermissions?.map(p => p.permission_name),
    explicitPermissionsCount: explicitPermissions?.length ?? 0,
    permissionsLoading,
    clientId: client?.id,
    clientCreatedBy: client?.created_by,
    userId: user?.id,
    userRoleData: {
      isOwner: userRoleData?.isOwner,
      isSystemOwner: userRoleData?.isSystemOwner,
      isAdmin: userRoleData?.isAdmin
    }
  });
  
  // Determine if this specific client can be edited
  // IMPORTANT: Wait for permissions to load before making decision
  const canEditClient = (() => {
    // If permissions are still loading, return false (will be re-evaluated when loaded)
    if (permissionsLoading || explicitPermissions === undefined) {
      return false;
    }
    
    // If both permissions are disabled, cannot edit (applies to everyone including owners/admins with explicit permissions)
    if (!canEditAllClients && !canEditAssignedClients) {
      console.log('[useCanEditClient] Both edit permissions disabled');
      return false;
    }
    
    // If both are enabled, can edit any client
    if (canEditAllClients && canEditAssignedClients) {
      return true;
    }
    
    // If only "Edit Any Client" is enabled, can edit any client
    if (canEditAllClients && !canEditAssignedClients) {
      return true;
    }
    
    // If only "Edit Assigned Clients" is enabled, can edit clients:
    // - Created by the current user (created_by === user.id), OR
    // - Assigned to the current user (assigned_to === user.id)
    // This matches the Jobs pattern where "Edit Assigned Jobs" checks both creation and assignment
    if (canEditAssignedClients && !canEditAllClients) {
      if (!client || !user) {
        console.log('[useCanEditClient] Missing client or user');
        return false;
      }
      
      // Check if client was created by the user
      const isCreatedByUser = client.created_by === user.id;
      
      // Check if client is assigned to the user
      const isAssignedToUser = client.assigned_to === user.id;
      
      // Also check user_id as fallback for older clients that might not have created_by set
      const isCreatedByUserFallback = client.created_by === null && client.user_id === user.id;
      
      const canEdit = isCreatedByUser || isAssignedToUser || isCreatedByUserFallback;
      
      console.log('[useCanEditClient] Checking edit_assigned_clients permission:', {
        clientId: client.id,
        clientName: client.name,
        userId: user.id,
        clientCreatedBy: client.created_by,
        clientAssignedTo: client.assigned_to,
        clientUserId: client.user_id,
        isCreatedByUser,
        isAssignedToUser,
        isCreatedByUserFallback,
        canEdit
      });
      
      return canEdit;
    }
    
    return false;
  })();
  
  return {
    canEditClient,
    canEditAllClients,
    canEditAssignedClients,
    isLoading: permissionsLoading,
  };
};

