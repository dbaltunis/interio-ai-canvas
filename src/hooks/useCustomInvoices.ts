import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveAccountOwner } from "@/hooks/useEffectiveAccountOwner";

export interface CustomInvoice {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  hosted_url: string | null;
  pdf_url: string | null;
  payment_type: 'setup' | 'subscription' | 'custom';
  notes: string | null;
  created_at: string;
}

export const useCustomInvoices = () => {
  const { effectiveOwnerId, isLoading: ownerLoading } = useEffectiveAccountOwner();

  return useQuery({
    queryKey: ['custom-invoices', effectiveOwnerId],
    queryFn: async () => {
      if (!effectiveOwnerId) return [];

      const { data, error } = await supabase
        .from('custom_invoices')
        .select('*')
        .eq('user_id', effectiveOwnerId)
        .order('invoice_date', { ascending: false });

      if (error) {
        console.error('Error fetching custom invoices:', error);
        throw error;
      }

      return data as CustomInvoice[];
    },
    enabled: !!effectiveOwnerId && !ownerLoading,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const usePaidCustomInvoices = () => {
  const { data: invoices, ...rest } = useCustomInvoices();
  
  return {
    data: invoices?.filter(inv => inv.status === 'paid') || [],
    ...rest
  };
};

export const useUpcomingPayments = () => {
  const { data: invoices, ...rest } = useCustomInvoices();
  
  return {
    data: invoices?.filter(inv => inv.status === 'pending' || inv.status === 'overdue') || [],
    ...rest
  };
};
