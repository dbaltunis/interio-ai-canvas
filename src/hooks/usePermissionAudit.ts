import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PermissionAuditLog {
  id: string;
  user_id: string;
  target_user_id: string;
  permission_name: string;
  action: 'granted' | 'revoked';
  previous_value: boolean;
  new_value: boolean;
  reason?: string;
  created_at: string;
  created_by?: string;
}

export const usePermissionAuditLog = (targetUserId?: string) => {
  return useQuery({
    queryKey: ["permission-audit-log", targetUserId],
    queryFn: async (): Promise<PermissionAuditLog[]> => {
      let query = supabase
        .from('permission_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetUserId) {
        query = query.eq('target_user_id', targetUserId);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching permission audit log:', error);
        throw error;
      }

      return (data || []).map(log => ({
        ...log,
        action: log.action as 'granted' | 'revoked'
      }));
    },
    enabled: !!targetUserId,
  });
};

export const useValidatePermissions = () => {
  return async (userId: string, permissions: string[]) => {
    const { data, error } = await supabase.rpc('validate_permission_dependencies', {
      user_id_param: userId,
      permissions_param: permissions
    });

    if (error) {
      console.error('Error validating permissions:', error);
      throw error;
    }

    return data;
  };
};