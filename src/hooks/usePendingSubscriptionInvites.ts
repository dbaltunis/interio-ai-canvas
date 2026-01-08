import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PendingInvite {
  sessionId: string;
  email: string;
  customerName: string | null;
  amount: number;
  currency: string;
  status: "open" | "complete" | "expired";
  paymentStatus: "unpaid" | "paid" | "no_payment_required";
  createdAt: string;
  expiresAt: string;
  planName: string;
  seats: number;
  checkoutUrl: string | null;
}

export const usePendingSubscriptionInvites = () => {
  return useQuery({
    queryKey: ["pendingSubscriptionInvites"],
    queryFn: async (): Promise<PendingInvite[]> => {
      const { data, error } = await supabase.functions.invoke("get-pending-invites");

      if (error) {
        console.error("Error fetching pending invites:", error);
        throw error;
      }

      return data.invites || [];
    },
  });
};

export const useResendCheckoutLink = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, planKey, seats }: { email: string; planKey: string; seats: number }) => {
      const { data, error } = await supabase.functions.invoke("send-subscription-invite", {
        body: { email, planKey, seats },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pendingSubscriptionInvites"] });
      toast({
        title: "New Checkout Link Created",
        description: data.message || "A new checkout link has been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout link",
        variant: "destructive",
      });
    },
  });
};
