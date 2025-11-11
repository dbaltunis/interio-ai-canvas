export const formatCurrency = (
  amount: number,
  currency: string = 'NZD', // Default to NZD to match useCurrency hook
  locale?: string
) => {
  try {
    // Auto-detect locale based on currency if not provided
    const detectedLocale = locale || getCurrencyLocale(currency);
    
    return new Intl.NumberFormat(detectedLocale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    // Fallback simple formatting with better currency symbol detection
    const symbol = getCurrencySymbol(currency);
    const safe = Number.isFinite(amount) ? amount : 0;
    return `${symbol}${safe.toFixed(2)}`;
  }
};

// Helper function to get locale based on currency
const getCurrencyLocale = (currency: string): string => {
  const localeMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'NZD': 'en-NZ',
    'AUD': 'en-AU',
    'CAD': 'en-CA',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'INR': 'en-IN',
  };
  return localeMap[currency] || 'en-US';
};

// Helper function to get currency symbol
const getCurrencySymbol = (currency: string): string => {
  const symbolMap: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'NZD': 'NZ$',
    'AUD': 'A$',
    'CAD': 'C$',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
  };
  return symbolMap[currency] || currency + ' ';
};
