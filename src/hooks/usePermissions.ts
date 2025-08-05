
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First try to get custom permissions from user_permissions table
      const { data: customPermissions, error: customError } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);

      if (customError && customError.code !== 'PGRST116') {
        console.error('Error fetching custom permissions:', customError);
      }

      // If user has custom permissions, use those
      if (customPermissions && customPermissions.length > 0) {
        console.log('Using custom permissions:', customPermissions);
        return customPermissions.map(p => ({ permission_name: p.permission_name }));
      }

      // Otherwise, fall back to role-based permissions
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return [];
      }

      // Define role-based permissions
      const rolePermissions = {
        Owner: [
          'view_jobs', 'create_jobs', 'delete_jobs',
          'view_clients', 'create_clients', 'delete_clients', 
          'view_calendar', 'create_appointments', 'delete_appointments',
          'view_inventory', 'manage_inventory',
          'view_window_treatments', 'manage_window_treatments',
          'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
          'view_profile'
        ],
        Admin: [
          'view_jobs', 'create_jobs', 'delete_jobs',
          'view_clients', 'create_clients', 'delete_clients',
          'view_calendar', 'create_appointments', 'delete_appointments', 
          'view_inventory', 'manage_inventory',
          'view_window_treatments', 'manage_window_treatments',
          'view_analytics', 'view_settings',
          'view_profile'
        ],
        Manager: [
          'view_jobs', 'create_jobs',
          'view_clients', 'create_clients',
          'view_calendar', 'create_appointments',
          'view_inventory', 'manage_inventory',
          'view_window_treatments', 'manage_window_treatments',
          'view_analytics',
          'view_profile'
        ],
        Staff: [
          'view_jobs', 'create_jobs',
          'view_clients', 'create_clients', 
          'view_calendar',
          'view_inventory',
          'view_profile'
        ]
      };

      const userRole = profile?.role || 'Staff';
      const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
      
      console.log(`Using role-based permissions for ${userRole}:`, permissions);
      return permissions.map(permission => ({ permission_name: permission }));
    },
    staleTime: 30 * 1000, // 30 seconds - shorter for more frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: true,
  });
};

export const useHasPermission = (permission: string) => {
  const { data: permissions, isLoading } = useUserPermissions();
  
  // Return false only if we're done loading and don't have the permission
  // While loading, return undefined to prevent premature denials
  if (isLoading) return undefined;
  
  return permissions?.some(p => p.permission_name === permission) || false;
};

export const useHasAnyPermission = (permissionList: string[]) => {
  const { data: permissions, isLoading } = useUserPermissions();
  
  // Return false only if we're done loading and don't have any permissions
  // While loading, return undefined to prevent premature denials
  if (isLoading) return undefined;
  
  return permissionList.some(permission => 
    permissions?.some(p => p.permission_name === permission)
  ) || false;
};
