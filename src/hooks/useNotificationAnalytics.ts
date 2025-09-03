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

      // For now, return mock data since notification_usage table may not be fully set up
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

      // TODO: Replace with actual database query when notification_usage table is properly configured
      return { 
        email_count: 5, // Mock data - will be replaced with real data
        sms_count: 2,   // Mock data - will be replaced with real data
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