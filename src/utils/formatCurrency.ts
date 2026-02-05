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
    'INR': '₹',
    'CAD': 'C$',
    'JPY': '¥',
    'CHF': 'CHF',
    'SGD': 'S$',
    'HKD': 'HK$',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'MYR': 'RM',
    'THB': '฿',
    'PHP': '₱',
    'IDR': 'Rp',
    'AED': 'د.إ',
    'SAR': '﷼',
    'QAR': 'ر.ق',
    'KWD': 'د.ك',
    'BHD': '.د.ب',
    'OMR': 'ر.ع.',
  };
  return symbols[currency] || currency || '$';
};

export const formatCurrency = (
  amount: number | null | undefined,
  currency?: string,
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

  // If no currency provided, still show the number (never return empty)
  // This prevents values from disappearing in the UI
  if (!currency) {
    if (!Number.isFinite(numAmount)) {
      return '0.00';
    }
    // Return formatted number without currency symbol
    return numAmount.toLocaleString(locale || 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

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
  currency?: string
): string => {
  const numAmount = Number(amount ?? 0);

  // If no currency provided, still show the number (never return empty)
  if (!currency) {
    if (!Number.isFinite(numAmount)) {
      return '0';
    }
    // Return compact number without currency symbol
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(numAmount);
  }

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
