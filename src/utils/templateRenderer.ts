// Utility for rendering templates with dynamic data replacement

export interface TemplateData {
  // Company data
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_website?: string;
  company_logo?: string;
  
  // Client data
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_company?: string;
  
  // Quote data
  quote_number: string;
  quote_date: string;
  valid_until?: string;
  
  // Project data
  project_id?: string;
  project_name?: string;
  
  // Financial data
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  
  // Items
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    room?: string;
    category?: string;
  }>;
}

export const replaceTokens = (content: string, data: Partial<TemplateData>): string => {
  if (!content) return '';
  
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key as keyof TemplateData];
    
    if (value === undefined || value === null) {
      return match; // Keep the token if no replacement found
    }
    
    // Format numbers as currency if they appear to be monetary values
    if (typeof value === 'number' && ['subtotal', 'tax_amount', 'total', 'unit_price'].includes(key)) {
      return formatCurrency(value, data.currency || 'USD');
    }
    
    return String(value);
  });
};

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

export const generateQuoteNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QT-${timestamp}${random}`;
};

export const calculateTotals = (items: TemplateData['items'], taxRate: number = 0.08, taxInclusive: boolean = false) => {
  const baseTotal = items.reduce((sum, item) => sum + item.total, 0);
  
  let subtotal: number;
  let tax_amount: number;
  let total: number;
  
  if (taxInclusive) {
    // Prices already include tax
    total = baseTotal;
    subtotal = baseTotal / (1 + taxRate);
    tax_amount = total - subtotal;
  } else {
    // Prices exclude tax
    subtotal = baseTotal;
    tax_amount = subtotal * taxRate;
    total = subtotal + tax_amount;
  }
  
  return { subtotal, tax_amount, total };
};