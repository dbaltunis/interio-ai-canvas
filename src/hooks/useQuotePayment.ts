import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useQuotePayment = () => {
  const queryClient = useQueryClient();

  const createPayment = useMutation({
    mutationFn: async ({ quoteId }: { quoteId: string }) => {
      const { data, error } = await supabase.functions.invoke("create-quote-payment", {
        body: { quote_id: quoteId },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No payment URL returned");
      
      return data;
    },
    onSuccess: (data) => {
      // Open Stripe Checkout in new tab
      window.open(data.url, "_blank");
      toast.success("Payment session created. Opening Stripe Checkout...");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payment: ${error.message}`);
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async ({ quoteId, sessionId }: { quoteId: string; sessionId?: string }) => {
      const { data, error } = await supabase.functions.invoke("verify-quote-payment", {
        body: { 
          quote_id: quoteId,
          session_id: sessionId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      if (data.status === "paid" || data.status === "deposit_paid") {
        toast.success("Payment verified successfully!");
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to verify payment: ${error.message}`);
    },
  });

  const updatePaymentConfig = useMutation({
    mutationFn: async ({ 
      quoteId, 
      paymentType, 
      paymentPercentage,
      total 
    }: {
      quoteId: string;
      paymentType: 'full' | 'deposit';
      paymentPercentage?: number;
      total: number;
    }) => {
      const paymentAmount = paymentType === 'full' 
        ? total 
        : (total * (paymentPercentage || 50)) / 100;

      const { data, error } = await supabase
        .from("quotes")
        .update({
          payment_type: paymentType,
          payment_percentage: paymentType === 'deposit' ? paymentPercentage : null,
          payment_amount: paymentAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Payment configuration updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment config: ${error.message}`);
    },
  });

  return {
    createPayment,
    verifyPayment,
    updatePaymentConfig,
  };
};
