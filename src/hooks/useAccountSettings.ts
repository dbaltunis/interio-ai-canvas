import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AccountSettings {
  id: string;
  user_id: string;
  account_name: string;
  industry?: string;
  timezone: string;
  default_currency: string;
  logo_url?: string;
  billing_email?: string;
  max_child_accounts: number;
  features_enabled: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface AccessRequest {
  id: string;
  requester_id: string;
  parent_account_id: string;
  requested_role: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  requester_email?: string;
  requester_name?: string;
}

export const useAccountSettings = () => {
  return useQuery({
    queryKey: ["account-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Since account_settings table doesn't exist yet, return mock data
      return {
        id: "mock-id",
        user_id: user.id,
        account_name: "My Organization",
        timezone: "UTC",
        default_currency: "USD",
        max_child_accounts: 5,
        features_enabled: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as AccountSettings;
    },
  });
};

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<AccountSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock update for now
      return {
        id: "mock-id",
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      } as AccountSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-settings"] });
      toast({
        title: "Success",
        description: "Account settings updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update account settings.",
        variant: "destructive",
      });
      console.error("Error updating account settings:", error);
    },
  });
};

export const useChildAccounts = () => {
  return useQuery({
    queryKey: ["child-accounts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Mock data for now - will be implemented after migration
      return [];
    },
  });
};

export const useAccessRequests = () => {
  return useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Mock data for now - will be implemented after migration
      return [];
    },
  });
};

export const useProcessAccessRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, action, role }: { 
      requestId: string; 
      action: 'approve' | 'reject';
      role?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock implementation for now
      console.log('Processing access request:', { requestId, action, role });

      return { success: true };
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      queryClient.invalidateQueries({ queryKey: ["child-accounts"] });
      toast({
        title: "Success",
        description: `Access request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process access request.",
        variant: "destructive",
      });
      console.error("Error processing access request:", error);
    },
  });
};

export const useCreateAccessRequest = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      parentAccountId, 
      requestedRole, 
      message 
    }: { 
      parentAccountId: string; 
      requestedRole: string; 
      message?: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mock implementation for now
      console.log('Creating access request:', { parentAccountId, requestedRole, message });
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Access request sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send access request.",
        variant: "destructive",
      });
      console.error("Error creating access request:", error);
    },
  });
};