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
  const hasEditAllClientsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'edit_all_clients'
  ) ?? false;
  const hasEditAssignedClientsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'edit_assigned_clients'
  ) ?? false;
  
  // System Owner and Owner: ALWAYS have full access regardless of explicit permissions
  // Admin: Only bypass restrictions if NO explicit permissions exist in table at all
  // If ANY explicit permissions exist for Admin, respect ALL settings (missing = disabled)
  const canEditAllClients = userRoleData?.isSystemOwner || isOwner
    ? true // System Owner and Owner ALWAYS have full access
    : isAdmin && !hasAnyExplicitPermissions 
      ? true // Admin with no explicit permissions = full access
      : hasEditAllClientsPermission;
  
  const canEditAssignedClients = userRoleData?.isSystemOwner || isOwner
    ? true // System Owner and Owner ALWAYS have full access
    : isAdmin && !hasAnyExplicitPermissions
      ? true // Admin with no explicit permissions = full access
      : hasEditAssignedClientsPermission;
  
  // Debug logging for admin permission issues
  if (isAdmin && hasAnyExplicitPermissions) {
    console.log('[useCanEditClient] Admin with explicit permissions:', {
      hasAnyExplicitPermissions,
      hasEditAllClientsPermission,
      hasEditAssignedClientsPermission,
      canEditAllClients,
      canEditAssignedClients,
      explicitPermissions: explicitPermissions?.map(p => p.permission_name)
    });
  }
  
  // Determine if this specific client can be edited
  const canEditClient = (() => {
    // If both permissions are disabled, cannot edit (applies to everyone including owners/admins with explicit permissions)
    if (!canEditAllClients && !canEditAssignedClients) {
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
    // 1. Created by them (client.user_id === user.id), OR
    // 2. Assigned to them (client.assigned_to === user.id)
    if (canEditAssignedClients && !canEditAllClients) {
      if (!client || !user) return false;
      
      // Check if client was created by the user
      const isCreatedByUser = client.user_id === user.id;
      
      // Check if client is assigned to the user
      const isAssignedToUser = client.assigned_to === user.id;
      
      return isCreatedByUser || isAssignedToUser;
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

