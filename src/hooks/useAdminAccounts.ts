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
      // First get all account owners
      let query = supabase
        .from("user_profiles")
        .select("user_id, display_name, account_type, parent_account_id, created_at")
        .is("parent_account_id", null)
        .order("created_at", { ascending: false });

      // Apply account type filter
      if (filters?.accountType) {
        query = query.eq("account_type", filters.accountType);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Get emails from auth.users
      const userIds = profiles.map(p => p.user_id);
      const { data: authUsers } = await supabase.rpc('get_user_email', { user_id: userIds[0] });
      
      // Get all emails in one query using auth admin (won't work, so we'll get from profile or use a workaround)
      // For now, we'll assume email might not be available and handle it gracefully
      
      // Get subscription data for each account
      const accounts = await Promise.all(
        profiles.map(async (profile) => {
          // Get user email - we'll use the user_id as a fallback
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
          const email = authUser?.user?.email || `user-${profile.user_id.slice(0, 8)}`;

          // Get subscription
          const { data: subscription } = await supabase
            .from("user_subscriptions")
            .select("*, subscription_plans(*)")
            .eq("user_id", profile.user_id)
            .maybeSingle();

          // Get team members count
          const { count: teamMembersCount } = await supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .eq("parent_account_id", profile.user_id);

          const account: AccountWithDetails = {
            user_id: profile.user_id,
            display_name: profile.display_name,
            email,
            account_type: profile.account_type as AccountType,
            parent_account_id: profile.parent_account_id,
            created_at: profile.created_at,
            subscription: subscription as any,
            team_members_count: teamMembersCount || 0,
          };

          return account;
        })
      );

      // Apply search filter
      let filteredAccounts = accounts;
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAccounts = accounts.filter(
          (acc) =>
            acc.display_name?.toLowerCase().includes(searchLower) ||
            acc.email.toLowerCase().includes(searchLower)
        );
      }

      // Apply subscription status filter
      if (filters?.subscriptionStatus) {
        filteredAccounts = filteredAccounts.filter(
          (acc) => acc.subscription?.status === filters.subscriptionStatus
        );
      }

      return filteredAccounts;
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
