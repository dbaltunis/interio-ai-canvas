import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserPermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";

export const useCalendarPermissions = () => {
  const { user } = useAuth();
  const { data: userRoleData, isLoading: roleLoading } = useUserRole();
  const { data: _userPermissions, isLoading: permissionsLoading } = useUserPermissions();

  const { data: explicitPermissions } = useQuery({
    queryKey: ['explicit-user-permissions-calendar', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', user.id);
      if (error) return [];
      return data || [];
    },
    enabled: !!user && !permissionsLoading,
  });

  const isOwner = userRoleData?.isOwner || userRoleData?.isSystemOwner || false;
  const isAdmin = userRoleData?.isAdmin || false;

  const hasCreateAppointmentsPermission = explicitPermissions?.some(
    (p: { permission_name: string }) => p.permission_name === 'create_appointments'
  ) ?? false;

  const hasAnyExplicitPermissions = (explicitPermissions?.length ?? 0) > 0;

  const canCreateAppointments = userRoleData?.isSystemOwner
    ? true
    : (isOwner || isAdmin)
      ? !hasAnyExplicitPermissions || hasCreateAppointmentsPermission
      : hasCreateAppointmentsPermission;

  const isPermissionLoaded = explicitPermissions !== undefined && !permissionsLoading && !roleLoading;

  return { canCreateAppointments, isPermissionLoaded, isOwner, isAdmin, explicitPermissions };
};
