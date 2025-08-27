// Common formatter utilities that work with the centralized markup system

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencySymbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R'
  };
  
  return `${currencySymbols[currency] || currency}${amount.toFixed(2)}`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatMeasurement = (value: number, unit: string): string => {
  const unitLabels: Record<string, string> = {
    'mm': 'mm',
    'cm': 'cm', 
    'm': 'm',
    'inches': '"',
    'feet': "'",
    'yards': 'yd',
    'sq_mm': 'mm²',
    'sq_cm': 'cm²',
    'sq_m': 'm²',
    'sq_inches': 'in²',
    'sq_feet': 'ft²'
  };

  return `${value.toFixed(2)} ${unitLabels[unit] || unit}`;
};