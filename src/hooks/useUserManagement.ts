import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Generic user management hook for account owners and managers
 * Provides consistent user management functionality across the app
 */
export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Delete existing role entries for this user
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new role entry - trigger will sync to user_profiles automatically
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: userId, 
          role: newRole as any
        });

      if (insertError) throw insertError;
      return { role: newRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Role Updated",
        description: `User role has been updated to ${data.role}. Permissions have been automatically synced.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      });
    },
  });

  const fixUserPermissions = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc('fix_user_permissions_for_role', {
        target_user_id: userId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      const permissionsAdded = result?.permissions_added || 0;
      
      if (permissionsAdded > 0) {
        toast({
          title: "Permissions Updated",
          description: `Added ${permissionsAdded} missing permissions for user.`,
        });
      } else {
        toast({
          title: "Permissions Verified",
          description: "User permissions are up to date.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user permissions",
        variant: "destructive"
      });
    },
  });

  return {
    updateUserRole,
    fixUserPermissions,
  };
};

/**
 * Role-based permission definitions
 * Keep this in sync with the database function get_default_permissions_for_role
 */
export const ROLE_PERMISSIONS = {
  Owner: [
    'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_emails', 'manage_emails',
    'view_profile'
  ],
  Admin: [
    'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings', 'manage_settings', 'manage_users',
    'view_emails', 'manage_emails',
    'view_profile'
  ],
  Manager: [
    'view_jobs', 'create_jobs', 'delete_jobs', 'view_all_jobs', 'view_all_projects',
    'view_clients', 'create_clients', 'delete_clients', 'view_all_clients',
    'view_calendar', 'create_appointments', 'delete_appointments',
    'view_inventory', 'manage_inventory',
    'view_window_treatments', 'manage_window_treatments',
    'view_analytics', 'view_settings',
    'view_emails', 'manage_emails',
    'view_profile'
  ],
  Staff: [
    'view_jobs', 'create_jobs', 'view_all_jobs', 'view_all_clients', 'view_all_projects',
    'view_clients', 'create_clients',
    'view_calendar',
    'view_inventory', 'manage_inventory',
    'view_window_treatments',
    'view_settings',
    'view_emails',
    'view_profile'
  ],
  User: [
    'view_profile'
  ]
} as const;

export type UserRole = keyof typeof ROLE_PERMISSIONS;