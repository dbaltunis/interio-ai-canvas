import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CampaignExecutionData {
  campaignId: string;
  campaignData: {
    name: string;
    subject: string;
    content: string;
    selectedClients: any[];
    personalization: {
      useClientName: boolean;
      useCompanyName: boolean;
    };
  };
}

export const useCampaignExecution = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, campaignData }: CampaignExecutionData) => {
      console.log("Queuing campaign for server-side execution:", campaignId);

      // 1. Save recipients to campaign_recipients table (server-side record)
      const recipientInserts = campaignData.selectedClients
        .filter(c => c.email)
        .map(c => ({
          campaign_id: campaignId,
          client_id: c.id,
          email: c.email,
          name: c.name || null,
          status: 'pending' as const,
        }));

      if (recipientInserts.length === 0) {
        throw new Error("No recipients with email addresses selected");
      }

      const { error: insertError } = await (supabase
        .from('campaign_recipients' as any)
        .insert(recipientInserts) as any);

      if (insertError) {
        console.error("Failed to save campaign recipients:", insertError);
        throw new Error(`Failed to save recipients: ${insertError.message}`);
      }

      console.log(`Saved ${recipientInserts.length} recipients, triggering server-side execution`);

      // 2. Trigger server-side campaign execution (returns quickly, processes in background)
      const { data, error } = await supabase.functions.invoke('execute-campaign', {
        body: { campaignId },
      });

      if (error) {
        console.error("Campaign execution trigger error:", error);
        throw new Error(error.message || "Failed to trigger campaign execution");
      }

      return {
        total: recipientInserts.length,
        success: data?.sent ?? recipientInserts.length,
        failures: data?.failed ?? 0,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });

      toast({
        title: "Campaign Launched",
        description: `${data.total} emails queued for delivery. Campaign is processing server-side.`,
      });
    },
    onError: (error) => {
      console.error("Campaign execution error:", error);
      toast({
        title: "Campaign Launch Failed",
        description: "There was an error launching your campaign. Please try again.",
        variant: "destructive",
      });
    },
  });
};
