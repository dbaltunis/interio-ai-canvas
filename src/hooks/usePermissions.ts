
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

      if (error) throw error;
      return data || [];
    },
  });
};

export const useHasPermission = (permission: string) => {
  const { data: permissions } = useUserPermissions();
  return permissions?.some(p => p.permission_name === permission) || false;
};

export const useHasAnyPermission = (permissionList: string[]) => {
  const { data: permissions } = useUserPermissions();
  return permissionList.some(permission => 
    permissions?.some(p => p.permission_name === permission)
  ) || false;
};
