import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionFeatures } from './useSubscriptionFeatures';
import { toast } from 'sonner';

interface SendWhatsAppParams {
  to: string;
  message?: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  mediaUrl?: string;
  clientId?: string;
  projectId?: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageSid?: string;
  status?: string;
  error?: string;
}

export const useSendWhatsApp = () => {
  const queryClient = useQueryClient();
  const { hasFeature } = useSubscriptionFeatures();

  return useMutation({
    mutationFn: async (params: SendWhatsAppParams): Promise<WhatsAppResponse> => {
      // Validate phone number
      if (!params.to) {
        throw new Error('Phone number is required');
      }

      // Clean phone number - remove spaces, dashes, etc.
      const cleanPhone = params.to.replace(/[\s\-()]/g, '');

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          ...params,
          to: cleanPhone,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to send WhatsApp message');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as WhatsAppResponse;
    },
    onSuccess: () => {
      toast.success('WhatsApp message sent successfully');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send WhatsApp message');
    },
  });
};

export const useWhatsAppTemplates = () => {
  const { hasFeature } = useSubscriptionFeatures();
  
  return {
    canUseWhatsApp: hasFeature('whatsapp'),
  };
};
