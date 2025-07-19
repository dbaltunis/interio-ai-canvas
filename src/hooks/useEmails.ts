import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Email {
  id: string;
  user_id: string;
  client_id?: string;
  campaign_id?: string;
  template_id?: string;
  recipient_email: string;
  subject: string;
  content: string;
  status: "queued" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Email[];
    },
  });
};

export const useEmail = (id: string) => {
  return useQuery({
    queryKey: ["emails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Email;
    },
    enabled: !!id,
  });
};

export const useCreateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: Omit<Email, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("emails")
        .insert({ ...email, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Email;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: Partial<Email> & { id: string }) => {
      const { data, error } = await supabase
        .from("emails")
        .update(email)
        .eq("id", email.id)
        .select()
        .single();

      if (error) throw error;
      return data as Email;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
};

export const useDeleteEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("emails")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });
};

export const useEmailKPIs = () => {
  return useQuery({
    queryKey: ["email-kpis"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: emails } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id);

      if (!emails) return {
        totalEmails: 0,
        sentEmails: 0,
        openedEmails: 0,
        clickedEmails: 0,
        openRate: 0,
        clickRate: 0,
        totalSent: 0,
        avgTimeSpent: 0,
        deliveryRate: 0
      };

      const totalEmails = emails.length;
      const sentEmails = emails.filter(e => e.status === 'sent' || e.status === 'delivered').length;
      const openedEmails = emails.filter(e => e.open_count > 0).length;
      const clickedEmails = emails.filter(e => e.click_count > 0).length;
      const avgTimeSpent = emails.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0) / totalEmails || 0;

      return {
        totalEmails,
        sentEmails,
        openedEmails,
        clickedEmails,
        openRate: sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0,
        clickRate: sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0,
        totalSent: sentEmails,
        avgTimeSpent: Math.round(avgTimeSpent),
        deliveryRate: totalEmails > 0 ? (sentEmails / totalEmails) * 100 : 0
      };
    },
  });
};
