import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export const useFeatureFlags = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["featureFlags", user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data, error } = await supabase
        .from("app_user_flags")
        .select("flag, enabled")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Convert array to object for easier access
      return data.reduce((acc, item) => {
        acc[item.flag] = item.enabled;
        return acc;
      }, {} as Record<string, boolean>);
    },
    enabled: !!user,
  });
};

export const useFeatureFlag = (flag: string) => {
  const { data: flags } = useFeatureFlags();
  return flags?.[flag] || false;
};

export const useUpdateFeatureFlag = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ flag, enabled }: { flag: string; enabled: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("app_user_flags")
        .upsert({
          user_id: user.id,
          flag,
          enabled,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureFlags", user?.id] });
    },
  });
};