import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_users: number;
  max_projects: number;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly: string;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'trial' | 'active' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string;
  canceled_at: string;
  plan: SubscriptionPlan;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly");

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
};

export const useUserSubscription = () => {
  return useQuery({
    queryKey: ["userSubscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription | null;
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // For now, create a trial subscription
      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscription"] });
      toast({
        title: "Subscription created",
        description: "Your trial subscription has been activated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating subscription:", error);
    },
  });
};