import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AccountSettings {
  id: string;
  account_owner_id: string;
  business_settings: any;
  integration_settings: any;
  language: string;
  currency: string;
  measurement_units: any;
  created_at: string;
  updated_at: string;
}

export const useAccountSettings = () => {
  return useQuery({
    queryKey: ["accountSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as AccountSettings;
    },
  });
};

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<AccountSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("account_settings")
        .upsert({
          account_owner_id: user.id,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountSettings"] });
      toast({
        title: "Settings updated",
        description: "Account settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update account settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating account settings:", error);
    },
  });
};

export const useUserAccountInfo = () => {
  return useQuery({
    queryKey: ["userAccountInfo"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*, parent_account:parent_account_id(user_id, display_name, role)")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
};