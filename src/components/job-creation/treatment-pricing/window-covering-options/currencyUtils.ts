
export const formatCurrency = (amount: number, currency: string) => {
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
