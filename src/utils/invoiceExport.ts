/**
 * Invoice CSV Export Utility
 * Generates CSV files compatible with Xero, QuickBooks, and generic formats
 * 
 * References:
 * - Xero: https://central.xero.com/s/article/Import-a-sales-invoice
 * - QuickBooks: https://quickbooks.intuit.com/learn-support/en-us/import-customers/import-invoices/00/203273
 */

export interface InvoiceExportData {
  // Header fields
  invoice_number: string;
  reference: string;              // Job number / PO reference
  invoice_date: string;
  due_date: string | null;
  supply_date: string | null;     // Tax point date (EU/UK VAT)
  
  // Customer fields
  customer_name: string;
  customer_email: string | null;
  customer_address: string | null;
  po_number: string | null;
  
  // Line items with full detail
  line_items: Array<{
    description: string;          // Full description: Room - Surface - Treatment
    quantity: number;
    unit: string;                 // each, m, sqm, etc.
    unit_price: number;           // Selling price (with markup)
    total: number;
    tax_rate: number;
    account_code: string;         // Xero account code (default: 200)
  }>;
  
  // Totals
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  
  // Discount information
  discount_amount: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_description?: string;
  
  // Payment info
  payment_status: string;
  amount_paid: number;
  balance_due: number;
  
  // Currency
  currency: string;
  notes?: string;
  terms?: string;
}

/**
 * Build a descriptive line item description from quotation item data
 * Format: [Room] - [Surface/Window] - [Treatment] - [Material]
 */
function buildLineDescription(item: any): string {
  const parts: string[] = [];
  
  // Room name
  if (item.room_name) {
    parts.push(item.room_name);
  }
  
  // Surface/Window name
  if (item.surface_name) {
    parts.push(item.surface_name);
  }
  
  // Treatment type or name
  const treatmentName = item.treatment_type || item.name;
  if (treatmentName && !parts.includes(treatmentName)) {
    parts.push(treatmentName);
  }
  
  // Add material name from first child if available (fabric/material)
  if (item.children && item.children.length > 0) {
    const materialChild = item.children.find((c: any) => 
      c.category === 'fabric' || c.category === 'material' || 
      (c.name && !c.name.includes('Labour') && !c.name.includes('Labor'))
    );
    if (materialChild?.description && materialChild.description !== '-') {
      parts.push(materialChild.description);
    } else if (materialChild?.name) {
      parts.push(materialChild.name);
    }
  }
  
  // If no parts, use item description or name
  if (parts.length === 0) {
    return item.description || item.name || 'Window Treatment';
  }
  
  return parts.join(' - ');
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
    'Reference',
    'Invoice Date',
    'Due Date',
    'Customer Name',
    'Customer Email',
    'Item Description',
    'Quantity',
    'Unit',
    'Unit Price',
    'Line Total',
    'Subtotal',
    'Discount',
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
      index === 0 ? data.reference : '',
      index === 0 ? data.invoice_date : '',
      index === 0 ? (data.due_date || '') : '',
      index === 0 ? data.customer_name : '',
      index === 0 ? (data.customer_email || '') : '',
      item.description,
      item.quantity.toString(),
      item.unit,
      item.unit_price.toFixed(2),
      item.total.toFixed(2),
      index === 0 ? data.subtotal.toFixed(2) : '',
      index === 0 && data.discount_amount > 0 ? (-data.discount_amount).toFixed(2) : '',
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
 * Official columns: https://central.xero.com/s/article/Import-a-sales-invoice
 */
export function generateXeroCSVFormat(data: InvoiceExportData): string {
  const lines: string[] = [];
  
  // Enhanced Xero headers with additional fields
  lines.push([
    '*ContactName',
    'EmailAddress',
    'POAddressLine1',
    '*InvoiceNumber',
    'Reference',
    'PONumber',
    '*InvoiceDate',
    '*DueDate',
    '*Description',
    '*Quantity',
    '*UnitAmount',
    'Discount',
    '*AccountCode',
    'TaxType',
    'Currency',
    'TrackingName1',
    'TrackingOption1'
  ].map(escapeCSV).join(','));
  
  // Data rows - one per line item
  data.line_items.forEach((item) => {
    lines.push([
      data.customer_name,
      data.customer_email || '',
      data.customer_address || '',
      data.invoice_number,
      data.reference,
      data.po_number || '',
      formatDateForXero(data.invoice_date),
      formatDateForXero(data.due_date || data.invoice_date),
      item.description,
      item.quantity.toString(),
      item.unit_price.toFixed(2),
      '', // Per-line discount (empty, using summary discount)
      item.account_code,
      item.tax_rate > 0 ? 'OUTPUT' : 'NONE',
      data.currency,
      '', // TrackingName1
      ''  // TrackingOption1
    ].map(escapeCSV).join(','));
  });
  
  // Add discount line item if discount exists (Xero supports negative amounts)
  if (data.discount_amount > 0) {
    lines.push([
      data.customer_name,
      data.customer_email || '',
      '',
      data.invoice_number,
      data.reference,
      data.po_number || '',
      formatDateForXero(data.invoice_date),
      formatDateForXero(data.due_date || data.invoice_date),
      data.discount_description || 'Discount',
      '1',
      (-data.discount_amount).toFixed(2), // Negative amount for discount
      '',
      '200', // Same account code
      'NONE', // No tax on discount
      data.currency,
      '',
      ''
    ].map(escapeCSV).join(','));
  }
  
  return lines.join('\n');
}

/**
 * QuickBooks-compatible CSV format
 * QuickBooks doesn't support negative line items, so we distribute discount proportionally
 */
export function generateQuickBooksCSVFormat(data: InvoiceExportData): string {
  const lines: string[] = [];
  
  // Enhanced QuickBooks headers
  lines.push([
    'InvoiceNo',
    'Customer',
    'InvoiceDate',
    'DueDate',
    'PONumber',
    'Terms',
    'ItemDescription',
    'ItemQuantity',
    'ItemRate',
    'ItemAmount',
    'TaxCode',
    'TaxAmount',
    'Total',
    'Memo'
  ].map(escapeCSV).join(','));
  
  // Calculate discount ratio for proportional distribution
  // QuickBooks doesn't support negative line items, so we adjust prices
  const originalSubtotal = data.line_items.reduce((sum, item) => sum + item.total, 0);
  const discountRatio = originalSubtotal > 0 && data.discount_amount > 0
    ? (originalSubtotal - data.discount_amount) / originalSubtotal 
    : 1;
  
  // Build memo with discount info
  const memoWithDiscount = data.discount_amount > 0
    ? `${data.notes || ''} [Includes ${data.discount_description || 'Discount'}: -${data.discount_amount.toFixed(2)}]`.trim()
    : data.notes || '';
  
  // Data rows with proportionally adjusted prices
  data.line_items.forEach((item, index) => {
    // Apply proportional discount to each line
    const adjustedRate = item.unit_price * discountRatio;
    const adjustedAmount = item.total * discountRatio;
    
    lines.push([
      data.invoice_number,
      data.customer_name,
      formatDateForQuickBooks(data.invoice_date),
      formatDateForQuickBooks(data.due_date || data.invoice_date),
      data.po_number || '',
      data.terms || '',
      item.description,
      item.quantity.toString(),
      adjustedRate.toFixed(2), // Discounted rate
      adjustedAmount.toFixed(2), // Discounted amount
      item.tax_rate > 0 ? 'TAX' : 'NON',
      index === 0 ? data.tax_amount.toFixed(2) : '',
      index === 0 ? data.total.toFixed(2) : '',
      index === 0 ? memoWithDiscount : ''
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
    if (isNaN(date.getTime())) return dateStr;
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
    if (isNaN(date.getTime())) return dateStr;
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
 * Get currency from business settings
 */
function extractCurrency(businessSettings: any): string {
  if (!businessSettings) return 'USD';
  
  // Check direct currency field first
  if (businessSettings.currency) return businessSettings.currency;
  
  // Then check measurement_units
  const units = businessSettings.measurement_units;
  if (!units) return 'USD';
  
  if (typeof units === 'string') {
    try {
      const parsed = JSON.parse(units);
      return parsed?.currency || 'USD';
    } catch {
      return 'USD';
    }
  }
  
  return units?.currency || 'USD';
}

/**
 * Build full customer address string
 */
function buildCustomerAddress(client: any): string | null {
  if (!client) return null;
  
  const parts: string[] = [];
  if (client.address) parts.push(client.address);
  if (client.city) parts.push(client.city);
  if (client.state) parts.push(client.state);
  if (client.zip_code) parts.push(client.zip_code);
  if (client.country) parts.push(client.country);
  
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Prepare invoice data from project/quote for export
 * Extracts real data from quotation items including treatment names, rooms, and materials
 * Now includes proper discount handling for ERP systems
 */
export function prepareInvoiceExportData(
  quote: any,
  client: any,
  items: any[],
  businessSettings: any,
  project?: any
): InvoiceExportData {
  const taxRate = businessSettings?.tax_rate || 0;
  const currency = extractCurrency(businessSettings);
  const defaultAccountCode = '200'; // Standard sales account code
  
  // Get discount info from quote
  const discountAmount = quote?.discount_amount || 0;
  const discountType = quote?.discount_type as 'percentage' | 'fixed' | undefined;
  const discountValue = quote?.discount_value;
  
  // Calculate totals from items (items already have selling prices with markup)
  const itemsSubtotal = items.reduce((sum, item) => {
    return sum + (item.unit_price || item.total || 0);
  }, 0);
  
  // Apply discount to get actual subtotal
  const subtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount);
  const taxAmount = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + taxAmount;
  const amountPaid = quote?.amount_paid || 0;
  
  // Build discount description
  const discountDescription = discountAmount > 0 
    ? `Discount${discountType === 'percentage' && discountValue ? ` (${discountValue}%)` : ''}`
    : undefined;
  
  // Build line items with proper descriptions
  const lineItems = items.map(item => ({
    description: buildLineDescription(item),
    quantity: item.quantity || 1,
    unit: item.unit || 'each',
    unit_price: item.unit_price || item.total || 0,
    total: item.total || item.unit_price || 0,
    tax_rate: taxRate,
    account_code: defaultAccountCode
  }));
  
  // Fallback if no items - create single summary line
  if (lineItems.length === 0) {
    lineItems.push({
      description: 'Window Treatments',
      quantity: 1,
      unit: 'each',
      unit_price: quote?.subtotal || 0,
      total: quote?.subtotal || 0,
      tax_rate: taxRate,
      account_code: defaultAccountCode
    });
  }
  
  // Smart detection - if job_number is actually an invoice number format, use it correctly
  const jobNumber = project?.job_number || '';
  const isJobNumberActuallyInvoice = jobNumber.startsWith('INV-') || 
                                      jobNumber.startsWith('Invoice-') ||
                                      /^INV-\d+/.test(jobNumber);

  // Invoice number priority: explicit invoice fields first, then detect from job_number
  const invoiceNumber = quote?.invoice_number || 
                        (isJobNumberActuallyInvoice ? jobNumber : null) ||
                        quote?.quote_number || 
                        'INV-001';

  // Reference: PO number first, then job_number only if it's actually a job format
  const reference = quote?.po_number || 
                    (!isJobNumberActuallyInvoice ? jobNumber : '') || 
                    '';
  
  console.log('[Invoice Export] Field resolution:', {
    'quote.invoice_number': quote?.invoice_number,
    'quote.quote_number': quote?.quote_number,
    'project.job_number': project?.job_number,
    'isJobNumberActuallyInvoice': isJobNumberActuallyInvoice,
    'resolved_invoiceNumber': invoiceNumber,
    'resolved_reference': reference,
    customerName: client?.name,
    itemCount: lineItems.length,
    itemsSubtotal,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    total,
    currency
  });
  
  return {
    invoice_number: invoiceNumber,
    reference,
    invoice_date: quote?.supply_date || quote?.created_at || new Date().toISOString(),
    due_date: quote?.valid_until || null,
    supply_date: quote?.supply_date || null,
    customer_name: client?.name || 'Customer',
    customer_email: client?.email || null,
    customer_address: buildCustomerAddress(client),
    po_number: quote?.po_number || null,
    line_items: lineItems,
    subtotal: subtotalAfterDiscount, // Use discounted subtotal
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total,
    discount_amount: discountAmount,
    discount_type: discountType,
    discount_value: discountValue,
    discount_description: discountDescription,
    payment_status: quote?.payment_status || 'unpaid',
    amount_paid: amountPaid,
    balance_due: Math.max(0, total - amountPaid),
    currency,
    notes: quote?.notes || '',
    terms: quote?.payment_terms || ''
  };
}