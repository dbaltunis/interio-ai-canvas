
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmailCampaign {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

export const useEmailCampaigns = () => {
  return useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailCampaign[];
    },
  });
};

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([{ ...campaignData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create email campaign",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<EmailCampaign, 'id' | 'user_id' | 'created_at'>>) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    },
    onError: (error) => {
      console.error("Failed to update campaign:", error);
      toast({
        title: "Error",
        description: "Failed to update email campaign",
        variant: "destructive",
      });
    },
  });
};
