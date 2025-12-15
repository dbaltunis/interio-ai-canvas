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

// Re-export from centralized permissions for backward compatibility
export { ROLE_PERMISSIONS, type UserRole } from "@/constants/permissions";