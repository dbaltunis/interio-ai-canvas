/**
 * Unit conversion utilities for consistent measurement handling
 * Fixes the unit consistency issues between cm inputs and metre calculations
 */

export const cmToM = (cm?: number): number => {
  return (cm ?? 0) / 100;
};

export const mToCm = (m?: number): number => {
  return (m ?? 0) * 100;
};

export const formatCurrency = (amount?: number | string, currency: string = 'GBP'): string => {
  const currencySymbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R'
  };

  const symbol = currencySymbols[currency] || currency;
  const n = Number(amount ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `${symbol}${safe.toFixed(2)}`;
};

export const formatLinearMeters = (meters?: number): string => {
  const n = Number(meters ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toFixed(2)}m`;
};