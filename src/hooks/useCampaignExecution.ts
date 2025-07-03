import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSendEmail } from "./useSendEmail";
import { useUpdateEmailCampaign } from "./useEmailCampaigns";

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
  const sendEmailMutation = useSendEmail();
  const updateCampaignMutation = useUpdateEmailCampaign();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, campaignData }: CampaignExecutionData) => {
      console.log("Executing campaign:", campaignId, "with data:", campaignData);

      // Update campaign status to sending
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        status: 'sending',
        sent_at: new Date().toISOString()
      });

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Send emails to each recipient
      for (const client of campaignData.selectedClients) {
        if (!client.email) continue;

        try {
          // Personalize content
          let personalizedContent = campaignData.content;
          let personalizedSubject = campaignData.subject;

          if (campaignData.personalization.useClientName) {
            personalizedContent = personalizedContent.replace(/\{\{client_name\}\}/g, client.name || 'Valued Client');
            personalizedSubject = personalizedSubject.replace(/\{\{client_name\}\}/g, client.name || 'Valued Client');
          }

          if (campaignData.personalization.useCompanyName) {
            personalizedContent = personalizedContent.replace(/\{\{company_name\}\}/g, client.company_name || client.name);
            personalizedSubject = personalizedSubject.replace(/\{\{company_name\}\}/g, client.company_name || client.name);
          }

          await sendEmailMutation.mutateAsync({
            to: client.email,
            subject: personalizedSubject,
            content: personalizedContent,
            campaign_id: campaignId,
            client_id: client.id
          });

          results.push({ client: client.email, status: 'sent' });
          successCount++;

          // Add small delay to avoid overwhelming the email service
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Failed to send email to ${client.email}:`, error);
          results.push({ client: client.email, status: 'failed', error: error.message });
          failureCount++;
        }
      }

      // Update campaign status to completed
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        status: 'completed',
        recipient_count: campaignData.selectedClients.length
      });

      return {
        total: campaignData.selectedClients.length,
        success: successCount,
        failures: failureCount,
        results
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      
      toast({
        title: "Campaign Launched Successfully",
        description: `Sent ${data.success} emails successfully${data.failures > 0 ? `, ${data.failures} failed` : ''}`,
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