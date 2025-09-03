import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationUsage {
  email_count: number;
  sms_count: number;
  period_start: string;
  period_end: string;
}

export interface NotificationLimits {
  email_monthly?: number;
  sms_monthly?: number;
}

export const useNotificationUsage = () => {
  return useQuery({
    queryKey: ["notification-usage"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

      // Get usage data from the database
      const { data, error } = await supabase
        .from('notification_usage')
        .select('email_count, sms_count, period_start, period_end')
        .eq('user_id', user.id)
        .eq('period_start', startOfMonth.toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching notification usage:", error);
      }

      // Return existing data or defaults for new users
      return {
        email_count: data?.email_count || 0,
        sms_count: data?.sms_count || 0,
        period_start: startOfMonth.toISOString(),
        period_end: endOfMonth.toISOString()
      } as NotificationUsage;
    },
  });
};

export const useNotificationLimits = () => {
  return useQuery({
    queryKey: ["notification-limits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // For now, return default limits since subscription system is being refactored
      return {
        plan_name: "Basic",
        limits: {
          email_monthly: 50,
          sms_monthly: 10,
        } as NotificationLimits,
      };
    },
  });
};