/**
 * Central currency formatting utility
 * Uses the user's currency preference from business settings
 */

export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R',
  };
  return symbols[currency] || '$';
};

export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'EUR',
  options?: {
    showSymbol?: boolean;
    decimals?: number;
    locale?: string;
  }
): string => {
  const {
    showSymbol = true,
    decimals = 2,
    locale
  } = options || {};

  const numAmount = Number(amount ?? 0);
  
  if (!Number.isFinite(numAmount)) {
    return showSymbol ? `${getCurrencySymbol(currency)}0.00` : '0.00';
  }

  // Use Intl.NumberFormat for proper currency formatting
  try {
    const formatter = new Intl.NumberFormat(locale || 'en-US', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return formatter.format(numAmount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    const symbol = showSymbol ? getCurrencySymbol(currency) : '';
    return `${symbol}${numAmount.toFixed(decimals)}`;
  }
};

/**
 * Format price with compact notation for large numbers
 */
export const formatCompactCurrency = (
  amount: number | null | undefined,
  currency: string = 'EUR'
): string => {
  const numAmount = Number(amount ?? 0);
  
  if (!Number.isFinite(numAmount)) {
    return `${getCurrencySymbol(currency)}0`;
  }

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    
    return formatter.format(numAmount);
  } catch (error) {
    return formatCurrency(numAmount, currency);
  }
};
