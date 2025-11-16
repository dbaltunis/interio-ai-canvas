import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountWithDetails, AccountType, SubscriptionType } from "@/types/subscriptions";
import { useToast } from "@/hooks/use-toast";

export const useAdminAccounts = (filters?: {
  accountType?: AccountType;
  subscriptionStatus?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["adminAccounts", filters],
    queryFn: async (): Promise<AccountWithDetails[]> => {
      // Call edge function that has service role access
      const { data, error } = await supabase.functions.invoke('get-admin-accounts', {
        body: {
          accountType: filters?.accountType,
          subscriptionStatus: filters?.subscriptionStatus,
          search: filters?.search,
        }
      });

      if (error) {
        console.error('Error fetching admin accounts:', error);
        throw error;
      }

      return data.accounts || [];
    },
  });
};

export const useUpdateAccountType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      accountType,
    }: {
      userId: string;
      accountType: AccountType;
    }) => {
      const { error } = await supabase
        .from("user_profiles")
        .update({ account_type: accountType })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      toast({
        title: "Account type updated",
        description: "The account type has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update account type. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating account type:", error);
    },
  });
};

export const useUpdateSubscriptionType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      subscriptionType,
      adminNotes,
    }: {
      subscriptionId: string;
      subscriptionType: SubscriptionType;
      adminNotes?: string;
    }) => {
      const updateData: any = { subscription_type: subscriptionType };
      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from("user_subscriptions")
        .update(updateData)
        .eq("id", subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      toast({
        title: "Subscription updated",
        description: "The subscription has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating subscription:", error);
    },
  });
};

export const useUpdateTrialDuration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      trialEndsAt,
    }: {
      subscriptionId: string;
      trialEndsAt: string;
    }) => {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ trial_ends_at: trialEndsAt })
        .eq("id", subscriptionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      toast({
        title: "Trial duration updated",
        description: "The trial end date has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update trial duration. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating trial duration:", error);
    },
  });
};
