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
      const { error } = await supabase.rpc('delete_user_cascade', {
        target_user_id: userId
      });

      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast({
        title: "User removed",
        description: "User has been removed from the system.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to remove user. Please try again.";
      toast({
        title: "Error", 
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error deleting user:", error);
    },
  });
};