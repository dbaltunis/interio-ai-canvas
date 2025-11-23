import { useCurrency } from "@/hooks/useCurrency";
import { calculateOptionCost, calculateHierarchicalOptionCost } from "@/components/job-creation/treatment-pricing/fabric-calculation/optionCostCalculator";
import { getCurrencySymbol } from "@/utils/currency";

/**
 * Hook that provides currency-aware pricing calculation functions
 * All calculations will use the currency from user settings
 */
export const useCurrencyAwarePricing = () => {
  const currency = useCurrency();
  const currencySymbol = currency ? getCurrencySymbol(currency) : '$';

  return {
    currencySymbol,
    currency,
    calculateOptionCost: (option: any, formData: any) => 
      calculateOptionCost(option, formData, currencySymbol),
    calculateHierarchicalOptionCost: (option: any, formData: any) => 
      calculateHierarchicalOptionCost(option, formData, currencySymbol)
  };
};
