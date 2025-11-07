import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStripeConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const { data: connection, error } = await supabase
        .from('payment_provider_connections')
        .select('stripe_account_id, is_active')
        .eq('provider', 'stripe')
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (connection?.stripe_account_id) {
        setConnectedAccountId(connection.stripe_account_id);
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setConnectedAccountId(null);
      }
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
      setIsConnected(false);
      setConnectedAccountId(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const initiateConnection = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-connect-oauth');

      if (error) throw error;
      if (!data?.url) throw new Error("No OAuth URL returned");

      // Redirect to Stripe OAuth
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error initiating Stripe Connect:', error);
      toast.error(error.message || "Failed to initiate Stripe Connect");
      setIsConnecting(false);
    }
  }, []);

  const handleCallback = useCallback(async (code: string) => {
    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-connect-callback', {
        body: { code }
      });

      if (error) throw error;

      toast.success("Stripe account connected successfully!");
      await checkConnection();
      
      return true;
    } catch (error: any) {
      console.error('Error handling Stripe callback:', error);
      toast.error(error.message || "Failed to connect Stripe account");
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [checkConnection]);

  const disconnect = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('payment_provider_connections')
        .update({ is_active: false })
        .eq('provider', 'stripe');

      if (error) throw error;

      setIsConnected(false);
      setConnectedAccountId(null);
      toast.success("Stripe account disconnected");
    } catch (error: any) {
      console.error('Error disconnecting Stripe:', error);
      toast.error(error.message || "Failed to disconnect");
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isChecking,
    isConnecting,
    connectedAccountId,
    initiateConnection,
    handleCallback,
    disconnect,
    refreshConnection: checkConnection,
  };
};
