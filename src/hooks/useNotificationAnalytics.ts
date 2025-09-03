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

      // Get current month usage using raw SQL since table might not be in types yet
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase.rpc('get_notification_usage', {
        user_id_param: user.id,
        period_start_param: startOfMonth.toISOString()
      });

      if (error) {
        console.log("No usage data found:", error);
        return { email_count: 0, sms_count: 0, period_start: startOfMonth.toISOString(), period_end: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).toISOString() };
      }
      
      return data as NotificationUsage;
    },
  });
};

export const useNotificationLimits = () => {
  return useQuery({
    queryKey: ["notification-limits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // For now, return default limits since subscription system might not be fully implemented
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