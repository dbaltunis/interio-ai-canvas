
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

// Get user's preferred currency from business settings
export const useUserCurrency = () => {
  const { data: businessSettings } = useBusinessSettings();
  
  try {
    const measurementUnits = businessSettings?.measurement_units 
      ? JSON.parse(businessSettings.measurement_units) 
      : null;
    return measurementUnits?.currency || 'NZD';
  } catch {
    return 'NZD';
  }
};

export const formatCurrency = (amount: number, currency?: string) => {
  const currencySymbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R'
  };
  
  const currencyCode = currency || 'NZD';
  return `${currencySymbols[currencyCode] || currencyCode}${amount.toFixed(2)}`;
};
