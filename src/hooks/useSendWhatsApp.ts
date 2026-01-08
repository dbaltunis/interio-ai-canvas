import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionFeatures } from './useSubscriptionFeatures';
import { toast } from 'sonner';

// Helper function to log activity for WhatsApp sent
const logWhatsAppActivity = async (clientId: string, message: string, userId: string) => {
  try {
    const truncatedMessage = message && message.length > 50 ? message.substring(0, 50) + '...' : message;
    await supabase.from("client_activity_log").insert({
      client_id: clientId,
      user_id: userId,
      activity_type: "whatsapp_sent",
      title: `WhatsApp sent`,
      description: truncatedMessage || 'WhatsApp message sent',
    });
  } catch (error) {
    console.warn("Failed to log WhatsApp activity:", error);
  }
};

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
    mutationFn: async (params: SendWhatsAppParams): Promise<WhatsAppResponse & { clientId?: string; message?: string }> => {
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

      // Return data with clientId and message for activity logging
      return { ...data, clientId: params.clientId, message: params.message } as WhatsAppResponse & { clientId?: string; message?: string };
    },
    onSuccess: async (data) => {
      toast.success('WhatsApp message sent successfully');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      
      // Log activity if linked to a client
      if (data.clientId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await logWhatsAppActivity(data.clientId, data.message || '', user.id);
          queryClient.invalidateQueries({ queryKey: ['client-activities'] });
        }
      }
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
