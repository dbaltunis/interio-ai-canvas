import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminAccountStats } from "@/types/subscriptions";

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<AdminAccountStats> => {
      // Get total accounts (where parent_account_id IS NULL = account owners)
      const { count: totalAccounts } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .is("parent_account_id", null);

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get trial subscriptions
      const { count: trialSubscriptions } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "trial");

      // Calculate monthly revenue (active subscriptions only)
      const { data: activeSubsData } = await supabase
        .from("user_subscriptions")
        .select("plan_id, subscription_plans(price_monthly)")
        .eq("status", "active");

      const monthlyRevenue = activeSubsData?.reduce((sum, sub: any) => {
        return sum + (sub.subscription_plans?.price_monthly || 0);
      }, 0) || 0;

      // Get new signups this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count: newSignupsThisMonth } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .is("parent_account_id", null)
        .gte("created_at", monthStart.toISOString());

      // Get new signups this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { count: newSignupsThisWeek } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .is("parent_account_id", null)
        .gte("created_at", weekStart.toISOString());

      return {
        totalAccounts: totalAccounts || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialSubscriptions: trialSubscriptions || 0,
        monthlyRevenue,
        newSignupsThisMonth: newSignupsThisMonth || 0,
        newSignupsThisWeek: newSignupsThisWeek || 0,
      };
    },
  });
};

export const useAdminSignupsChart = (days: number = 30) => {
  return useQuery({
    queryKey: ["adminSignupsChart", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("created_at")
        .is("parent_account_id", null)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const signupsByDate = data.reduce((acc: Record<string, number>, profile) => {
        const date = new Date(profile.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Fill in missing dates with 0
      const chartData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        chartData.push({
          date: dateStr,
          signups: signupsByDate[dateStr] || 0,
        });
      }

      return chartData;
    },
  });
};
