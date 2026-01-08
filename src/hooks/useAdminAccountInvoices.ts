import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StripeInvoice {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  description: string | null;
  lines?: {
    description: string | null;
    amount: number;
    quantity: number | null;
  }[];
}

export const useAdminAccountInvoices = (stripeCustomerId: string | null | undefined) => {
  return useQuery({
    queryKey: ["adminAccountInvoices", stripeCustomerId],
    queryFn: async () => {
      if (!stripeCustomerId) return [];

      const { data, error } = await supabase.functions.invoke("admin-get-account-invoices", {
        body: { stripeCustomerId, limit: 12 },
      });

      if (error) throw error;
      return (data?.invoices || []) as StripeInvoice[];
    },
    enabled: !!stripeCustomerId,
  });
};
