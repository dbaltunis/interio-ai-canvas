
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: string;
  user_id: string;
  client_id?: string;
  campaign_id?: string;
  template_id?: string;
  recipient_email: string;
  subject: string;
  content: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  open_count: number;
  click_count: number;
  bounce_reason?: string;
  time_spent_seconds: number;
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
      return data as Email[];
    },
  });
};

export const useEmailKPIs = () => {
  return useQuery({
    queryKey: ["email-kpis"],
    queryFn: async () => {
      const { data: emails, error } = await supabase
        .from("emails")
        .select("status, open_count, click_count")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      const totalEmails = emails?.length || 0;
      const sentEmails = emails?.filter(e => ['sent', 'delivered', 'opened', 'clicked'].includes(e.status)).length || 0;
      const openedEmails = emails?.filter(e => e.open_count > 0).length || 0;
      const clickedEmails = emails?.filter(e => e.click_count > 0).length || 0;

      const openRate = sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0;
      const clickRate = sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0;

      return {
        totalEmails,
        sentEmails,
        openedEmails,
        clickedEmails,
        openRate,
        clickRate
      };
    },
  });
};

export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: Omit<Email, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("emails")
        .insert([{ ...email, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast({
        title: "Success",
        description: "Email created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating email:", error);
      toast({
        title: "Error",
        description: "Failed to create email",
        variant: "destructive",
      });
    },
  });
};
