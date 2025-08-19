import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpdateUserData {
  userId: string;
  display_name?: string;
  role?: string;
  is_active?: boolean;
  phone_number?: string;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, ...updateData }: UpdateUserData) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // If role was updated, update permissions accordingly
      if (updateData.role) {
        // Get current user for created_by field
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // Get default permissions for the new role
        const { data: defaultPerms, error: permsError } = await supabase
          .rpc('get_default_permissions_for_role', { user_role: updateData.role });

        if (!permsError && defaultPerms) {
          // Clear existing permissions
          await supabase
            .from('user_permissions')
            .delete()
            .eq('user_id', userId);

          // Insert new permissions
          const permissionsToInsert = defaultPerms.map((perm: string) => ({
            user_id: userId,
            permission_name: perm,
            granted_by: currentUser?.id
          }));

          await supabase
            .from('user_permissions')
            .insert(permissionsToInsert);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User updated",
        description: "User profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating user:", error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User removed",
        description: "User has been removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting user:", error);
    },
  });
};