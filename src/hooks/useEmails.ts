
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Email = Tables<"emails">;
type EmailInsert = TablesInsert<"emails">;
type EmailUpdate = TablesUpdate<"emails">;

export const useEmails = () => {
  return useQuery({
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
};

export const useEmailKPIs = () => {
  return useQuery({
    queryKey: ["email-kpis"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {
        totalSent: 0,
        openRate: 0,
        clickRate: 0,
        deliveryRate: 0,
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
          openRate: 0,
          clickRate: 0,
          deliveryRate: 0,
          avgTimeSpent: "0m 0s"
        };
      }

      const totalSent = emails.filter(email => email.status === 'sent' || email.status === 'delivered').length;
      const totalOpened = emails.filter(email => email.open_count > 0).length;
      const totalClicked = emails.filter(email => email.click_count > 0).length;
      const totalDelivered = emails.filter(email => email.status === 'delivered').length;
      
      const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
      const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
      const deliveryRate = emails.length > 0 ? Math.round((totalDelivered / emails.length) * 100) : 0;
      
      const avgTimeSpentSeconds = emails.reduce((sum, email) => sum + (email.time_spent_seconds || 0), 0) / emails.length;
      const minutes = Math.floor(avgTimeSpentSeconds / 60);
      const seconds = Math.floor(avgTimeSpentSeconds % 60);
      const avgTimeSpent = `${minutes}m ${seconds}s`;

      return {
        totalSent,
        openRate,
        clickRate,
        deliveryRate,
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
