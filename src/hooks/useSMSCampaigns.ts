import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SMSCampaign {
  id: string;
  user_id: string;
  name: string;
  message: string;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
}

export const useSMSCampaigns = () => {
  return useQuery({
    queryKey: ["sms-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SMSCampaign[];
    },
  });
};

export const useCreateSMSCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: Omit<SMSCampaign, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("sms_campaigns")
        .insert([{ ...campaign, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
      toast.success("SMS campaign created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create SMS campaign: ${error.message}`);
    },
  });
};

export const useUpdateSMSCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SMSCampaign> }) => {
      const { data, error } = await supabase
        .from("sms_campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
      toast.success("SMS campaign updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update SMS campaign: ${error.message}`);
    },
  });
};

export const useSendSMSCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, phoneNumbers }: { campaignId: string; phoneNumbers: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("sms_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Send SMS via edge function
      const { data, error } = await supabase.functions.invoke("send-bulk-sms", {
        body: {
          campaignId,
          phoneNumbers,
          message: campaign.message,
          userId: user.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sms-campaigns"] });
      toast.success(`SMS campaign sent: ${data.sentCount} sent, ${data.failedCount} failed`);
    },
    onError: (error: any) => {
      toast.error(`Failed to send SMS campaign: ${error.message}`);
    },
  });
};