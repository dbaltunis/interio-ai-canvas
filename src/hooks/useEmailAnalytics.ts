import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailAnalyticsEvent {
  id: string;
  email_id: string;
  event_type: string;
  event_data?: any;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export const useEmailAnalytics = (emailId: string) => {
  return useQuery({
    queryKey: ["email-analytics", emailId],
    queryFn: async () => {
      if (!emailId) return [];

      const { data, error } = await supabase
        .from("email_analytics")
        .select("*")
        .eq("email_id", emailId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as EmailAnalyticsEvent[];
    },
    enabled: !!emailId,
  });
};