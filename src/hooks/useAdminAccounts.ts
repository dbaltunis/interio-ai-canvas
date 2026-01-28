import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountWithDetails, AccountType, SubscriptionType } from "@/types/subscriptions";
import { useToast } from "@/hooks/use-toast";

export interface InvitationEmailStatus {
  user_id: string;
  status: 'sent' | 'failed' | 'pending' | 'none';
  sent_at?: string;
  error?: string;
}

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

export const useInvitationEmailStatus = (userId: string) => {
  return useQuery({
    queryKey: ["invitationEmailStatus", userId],
    queryFn: async (): Promise<InvitationEmailStatus> => {
      const { data, error } = await supabase
        .from('emails')
        .select('status, sent_at, bounce_reason')
        .eq('user_id', userId)
        .ilike('subject', '%welcome%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching email status:', error);
        return { user_id: userId, status: 'none' };
      }

      if (!data) {
        return { user_id: userId, status: 'none' };
      }

      return {
        user_id: userId,
        status: data.status as 'sent' | 'failed' | 'pending',
        sent_at: data.sent_at || undefined,
        error: data.bounce_reason || undefined,
      };
    },
    enabled: !!userId,
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { data, error } = await supabase.functions.invoke('resend-account-invitation', {
        body: { userId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invitationEmailStatus", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      
      if (data.email_sent) {
        toast({
          title: "Invitation Resent",
          description: "A new invitation email has been sent with updated credentials.",
        });
      } else {
        toast({
          title: "Password Reset",
          description: `Password was reset but email failed: ${data.email_error}`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend invitation",
        variant: "destructive",
      });
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

export const useCreateTrialSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      trialDays = 14,
    }: {
      userId: string;
      trialDays?: number;
    }) => {
      // Calculate trial end date
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      // Create a trial subscription with the Starter plan
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: "bbebd0c6-88a5-4c37-8a10-ab51b5d9b94c", // Starter plan
          status: "trialing",
          subscription_type: "trial",
          trial_ends_at: trialEndsAt.toISOString(),
          total_users: 3, // Default trial seat limit
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAccounts"] });
      toast({
        title: "Trial subscription created",
        description: "A 14-day trial subscription has been created for this account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create trial subscription. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating trial subscription:", error);
    },
  });
};
