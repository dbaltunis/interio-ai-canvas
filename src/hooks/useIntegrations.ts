import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { IntegrationType } from "@/types/integrations";

export const useIntegrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integrations:', error);
        throw error;
      }

      return (data || []) as unknown as IntegrationType[];
    },
  });

  const createIntegration = useMutation({
    mutationFn: async (integration: Omit<IntegrationType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('integration_settings')
        .insert({
          ...integration,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Integration Created",
        description: "Integration has been successfully configured.",
      });
    },
    onError: (error) => {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<IntegrationType> }) => {
      const { data, error } = await supabase
        .from('integration_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Integration Updated",
        description: "Integration settings have been saved.",
      });
    },
    onError: (error) => {
      console.error('Error updating integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integration_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: "Integration Deleted",
        description: "Integration has been removed.",
      });
    },
    onError: (error) => {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error",
        description: "Failed to delete integration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async (integration: IntegrationType) => {
      // Call edge function to test connection
      const { data, error } = await supabase.functions.invoke('test-integration', {
        body: { integration },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Connection Successful" : "Connection Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      console.error('Error testing connection:', error);
      toast({
        title: "Connection Test Failed",
        description: "Unable to test connection. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  const triggerSync = useMutation({
    mutationFn: async ({ integrationId, syncType }: { integrationId: string; syncType: string }) => {
      const { data, error } = await supabase.functions.invoke('trigger-sync', {
        body: { integrationId, syncType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sync Started",
        description: "Data synchronization has been initiated.",
      });
    },
    onError: (error) => {
      console.error('Error triggering sync:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to start synchronization. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    integrations: integrations || [],
    isLoading,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testConnection,
    triggerSync,
  };
};