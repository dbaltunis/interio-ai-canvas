export const formatCurrency = (
  amount: number,
  currency: string = 'GBP',
  locale: string = currency === 'USD' ? 'en-US' : 'en-GB'
) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
  } catch {
    // Fallback simple formatting
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
    const safe = Number.isFinite(amount) ? amount : 0;
    return `${symbol}${safe.toFixed(2)}`;
  }
};
