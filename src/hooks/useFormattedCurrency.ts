import { useCurrency } from "./useCurrency";
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from "@/utils/formatCurrency";

/**
 * Hook that provides currency formatting functions using the user's currency preference
 */
export const useFormattedCurrency = () => {
  const currency = useCurrency();

  const formatCurrency = (
    amount: number | null | undefined,
    options?: {
      showSymbol?: boolean;
      decimals?: number;
    }
  ): string => {
    return formatCurrencyUtil(amount, currency, options);
  };

  const getCurrencySymbol$ = () => {
    return getCurrencySymbol(currency);
  };

  return {
    currency,
    formatCurrency,
    currencySymbol: getCurrencySymbol$(),
  };
};
