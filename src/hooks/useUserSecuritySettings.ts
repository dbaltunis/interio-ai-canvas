import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserSecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  login_notifications: boolean;
  security_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSecuritySettings = () => {
  return useQuery({
    queryKey: ["userSecuritySettings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_security_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSecuritySettings | null;
    },
  });
};

export const useUpdateUserSecuritySettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<UserSecuritySettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_security_settings")
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSecuritySettings"] });
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating security settings:", error);
    },
  });
};