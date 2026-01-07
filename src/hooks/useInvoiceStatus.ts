import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

interface UpdatePaymentParams {
  quoteId: string;
  amountPaid: number;
  paymentStatus?: PaymentStatus;
}

interface RecordPaymentParams {
  quoteId: string;
  paymentAmount: number;
  totalAmount: number;
}

export const useInvoiceStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update payment status and amount paid
  const updatePayment = useMutation({
    mutationFn: async ({ quoteId, amountPaid, paymentStatus }: UpdatePaymentParams) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          amount_paid: amountPaid,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-versions'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast({
        title: 'Payment Updated',
        description: 'Payment status has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status.',
        variant: 'destructive',
      });
    },
  });

  // Record a payment and auto-calculate status
  const recordPayment = useMutation({
    mutationFn: async ({ quoteId, paymentAmount, totalAmount }: RecordPaymentParams) => {
      // Get current amount paid
      const { data: quote, error: fetchError } = await supabase
        .from('quotes')
        .select('amount_paid')
        .eq('id', quoteId)
        .single();

      if (fetchError) throw fetchError;

      const currentPaid = (quote?.amount_paid as number) || 0;
      const newAmountPaid = currentPaid + paymentAmount;
      
      // Determine payment status
      let paymentStatus: PaymentStatus;
      if (newAmountPaid >= totalAmount) {
        paymentStatus = 'paid';
      } else if (newAmountPaid > 0) {
        paymentStatus = 'partial';
      } else {
        paymentStatus = 'unpaid';
      }

      const { data, error } = await supabase
        .from('quotes')
        .update({
          amount_paid: newAmountPaid,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-versions'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast({
        title: 'Payment Recorded',
        description: 'Payment has been recorded successfully.',
      });
    },
    onError: (error) => {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment.',
        variant: 'destructive',
      });
    },
  });

  // Mark invoice as paid in full
  const markAsPaid = useMutation({
    mutationFn: async ({ quoteId, totalAmount }: { quoteId: string; totalAmount: number }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          amount_paid: totalAmount,
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-versions'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast({
        title: 'Invoice Paid',
        description: 'Invoice has been marked as paid.',
      });
    },
    onError: (error) => {
      console.error('Error marking as paid:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark invoice as paid.',
        variant: 'destructive',
      });
    },
  });

  // Calculate if an invoice is overdue
  const isInvoiceOverdue = (dueDate: string | null, paymentStatus: string | null): boolean => {
    if (!dueDate) return false;
    if (paymentStatus === 'paid') return false;
    
    const due = new Date(dueDate);
    const today = new Date();
    return today > due;
  };

  // Get effective payment status (accounts for overdue)
  const getEffectiveStatus = (
    paymentStatus: string | null, 
    dueDate: string | null
  ): PaymentStatus => {
    const status = paymentStatus as PaymentStatus || 'unpaid';
    if (status === 'unpaid' && isInvoiceOverdue(dueDate, paymentStatus)) {
      return 'overdue';
    }
    return status;
  };

  // Calculate balance due
  const calculateBalanceDue = (totalAmount: number, amountPaid: number): number => {
    return Math.max(0, totalAmount - amountPaid);
  };

  return {
    updatePayment,
    recordPayment,
    markAsPaid,
    isInvoiceOverdue,
    getEffectiveStatus,
    calculateBalanceDue,
  };
};
