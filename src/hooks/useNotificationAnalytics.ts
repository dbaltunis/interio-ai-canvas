import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationUsage {
  id: string;
  user_id: string;
  email_count: number;
  sms_count: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationUsage = () => {
  return useQuery({
    queryKey: ["notification-usage"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get current month usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("notification_usage")
        .select("*")
        .eq("user_id", user.id)
        .gte("period_start", startOfMonth.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      
      return data as NotificationUsage | null;
    },
  });
};

export const useNotificationLimits = () => {
  return useQuery({
    queryKey: ["notification-limits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          subscription_plans!inner(
            name,
            notification_limits
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error) throw error;
      
      return {
        plan_name: data.subscription_plans.name,
        limits: data.subscription_plans.notification_limits as {
          email_monthly?: number;
          sms_monthly?: number;
        } | null,
      };
    },
  });
};