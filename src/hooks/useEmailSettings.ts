
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmailSettings {
  id: string;
  user_id: string;
  from_email: string;
  from_name: string;
  reply_to_email?: string;
  signature?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailSettings = () => {
  return useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as EmailSettings | null;
    },
  });
};

export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<Omit<EmailSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure required fields are present
      if (!settings.from_email || !settings.from_name) {
        throw new Error('from_email and from_name are required');
      }

      const { data, error } = await supabase
        .from('email_settings')
        .upsert({
          user_id: user.id,
          from_email: settings.from_email,
          from_name: settings.from_name,
          reply_to_email: settings.reply_to_email,
          signature: settings.signature,
          active: settings.active ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update email settings",
        variant: "destructive",
      });
    },
  });
};
