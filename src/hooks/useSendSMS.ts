import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendSMSParams {
  to: string;
  message: string;
  clientName?: string;
}

export const useSendSMS = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ to, message, clientName }: SendSMSParams) => {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to,
          message,
          clientName
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "SMS Sent",
        description: `SMS sent successfully to ${variables.to}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "SMS Failed",
        description: error.message || "Failed to send SMS. Please try again.",
        variant: "destructive"
      });
    },
  });
};