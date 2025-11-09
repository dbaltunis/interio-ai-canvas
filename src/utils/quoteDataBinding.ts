/**
 * Quote Data Binding Utility
 * Replaces template placeholders with real data from the database
 */

interface QuoteData {
  client?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    company_name?: string;
  };
  business?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    abn?: string;
  };
  quote?: {
    number?: string;
    date?: string;
    validUntil?: string;
    status?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    deposit?: number;
  };
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

/**
 * Format currency values
 */
const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
};

/**
 * Format dates
 */
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return new Date().toLocaleDateString('en-AU');
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Replace all placeholders in text with actual data
 */
export const replacePlaceholders = (text: string, data: QuoteData): string => {
  let result = text;
  
  // Client placeholders
  result = result.replace(/\{\{client\.name\}\}/g, data.client?.name || '[Client Name]');
  result = result.replace(/\{\{client\.email\}\}/g, data.client?.email || '[Client Email]');
  result = result.replace(/\{\{client\.phone\}\}/g, data.client?.phone || '[Client Phone]');
  result = result.replace(/\{\{client\.address\}\}/g, data.client?.address || '[Client Address]');
  result = result.replace(/\{\{client\.company\}\}/g, data.client?.company_name || '[Company Name]');
  
  // Business placeholders
  result = result.replace(/\{\{business\.name\}\}/g, data.business?.name || '[Business Name]');
  result = result.replace(/\{\{business\.email\}\}/g, data.business?.email || '[Business Email]');
  result = result.replace(/\{\{business\.phone\}\}/g, data.business?.phone || '[Business Phone]');
  result = result.replace(/\{\{business\.address\}\}/g, data.business?.address || '[Business Address]');
  result = result.replace(/\{\{business\.abn\}\}/g, data.business?.abn || '[ABN]');
  
  // Quote placeholders
  result = result.replace(/\{\{quote\.number\}\}/g, data.quote?.number || '[Quote #]');
  result = result.replace(/\{\{quote\.date\}\}/g, formatDate(data.quote?.date));
  result = result.replace(/\{\{quote\.validUntil\}\}/g, formatDate(data.quote?.validUntil));
  result = result.replace(/\{\{quote\.status\}\}/g, data.quote?.status || 'Draft');
  
  // Financial placeholders
  result = result.replace(/\{\{quote\.subtotal\}\}/g, formatCurrency(data.quote?.subtotal));
  result = result.replace(/\{\{quote\.tax\}\}/g, formatCurrency(data.quote?.tax));
  result = result.replace(/\{\{quote\.total\}\}/g, formatCurrency(data.quote?.total));
  result = result.replace(/\{\{quote\.deposit\}\}/g, formatCurrency(data.quote?.deposit));
  
  // Date/Time placeholders
  result = result.replace(/\{\{today\}\}/g, formatDate(new Date()));
  result = result.replace(/\{\{time\}\}/g, new Date().toLocaleTimeString('en-AU'));
  
  return result;
};

/**
 * Process Fabric.js canvas and replace all text placeholders
 */
export const bindDataToCanvas = (canvasJSON: any, data: QuoteData): any => {
  const processedCanvas = JSON.parse(JSON.stringify(canvasJSON));
  
  if (processedCanvas.objects) {
    processedCanvas.objects = processedCanvas.objects.map((obj: any) => {
      if (obj.type === 'i-text' || obj.type === 'text') {
        obj.text = replacePlaceholders(obj.text, data);
      }
      return obj;
    });
  }
  
  return processedCanvas;
};

/**
 * Generate product table HTML from line items
 */
export const generateProductTableHTML = (items: QuoteData['items']): string => {
  if (!items || items.length === 0) {
    return '<p>No items in this quote</p>';
  }
  
  const rows = items.map(item => `
    <tr class="border-b border-gray-200">
      <td class="py-3 px-4">
        <div class="font-medium text-gray-900">${item.name}</div>
        ${item.description ? `<div class="text-sm text-gray-500">${item.description}</div>` : ''}
      </td>
      <td class="py-3 px-4 text-center">${item.quantity}</td>
      <td class="py-3 px-4 text-right">${formatCurrency(item.price)}</td>
      <td class="py-3 px-4 text-right font-medium">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');
  
  return `
    <table class="w-full" style="border-collapse: collapse;">
      <thead>
        <tr class="bg-gray-50 border-b-2 border-gray-300">
          <th class="py-3 px-4 text-left font-semibold text-gray-700">Item</th>
          <th class="py-3 px-4 text-center font-semibold text-gray-700">Qty</th>
          <th class="py-3 px-4 text-right font-semibold text-gray-700">Price</th>
          <th class="py-3 px-4 text-right font-semibold text-gray-700">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};
