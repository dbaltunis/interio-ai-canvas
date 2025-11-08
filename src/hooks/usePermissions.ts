
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export const useUserPermissions = () => {
  const { user, loading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('[useUserPermissions] No user found');
        return [];
      }

      console.log('🔥🔥🔥 [PERMISSIONS] Fetching for user:', user.id, user.email);

      // Always prioritize custom permissions from user_permissions table
      const { data: customPermissions, error: customError } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);

      if (customError && customError.code !== 'PGRST116') {
        console.error('[useUserPermissions] Error fetching custom permissions:', customError);
      }

      // If custom permissions exist, use them exclusively
      if (customPermissions && customPermissions.length > 0) {
        const permissionsList = customPermissions.map(p => p.permission_name);
        console.log('🔥🔥🔥 [PERMISSIONS] ✅ USING CUSTOM PERMISSIONS:', permissionsList);
        return customPermissions.map(p => ({ permission_name: p.permission_name }));
      }

      console.log('[useUserPermissions] No custom permissions configured, using role-based permissions');

      // Otherwise, fall back to role-based permissions
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, parent_account_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        // Silently handle missing profile - this is expected for some users
        if (profileError.code === 'PGRST116') {
          console.log('[useUserPermissions] No profile found, using default permissions');
          // Return basic view permissions for users without profiles
          return [{ permission_name: 'view_profile' }];
        }
        console.error('[useUserPermissions] Profile fetch error:', profileError);
        return [];
      }

      if (!profile) {
        console.log('[useUserPermissions] No profile data found');
        return [];
      }

      console.log('[useUserPermissions] Profile found:', { role: profile.role, parent_account_id: profile.parent_account_id });

      // Define role-based permissions matching the database function
      const rolePermissions = {
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
          'view_shopify',
          'view_emails',
          'view_profile'
        ],
        Staff: [
          'view_jobs', 'create_jobs', 'edit_own_jobs',
          'view_clients', 'create_clients', 'edit_own_clients', 
          'view_calendar',
          'view_profile'
        ],
        User: [
          'view_profile'
        ]
      };

      const userRole = profile?.role || 'User';
      const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || ['view_profile'];
      
      console.log(`🔥🔥🔥 [PERMISSIONS] ✅ USING ROLE-BASED for ${userRole}:`, permissions);
      return permissions.map(permission => ({ permission_name: permission }));
    },
    enabled: !!user && !authLoading,
    staleTime: 0, // NO CACHING - always fetch fresh
    gcTime: 0, // NO CACHING
    retry: 3,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    notifyOnChangeProps: ['data', 'error'],
  });
};

export const useHasPermission = (permission: string) => {
  const { data: permissions, isLoading } = useUserPermissions();
  
  if (isLoading && permissions === undefined) return undefined;
  
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
