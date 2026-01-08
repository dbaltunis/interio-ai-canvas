import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AccountStatus = 'active' | 'blocked' | 'trial_ended' | 'suspended';

export interface BlockAccountParams {
  userId: string;
  status: AccountStatus;
  reason?: string;
}

export const useBlockAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, status, reason }: BlockAccountParams) => {
      // Use edge function with service role to bypass RLS
      const { data, error } = await supabase.functions.invoke('admin-block-account', {
        body: { userId, status, reason }
      });

      if (error) {
        console.error('Block account error:', error);
        throw new Error(error.message || 'Failed to block account');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return { userId, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-status", data.userId] });
      
      const message = data.status === 'active' 
        ? "Account has been unblocked and is now active."
        : `Account has been ${data.status === 'trial_ended' ? 'marked as trial ended' : data.status}.`;
      
      toast({
        title: data.status === 'active' ? "Account Unblocked" : "Account Status Updated",
        description: message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update account status.",
        variant: "destructive",
      });
      console.error("Error updating account status:", error);
    },
  });
};

// Hook to check current user's account status
export const useAccountStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["account-status", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('account_status, blocked_reason, blocked_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching account status:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!userId,
    staleTime: 30000, // Cache for 30 seconds
  });
};
