import { useCurrency } from "./useCurrency";
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from "@/utils/formatCurrency";

/**
 * Hook that provides currency formatting functions using the user's currency preference
 * Includes loading state to prevent flash of incorrect default values
 */
export const useFormattedCurrency = () => {
  const currency = useCurrency();
  const isLoading = currency === undefined;

  const formatCurrency = (
    amount: number | null | undefined,
    options?: {
      showSymbol?: boolean;
      decimals?: number;
    }
  ): string => {
    // Return empty string while loading to prevent showing wrong currency
    if (isLoading) return '';
    return formatCurrencyUtil(amount, currency, options);
  };

  const getCurrencySymbol$ = () => {
    if (isLoading) return '';
    return getCurrencySymbol(currency);
  };

  return {
    currency,
    formatCurrency,
    currencySymbol: getCurrencySymbol$(),
    isLoading,
  };
};
