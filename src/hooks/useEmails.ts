
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Email {
  id: string;
  subject: string;
  content: string;
  recipient_email: string;
  recipient_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  time_spent_seconds: number;
  bounce_reason?: string;
  sendgrid_message_id?: string;
  template_id?: string;
  campaign_id?: string;
  client_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useEmails = () => {
  return useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Ensure time_spent_seconds has a default value of 0 if null
      return (data as any[]).map(email => ({
        ...email,
        time_spent_seconds: email.time_spent_seconds || 0
      })) as Email[];
    },
  });
};

export const useEmailKPIs = () => {
  return useQuery({
    queryKey: ["email-kpis"],
    queryFn: async () => {
      const { data: emails, error } = await supabase
        .from("emails")
        .select("*");
      
      if (error) throw error;
      
      const totalSent = emails?.filter(e => !['draft', 'queued'].includes(e.status)).length || 0;
      const totalOpened = emails?.filter(e => e.open_count > 0).length || 0;
      const totalClicked = emails?.filter(e => e.click_count > 0).length || 0;
      const totalDelivered = emails?.filter(e => e.status === 'delivered').length || 0;
      const totalBounced = emails?.filter(e => e.status === 'bounced').length || 0;
      
      const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
      const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
      const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0;
      
      const totalOpenCount = emails?.reduce((sum, e) => sum + (e.open_count || 0), 0) || 0;
      
      // Return data in the format expected by EmailKPIsDashboard
      return {
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_opened: totalOpenCount,
        total_clicked: totalClicked,
        open_rate: openRate,
        click_rate: clickRate,
        bounce_rate: bounceRate,
        issues_count: totalBounced
      };
    },
  });
};
