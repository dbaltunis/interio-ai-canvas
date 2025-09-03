
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

      // First try to get user's own email settings
      let { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no settings found, try to get account owner's settings
      if (!data) {
        const { data: accountOwnerId } = await supabase
          .rpc('get_account_owner', { user_id_param: user.id });

        if (accountOwnerId && accountOwnerId !== user.id) {
          const { data: ownerSettings, error: ownerError } = await supabase
            .from('email_settings')
            .select('*')
            .eq('user_id', accountOwnerId)
            .maybeSingle();

          if (ownerError && ownerError.code !== 'PGRST116') {
            console.error('Error fetching account owner email settings:', ownerError);
          } else {
            data = ownerSettings;
          }
        }
      }
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email settings:', error);
      }
      
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

      console.log('Attempting to save email settings:', settings);

      // Ensure required fields are present
      if (!settings.from_email || !settings.from_name) {
        throw new Error('from_email and from_name are required');
      }

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('email_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      
      if (existingSettings) {
        // Update existing settings
        console.log('Updating existing email settings');
        const { data, error } = await supabase
          .from('email_settings')
          .update({
            from_email: settings.from_email,
            from_name: settings.from_name,
            reply_to_email: settings.reply_to_email || null,
            signature: settings.signature || null,
            active: settings.active ?? true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new settings
        console.log('Creating new email settings');
        const { data, error } = await supabase
          .from('email_settings')
          .insert({
            user_id: user.id,
            from_email: settings.from_email,
            from_name: settings.from_name,
            reply_to_email: settings.reply_to_email || null,
            signature: settings.signature || null,
            active: settings.active ?? true
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      console.log('Email settings saved successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({
        title: "Success",
        description: "Email settings updated successfully",
      });
    },
    onError: (error) => {
      console.error('Email settings update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update email settings",
        variant: "destructive",
      });
    },
  });
};
