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
      const maxRetries = 5; // Increased retries for login race condition
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle(); // Use maybeSingle to avoid throwing on 0 rows
          
          profile = result.data;
          profileError = result.error;
          
          // If profile found, break immediately
          if (profile) {
            break;
          }
          
          // If error is not a "not found" type, break
          if (profileError && profileError.code !== 'PGRST116' && profileError.code !== '406') {
            break;
          }
          
          // If not found and not last attempt, wait and retry with exponential backoff
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          }
        } catch (e) {
          console.warn(`[useUserPermissions] Profile fetch attempt ${attempt + 1} failed:`, e);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          }
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

      // ALWAYS start with role-based permissions as baseline
      // Custom permissions are ADDITIONS, never replacements
      const finalPermissions = new Set(roleBasedPermissions);
      
      // Add any custom permissions on top of role-based permissions
      if (customPermissions && customPermissions.length > 0) {
        for (const cp of customPermissions) {
          finalPermissions.add(cp.permission_name);
        }
        console.log(`[useUserPermissions] Role: ${userRole}, merged ${customPermissions.length} custom permissions with ${roleBasedPermissions.length} role permissions = ${finalPermissions.size} total`);
      } else {
        console.log(`[useUserPermissions] Role: ${userRole}, using ${roleBasedPermissions.length} role-based permissions`);
      }
      
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
  
  // CRITICAL: Return undefined during loading to prevent UI from hiding
  // Components should show content when permission is undefined (loading)
  if (isLoading) {
    return undefined;
  }
  
  // No data yet - still loading
  if (permissions === undefined) {
    return undefined;
  }
  
  // Check for permission aliases (backward compatibility)
  // If checking for old name like 'view_jobs', also check for new names like 'view_all_jobs'
  const aliasedPermissions = PERMISSION_ALIASES[permission];
  const permissionsToCheck = aliasedPermissions 
    ? [permission, ...aliasedPermissions] 
    : [permission];
  
  // Now we have actual permissions data - return true/false
  const hasPermission = permissionsToCheck.some(p => 
    permissions.some(userPerm => userPerm.permission_name === p)
  );
  
  return hasPermission;
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
