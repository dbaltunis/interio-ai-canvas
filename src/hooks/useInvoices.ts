import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StripeInvoice {
  id: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  lines?: {
    data: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
  };
}

export const useInvoices = () => {
  return useQuery<StripeInvoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-invoices');
      
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      return data.invoices as StripeInvoice[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};
