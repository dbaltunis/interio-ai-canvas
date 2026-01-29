import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  digest_frequency: "never" | "daily" | "weekly";
  digest_day: string;
  digest_time: string;
  category_preferences: Record<string, boolean>;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Partial<NotificationPreferences> = {
  email_enabled: true,
  push_enabled: true,
  sms_enabled: false,
  digest_frequency: "never",
  digest_day: "monday",
  digest_time: "09:00",
  category_preferences: {
    project: true,
    appointment: true,
    quote: true,
    team: true,
    system: true,
  },
  quiet_hours_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching notification preferences:", error);
        throw error;
      }

      // Return data with defaults filled in
      if (data) {
        return {
          ...defaultPreferences,
          ...data,
        } as NotificationPreferences;
      }

      // Return null if no preferences exist yet (will use defaults in UI)
      return null;
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if preferences exist
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("notification_preferences")
          .update({
            ...preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            ...defaultPreferences,
            ...preferences,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    },
  });
};
