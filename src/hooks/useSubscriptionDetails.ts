import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionDetails {
  hasSubscription: boolean;
  status?: 'active' | 'trial' | 'canceled' | 'past_due';
  plan?: {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
  };
  currentSeats: number;
  pricePerSeat: number;
  monthlyTotal?: number;
  currency: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextBillingDate?: string;
  daysRemaining?: number;
  totalDaysInPeriod?: number;
  prorationForNewSeat?: number;
  newMonthlyTotalAfterAddingSeat?: number;
  upcomingInvoiceTotal?: number | null;
  isStripeManaged?: boolean;
  message?: string;
  error?: string;
}

export const useSubscriptionDetails = () => {
  return useQuery<SubscriptionDetails>({
    queryKey: ['subscription-details'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-subscription-details');
      
      if (error) {
        console.error('Error fetching subscription details:', error);
        throw error;
      }
      
      return data as SubscriptionDetails;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });
};
