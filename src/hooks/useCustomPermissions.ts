import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomPermissions = (userId?: string) => {
  return useQuery({
    queryKey: ["custom-permissions", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching custom permissions:', error);
        throw error;
      }

      return data?.map(p => p.permission_name) || [];
    },
    enabled: !!userId,
  });
};

export const useUpdateCustomPermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: string[] }) => {
      // Delete existing custom permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Insert new permissions
      if (permissions.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const permissionRows = permissions.map(permission => ({
          user_id: userId,
          permission_name: permission,
          created_by: user?.id
        }));

        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionRows);

        if (error) throw error;
      }

      return permissions;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["custom-permissions", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
      toast({
        title: "Permissions updated",
        description: "Custom permissions have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating custom permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      });
    },
  });
};