import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "./useUserRole";

/**
 * Hook to check if a user can send emails based on explicit permissions
 * 
 * Logic matches view/edit permissions pattern:
 * - System Owner: ALWAYS has full access regardless of explicit permissions
 * - Owner: Only bypass restrictions if NO explicit permissions exist in table at all
 * - Admin: if NO explicit permissions exist, they have full access; if explicit permissions exist, MUST respect them (no bypass)
 * - Staff: Always check explicit permissions (no special bypass)
 */
export const useCanSendEmails = () => {
  const { user } = useAuth();
  const { data: userRoleData, isLoading: userRoleLoading } = useUserRole();
  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;
  
  // Fetch explicit permissions from user_permissions table (not merged with role-based)
  const { data: explicitPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['explicit-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) {
        console.error('[useCanSendEmails] Error fetching explicit permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
  
  // Check if user has ANY explicit permissions in the table
  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;
  
  // Check if send_emails is explicitly enabled
  const hasSendEmailsPermission = explicitPermissions !== undefined && explicitPermissions.some(
    (p: { permission_name: string }) => p.permission_name === 'send_emails'
  );

  // System Owner: ALWAYS has full access regardless of explicit permissions
  // Owner: Only bypass restrictions if NO explicit permissions exist in table at all
  // Admin: if NO explicit permissions exist, they have full access; if explicit permissions exist, MUST respect them (no bypass)
  // Staff: Always check explicit permissions (no special bypass)
  // Logic matches view/edit permissions pattern
  const canSendEmails = userRoleData?.isSystemOwner
    ? true // System Owner ALWAYS has full access
    : isOwner && !hasAnyExplicitPermissions
      ? true // Owner with no explicit permissions = full access
      : isAdmin && !hasAnyExplicitPermissions
        ? true // Admin with no explicit permissions = full access
        : hasSendEmailsPermission; // Owner/Admin with explicit permissions OR Staff: need send_emails permission

  const isPermissionLoaded = explicitPermissions !== undefined && !userRoleLoading && !permissionsLoading;
  
  return {
    canSendEmails,
    isPermissionLoaded,
    isLoading: permissionsLoading || userRoleLoading,
  };
};

