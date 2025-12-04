import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

// Role-based permissions - ALWAYS used as baseline for all users
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'System Owner': [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_shopify', 'manage_shopify',
    'view_emails',
    'view_profile',
    'manage_admin_accounts',
    'view_all_accounts',
    'manage_system_settings'
  ],
  Owner: [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_shopify', 'manage_shopify',
    'view_emails',
    'view_profile'
  ],
  Admin: [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments', 
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings',
    'view_shopify', 'manage_shopify',
    'view_emails',
    'view_profile'
  ],
  Manager: [
    'view_jobs', 'create_jobs', 'edit_all_jobs', 'edit_own_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'edit_all_clients', 'edit_own_clients', 'view_all_clients',
    'view_calendar', 'create_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings',
    'view_emails',
    'view_profile'
  ],
  Staff: [
    'view_jobs', 'create_jobs', 'edit_own_jobs',
    'view_clients', 'create_clients', 'edit_own_clients', 
    'view_calendar',
    'view_inventory',
    'view_window_treatments',
    'view_profile'
  ],
  User: [
    'view_profile'
  ]
};

export const useUserPermissions = () => {
  const { user, loading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('[useUserPermissions] Error fetching user profile:', profileError);
        return [];
      }

      const userRole = profile?.role || 'User';
      
      // ALWAYS start with role-based permissions as the baseline
      const roleBasedPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || ['view_profile'];
      
      // Check if there are custom permission overrides
      const { data: customPermissions, error: customError } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);

      if (customError && customError.code !== 'PGRST116') {
        console.error('[useUserPermissions] Error fetching custom permissions:', customError);
      }

      // If no custom permissions configured, use role-based permissions
      if (!customPermissions || customPermissions.length === 0) {
        console.log(`[useUserPermissions] Using role-based permissions for ${userRole}`);
        return roleBasedPermissions.map(p => ({ permission_name: p }));
      }

      // Custom permissions exist - these are ADDITIONS to role-based permissions
      // or a complete override depending on use case
      // For now: use custom permissions but ensure minimum baseline
      const customPermissionNames = customPermissions.map(p => p.permission_name);
      
      // Always include view_profile as minimum
      const finalPermissions = new Set([...customPermissionNames, 'view_profile']);
      
      console.log(`[useUserPermissions] Using custom permissions for ${userRole}:`, Array.from(finalPermissions));
      return Array.from(finalPermissions).map(p => ({ permission_name: p }));
    },
    enabled: !!user && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

export const useHasPermission = (permission: string) => {
  const { data: permissions, isLoading } = useUserPermissions();
  
  if (isLoading || permissions === undefined) return undefined;
  
  return permissions?.some(p => p.permission_name === permission) || false;
};

export const useHasAnyPermission = (permissionList: string[]) => {
  const { data: permissions, isLoading } = useUserPermissions();
  if (isLoading && permissions === undefined) return undefined;
  return permissionList.some(permission => 
    permissions?.some(p => p.permission_name === permission)
  ) || false;
};

export const useHasAllPermissions = (permissionList: string[]) => {
  const { data: permissions, isLoading } = useUserPermissions();
  if (isLoading && permissions === undefined) return undefined;
  return permissionList.every(permission => 
    permissions?.some(p => p.permission_name === permission)
  );
};
