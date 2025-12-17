import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_PERMISSIONS, PERMISSION_ALIASES } from "@/constants/permissions";

export const useUserPermissions = () => {
  const { user, loading: authLoading } = useAuth();
  
  return useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      // Fetch user profile to get role with retry logic for race conditions
      let profile = null;
      let profileError = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        profile = result.data;
        profileError = result.error;
        
        // If profile found or error is not 406/not found, break
        if (profile || (profileError && profileError.code !== 'PGRST116' && profileError.code !== '406')) {
          break;
        }
        
        // If 406/not found and not last attempt, wait and retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[useUserPermissions] Error fetching user profile:', profileError);
        // Don't return empty array immediately - try to use default role
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
  
  // Check for permission aliases (backward compatibility)
  // If checking for old name like 'view_jobs', also check for new names like 'view_all_jobs'
  const aliasedPermissions = PERMISSION_ALIASES[permission];
  const permissionsToCheck = aliasedPermissions 
    ? [permission, ...aliasedPermissions] 
    : [permission];
  
  return permissionsToCheck.some(p => 
    permissions?.some(userPerm => userPerm.permission_name === p)
  ) || false;
};

export const useHasAnyPermission = (permissionList: string[]) => {
  const { data: permissions, isLoading, isError, error } = useUserPermissions();
  
  // Log errors for debugging
  if (isError) {
    console.error('[useHasAnyPermission] Permission query error:', error);
  }
  
  // Still loading and no cached data
  if (isLoading && permissions === undefined) return undefined;
  
  // If there was an error loading permissions, return undefined to allow fallback handling
  if (isError && permissions === undefined) {
    console.warn('[useHasAnyPermission] Permission error with no cached data, returning undefined for fallback handling');
    return undefined;
  }
  
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
