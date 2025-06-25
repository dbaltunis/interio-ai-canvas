
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Email {
  id: string;
  user_id: string;
  campaign_id?: string;
  template_id?: string;
  client_id?: string;
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  content: string;
  status: 'draft' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  time_spent_seconds: number;
  bounce_reason?: string;
  sendgrid_message_id?: string;
  created_at: string;
  updated_at: string;
}

export const useEmails = () => {
  return useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Email[];
    },
  });
};

export const useEmailKPIs = () => {
  return useQuery({
    queryKey: ['email-kpis'],
    queryFn: async () => {
      const { data: emails, error } = await supabase
        .from('emails')
        .select('*');
      
      if (error) throw error;
      
      const totalSent = emails.filter(email => email.status !== 'draft').length;
      const delivered = emails.filter(email => email.status === 'delivered' || email.status === 'opened' || email.status === 'clicked').length;
      const opened = emails.filter(email => email.open_count > 0).length;
      const clicked = emails.filter(email => email.click_count > 0).length;
      const bounced = emails.filter(email => email.status === 'bounced').length;
      
      const openRate = totalSent > 0 ? (opened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (clicked / totalSent) * 100 : 0;
      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      
      const totalTimeSpent = emails.reduce((sum, email) => sum + (email.time_spent_seconds || 0), 0);
      const avgTimeSpent = opened > 0 ? Math.round(totalTimeSpent / opened) : 0;
      
      return {
        totalSent,
        delivered,
        bounced,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        avgTimeSpent: `${Math.floor(avgTimeSpent / 60)}m ${avgTimeSpent % 60}s`,
        totalOpenCount: emails.reduce((sum, email) => sum + email.open_count, 0),
        totalClickCount: emails.reduce((sum, email) => sum + email.click_count, 0)
      };
    },
  });
};

export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (emailData: Omit<Email, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('emails')
        .insert([{ ...emailData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      queryClient.invalidateQueries({ queryKey: ['email-kpis'] });
      toast({
        title: "Success",
        description: "Email created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create email",
        variant: "destructive",
      });
    },
  });
};
