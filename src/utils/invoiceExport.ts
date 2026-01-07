/**
 * Invoice CSV Export Utility
 * Generates CSV files compatible with Xero, QuickBooks, and generic formats
 */

export interface InvoiceExportData {
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    tax_rate?: number;
  }>;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  payment_status: string;
  amount_paid: number;
  balance_due: number;
  currency: string;
  notes?: string;
}

/**
 * Generate a generic CSV export of invoice data
 */
export function exportInvoiceToCSV(data: InvoiceExportData): void {
  const csv = generateGenericCSVFormat(data);
  downloadCSV(csv, `invoice-${data.invoice_number}.csv`);
}

/**
 * Generate CSV in Xero-compatible format
 * Reference: https://central.xero.com/s/article/Import-a-sales-invoice
 */
export function exportInvoiceForXero(data: InvoiceExportData): void {
  const csv = generateXeroCSVFormat(data);
  downloadCSV(csv, `invoice-${data.invoice_number}-xero.csv`);
}

/**
 * Generate CSV in QuickBooks-compatible format
 * Reference: https://quickbooks.intuit.com/learn-support/en-us/import-customers/import-invoices/00/203273
 */
export function exportInvoiceForQuickBooks(data: InvoiceExportData): void {
  const csv = generateQuickBooksCSVFormat(data);
  downloadCSV(csv, `invoice-${data.invoice_number}-quickbooks.csv`);
}

/**
 * Generic CSV format with full invoice details
 */
function generateGenericCSVFormat(data: InvoiceExportData): string {
  const lines: string[] = [];
  
  // Header row
  lines.push([
    'Invoice Number',
    'Invoice Date',
    'Due Date',
    'Customer Name',
    'Customer Email',
    'Item Description',
    'Quantity',
    'Unit Price',
    'Line Total',
    'Subtotal',
    'Tax Rate (%)',
    'Tax Amount',
    'Total',
    'Amount Paid',
    'Balance Due',
    'Payment Status',
    'Currency'
  ].map(escapeCSV).join(','));
  
  // Data rows - one per line item
  data.line_items.forEach((item, index) => {
    lines.push([
      index === 0 ? data.invoice_number : '',
      index === 0 ? data.invoice_date : '',
      index === 0 ? (data.due_date || '') : '',
      index === 0 ? data.customer_name : '',
      index === 0 ? (data.customer_email || '') : '',
      item.description,
      item.quantity.toString(),
      item.unit_price.toFixed(2),
      item.total.toFixed(2),
      index === 0 ? data.subtotal.toFixed(2) : '',
      index === 0 ? data.tax_rate.toString() : '',
      index === 0 ? data.tax_amount.toFixed(2) : '',
      index === 0 ? data.total.toFixed(2) : '',
      index === 0 ? data.amount_paid.toFixed(2) : '',
      index === 0 ? data.balance_due.toFixed(2) : '',
      index === 0 ? data.payment_status : '',
      index === 0 ? data.currency : ''
    ].map(escapeCSV).join(','));
  });
  
  return lines.join('\n');
}

/**
 * Xero-compatible CSV format
 */
export function generateXeroCSVFormat(data: InvoiceExportData): string {
  const lines: string[] = [];
  
  // Xero required headers
  lines.push([
    '*ContactName',
    'EmailAddress',
    '*InvoiceNumber',
    '*InvoiceDate',
    '*DueDate',
    '*Description',
    '*Quantity',
    '*UnitAmount',
    '*AccountCode',
    'TaxType',
    'TrackingName1',
    'TrackingOption1',
    'Currency'
  ].map(escapeCSV).join(','));
  
  // Data rows
  data.line_items.forEach((item) => {
    lines.push([
      data.customer_name,
      data.customer_email || '',
      data.invoice_number,
      formatDateForXero(data.invoice_date),
      formatDateForXero(data.due_date || data.invoice_date),
      item.description,
      item.quantity.toString(),
      item.unit_price.toFixed(2),
      '200', // Default sales account code
      data.tax_rate > 0 ? 'OUTPUT' : 'NONE',
      '',
      '',
      data.currency
    ].map(escapeCSV).join(','));
  });
  
  return lines.join('\n');
}

/**
 * QuickBooks-compatible CSV format
 */
export function generateQuickBooksCSVFormat(data: InvoiceExportData): string {
  const lines: string[] = [];
  
  // QuickBooks headers
  lines.push([
    'InvoiceNo',
    'Customer',
    'InvoiceDate',
    'DueDate',
    'ItemDescription',
    'ItemQuantity',
    'ItemRate',
    'ItemAmount',
    'TaxCode',
    'TaxAmount',
    'Total',
    'Memo'
  ].map(escapeCSV).join(','));
  
  // Data rows
  data.line_items.forEach((item, index) => {
    lines.push([
      data.invoice_number,
      data.customer_name,
      formatDateForQuickBooks(data.invoice_date),
      formatDateForQuickBooks(data.due_date || data.invoice_date),
      item.description,
      item.quantity.toString(),
      item.unit_price.toFixed(2),
      item.total.toFixed(2),
      data.tax_rate > 0 ? 'TAX' : 'NON',
      index === 0 ? data.tax_amount.toFixed(2) : '',
      index === 0 ? data.total.toFixed(2) : '',
      data.notes || ''
    ].map(escapeCSV).join(','));
  });
  
  return lines.join('\n');
}

/**
 * Escape CSV values properly
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format date for Xero (DD/MM/YYYY)
 */
function formatDateForXero(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format date for QuickBooks (MM/DD/YYYY)
 */
function formatDateForQuickBooks(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Prepare invoice data from project/quote for export
 */
export function prepareInvoiceExportData(
  quote: any,
  client: any,
  items: any[],
  businessSettings: any
): InvoiceExportData {
  const taxRate = businessSettings?.tax_rate || 0;
  const subtotal = items.reduce((sum, item) => sum + (item.total || item.unit_price * (item.quantity || 1)), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const amountPaid = quote?.amount_paid || 0;
  
  return {
    invoice_number: quote?.quote_number || 'INV-001',
    invoice_date: quote?.created_at || new Date().toISOString(),
    due_date: quote?.due_date || null,
    customer_name: client?.name || 'Unknown Customer',
    customer_email: client?.email || null,
    customer_address: client?.address || null,
    line_items: items.map(item => ({
      description: item.description || item.name || 'Item',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || item.total || 0,
      total: item.total || (item.unit_price * (item.quantity || 1)),
      tax_rate: taxRate
    })),
    subtotal,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    payment_status: quote?.payment_status || 'unpaid',
    amount_paid: amountPaid,
    balance_due: Math.max(0, total - amountPaid),
    currency: (typeof businessSettings?.measurement_units === 'string' 
      ? JSON.parse(businessSettings.measurement_units)?.currency 
      : businessSettings?.measurement_units?.currency) || 'GBP',
    notes: quote?.notes || ''
  };
}
