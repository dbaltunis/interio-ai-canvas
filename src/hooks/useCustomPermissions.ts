import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useValidatePermissions } from "@/hooks/usePermissionAudit";

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
  const validatePermissions = useValidatePermissions();

  return useMutation({
    mutationFn: async ({ userId, permissions }: { userId: string; permissions: string[] }) => {
      // Validate permission dependencies first
      const validation = await validatePermissions(userId, permissions);
      
      if (validation && typeof validation === 'object' && 'valid' in validation) {
        const validationResult = validation as { valid: boolean; missing_dependencies?: string[] };
        if (!validationResult.valid) {
          throw new Error(`Missing dependencies: ${validationResult.missing_dependencies?.join(', ') || 'Unknown dependencies'}`);
        }
      }
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
          granted_by: user?.id
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