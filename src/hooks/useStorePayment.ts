import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useStorePayment = () => {
  const queryClient = useQueryClient();

  const createCheckout = useMutation({
    mutationFn: async ({
      storeId,
      customerName,
      customerEmail,
      customerPhone,
      message,
      items,
      total,
    }: {
      storeId: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      message?: string;
      items: any[];
      total: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("create-store-checkout", {
        body: {
          store_id: storeId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          message,
          items,
          total,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL returned");

      return data;
    },
    onSuccess: (data) => {
      // Open Stripe Checkout in same window
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast.error(`Failed to create checkout: ${error.message}`);
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const { data, error } = await supabase.functions.invoke("verify-store-payment", {
        body: {
          session_id: sessionId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      if (data.status === "paid") {
        toast.success("Payment confirmed! Thank you for your order.");
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to verify payment: ${error.message}`);
    },
  });

  return {
    createCheckout,
    verifyPayment,
  };
};
