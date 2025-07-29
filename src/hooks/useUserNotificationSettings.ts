import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserNotificationSettings {
  id: string;
  user_id: string;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  email_service_provider: 'resend' | 'sendgrid' | 'mailgun';
  email_api_key_encrypted?: string;
  email_from_address?: string;
  email_from_name?: string;
  sms_service_provider: 'twilio' | 'vonage';
  sms_api_key_encrypted?: string;
  sms_phone_number?: string;
  created_at: string;
  updated_at: string;
}

export const useUserNotificationSettings = () => {
  return useQuery({
    queryKey: ["user-notification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_notification_settings")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      return data as UserNotificationSettings | null;
    },
  });
};

export const useCreateOrUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<UserNotificationSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First try to update existing settings
      const { data: existingSettings } = await supabase
        .from("user_notification_settings")
        .select("id")
        .single();

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from("user_notification_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from("user_notification_settings")
          .insert({
            user_id: user.id,
            ...settings,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notification-settings"] });
      toast({
        title: "Settings updated",
        description: "Your notification settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating notification settings:", error);
    },
  });
};