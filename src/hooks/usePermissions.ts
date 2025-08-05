
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ["user-permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          permission_name,
          permissions (
            name,
            description,
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user permissions:', error);
        throw error;
      }
      console.log('User permissions fetched:', data);
      return data || [];
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
