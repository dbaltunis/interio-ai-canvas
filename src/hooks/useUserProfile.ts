import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Retry logic for race conditions
      let data = null;
      let error = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        data = result.data;
        error = result.error;
        
        // If profile found or error is not 406/not found, break
        if (data || (error && error.code !== 'PGRST116' && error.code !== '406')) {
          break;
        }
        
        // If 406/not found and not last attempt, wait and retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
      
      // Only throw error if it's not a "not found" error (406/PGRST116)
      if (error && error.code !== 'PGRST116' && error.code !== '406') {
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Retry logic for race conditions when user is just created
      let data = null;
      let error = null;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        data = result.data;
        error = result.error;
        
        // If profile found or error is not 406/not found, break
        if (data || (error && error.code !== 'PGRST116' && error.code !== '406')) {
          break;
        }
        
        // If 406/not found and not last attempt, wait and retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
      
      // Only throw error if it's not a "not found" error (406/PGRST116)
      if (error && error.code !== 'PGRST116' && error.code !== '406') {
        throw error;
      }
      
      return data;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileData: Partial<{ 
      display_name: string;
      first_name: string;
      last_name: string;
      phone_number: string; 
      email_notifications: boolean; 
      sms_notifications: boolean; 
      default_notification_minutes: number;
      avatar_url: string;
      status_message: string;
      status: string;
      theme_preference: string;
    }>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    },
  });
};