
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Email = Tables<"emails">;
type EmailInsert = TablesInsert<"emails">;
type EmailUpdate = TablesUpdate<"emails">;

export const useEmails = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Set up real-time subscription to automatically update when email statuses change
  useEffect(() => {
    const subscription = supabase
      .channel('emails_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emails'
        },
        () => {
          // Invalidate and refetch emails when any email changes
          queryClient.invalidateQueries({ queryKey: ["emails"] });
          queryClient.invalidateQueries({ queryKey: ["email-kpis"] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
};

export const useEmailKPIs = () => {
  return useQuery({
    queryKey: ["email-kpis"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {
        totalSent: 0,
        totalDelivered: 0,
        totalBounced: 0,
        openRate: 0,
        clickRate: 0,
        deliveryRate: 0,
        bounceRate: 0,
        avgTimeSpent: "0m 0s"
      };

      const { data: emails, error } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (!emails || emails.length === 0) {
        return {
          totalSent: 0,
          totalDelivered: 0,
          totalBounced: 0,
          openRate: 0,
          clickRate: 0,
          deliveryRate: 0,
          bounceRate: 0,
          avgTimeSpent: "0m 0s"
        };
      }

      const totalEmails = emails.length;
      const totalSent = emails.filter(email => ['sent', 'delivered'].includes(email.status)).length;
      const totalDelivered = emails.filter(email => email.status === 'delivered').length;
      const totalBounced = emails.filter(email => ['bounced', 'failed'].includes(email.status)).length;
      const totalOpened = emails.filter(email => email.open_count > 0).length;
      const totalClicked = emails.filter(email => email.click_count > 0).length;
      
      const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
      const clickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 100) : 0;
      const deliveryRate = totalEmails > 0 ? Math.round((totalDelivered / totalEmails) * 100) : 0;
      const bounceRate = totalEmails > 0 ? Math.round((totalBounced / totalEmails) * 100) : 0;
      
      const avgTimeSpentSeconds = emails.reduce((sum, email) => sum + (email.time_spent_seconds || 0), 0) / emails.length;
      const minutes = Math.floor(avgTimeSpentSeconds / 60);
      const seconds = Math.floor(avgTimeSpentSeconds % 60);
      const avgTimeSpent = `${minutes}m ${seconds}s`;

      return {
        totalSent,
        totalDelivered,
        totalBounced,
        openRate,
        clickRate,
        deliveryRate,
        bounceRate,
        avgTimeSpent
      };
    },
  });
};

export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (email: Omit<EmailInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("emails")
        .insert({
          ...email,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["email-kpis"] });
      toast({
        title: "Success",
        description: "Email created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Failed to create email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create email. Please try again.",
        variant: "destructive"
      });
    },
  });
};
