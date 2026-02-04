/**
 * Document Translation Utility
 * Provides translations for document-facing labels (quotes, invoices, work orders)
 * The app interface stays in English - only client-facing documents are translated
 */

export type DocumentLanguage = 'en' | 'lt';

export const SUPPORTED_DOCUMENT_LANGUAGES: Array<{ value: DocumentLanguage; label: string; flag: string }> = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'lt', label: 'Lietuvių (Lithuanian) - Documents only', flag: '🇱🇹' },
];

/**
 * All translatable document labels
 */
export const DOCUMENT_TRANSLATIONS: Record<string, Record<DocumentLanguage, string>> = {
  // Document titles
  'Quote': { en: 'Quote', lt: 'Pasiūlymas' },
  'Invoice': { en: 'Invoice', lt: 'Sąskaita-faktūra' },
  'Estimate': { en: 'Estimate', lt: 'Sąmata' },
  'Proposal': { en: 'Proposal', lt: 'Pasiūlymas' },
  'Work Order': { en: 'Work Order', lt: 'Darbo užsakymas' },
  'Measurement': { en: 'Measurement', lt: 'Matavimas' },
  'Measurement Sheet': { en: 'Measurement Sheet', lt: 'Matavimo lapas' },
  'Brochure': { en: 'Brochure', lt: 'Brošiūra' },
  'Portfolio': { en: 'Portfolio', lt: 'Portfolis' },
  
  // Document number labels
  'Quote #': { en: 'Quote #', lt: 'Pasiūlymas Nr.' },
  'Invoice #': { en: 'Invoice #', lt: 'Sąskaita-faktūra Nr.' },
  'Estimate #': { en: 'Estimate #', lt: 'Sąmata Nr.' },
  'Proposal #': { en: 'Proposal #', lt: 'Pasiūlymas Nr.' },
  'Work Order #': { en: 'Work Order #', lt: 'Darbo užsakymas Nr.' },
  'Measurement #': { en: 'Measurement #', lt: 'Matavimas Nr.' },
  
  // Date labels
  'Date': { en: 'Date', lt: 'Data' },
  'Invoice Date': { en: 'Invoice Date', lt: 'Sąskaitos data' },
  'Valid Until': { en: 'Valid Until', lt: 'Galioja iki' },
  'Due Date': { en: 'Due Date', lt: 'Mokėjimo terminas' },
  'Installation Date': { en: 'Installation Date', lt: 'Montavimo data' },
  'Measured Date': { en: 'Measured Date', lt: 'Matavimo data' },
  
  // Financial labels
  'Subtotal': { en: 'Subtotal', lt: 'Tarpinė suma' },
  'Tax': { en: 'Tax', lt: 'PVM' },
  'VAT': { en: 'VAT', lt: 'PVM' },
  'GST': { en: 'GST', lt: 'PVM' },
  'Total': { en: 'Total', lt: 'Iš viso' },
  'Balance Due': { en: 'Balance Due', lt: 'Mokėtina suma' },
  'Amount Paid': { en: 'Amount Paid', lt: 'Sumokėta' },
  'Discount': { en: 'Discount', lt: 'Nuolaida' },
  
  // Table headers
  'Description': { en: 'Description', lt: 'Aprašymas' },
  'Quantity': { en: 'Quantity', lt: 'Kiekis' },
  'Qty': { en: 'Qty', lt: 'Kiekis' },
  'Unit Price': { en: 'Unit Price', lt: 'Vieneto kaina' },
  'Amount': { en: 'Amount', lt: 'Suma' },
  'Item': { en: 'Item', lt: 'Prekė' },
  'Room': { en: 'Room', lt: 'Kambarys' },
  'Width': { en: 'Width', lt: 'Plotis' },
  'Height': { en: 'Height', lt: 'Aukštis' },
  'Drop': { en: 'Drop', lt: 'Ilgis' },
  
  // Client section
  'Bill To': { en: 'Bill To', lt: 'Pirkėjas' },
  'Sold to': { en: 'Sold to', lt: 'Pirkėjas' },
  'Client': { en: 'Client', lt: 'Klientas' },
  'Customer': { en: 'Customer', lt: 'Klientas' },
  'Ship To': { en: 'Ship To', lt: 'Pristatymo adresas' },
  
  // Bank details
  'Bank': { en: 'Bank', lt: 'Bankas' },
  'Bank Name': { en: 'Bank Name', lt: 'Bankas' },
  'Account Name': { en: 'Account Name', lt: 'Sąskaitos savininkas' },
  'Account': { en: 'Account', lt: 'Sąskaita' },
  'Account Number': { en: 'Account Number', lt: 'Sąskaitos numeris' },
  'IBAN': { en: 'IBAN', lt: 'IBAN' },
  'BIC/SWIFT': { en: 'BIC/SWIFT', lt: 'BIC/SWIFT' },
  'BSB': { en: 'BSB', lt: 'BSB' },
  'Sort Code': { en: 'Sort Code', lt: 'Banko kodas' },
  'Routing Number': { en: 'Routing Number', lt: 'Banko kodas' },
  
  // Payment status badges
  'PAID': { en: 'PAID', lt: 'APMOKĖTA' },
  'UNPAID': { en: 'UNPAID', lt: 'NEAPMOKĖTA' },
  'OVERDUE': { en: 'OVERDUE', lt: 'VĖLUOJAMA' },
  'PARTIAL': { en: 'PARTIAL', lt: 'DALINAI' },
  'PENDING': { en: 'PENDING', lt: 'LAUKIAMA' },
  
  // Footer sections
  'Terms & Conditions': { en: 'Terms & Conditions', lt: 'Sąlygos' },
  'Payment Terms': { en: 'Payment Terms', lt: 'Mokėjimo sąlygos' },
  'Notes': { en: 'Notes', lt: 'Pastabos' },
  'Signature': { en: 'Signature', lt: 'Parašas' },
  'Client Signature': { en: 'Client Signature', lt: 'Kliento parašas' },
  'Installer Signature': { en: 'Installer Signature', lt: 'Montuotojo parašas' },
  'Privacy Policy': { en: 'Privacy Policy', lt: 'Privatumo politika' },
  
  // Work order specific
  'Installation Details': { en: 'Installation Details', lt: 'Montavimo informacija' },
  'Measurements': { en: 'Measurements', lt: 'Matavimai' },
  'Installer': { en: 'Installer', lt: 'Montuotojas' },
  'Safety Notes': { en: 'Safety Notes', lt: 'Saugos pastabos' },
  
  // Business registration
  'ABN': { en: 'ABN', lt: 'Įmonės kodas' },
  'Company Registration': { en: 'Company Registration', lt: 'Įmonės kodas' },
  'Tax Number': { en: 'Tax Number', lt: 'PVM mokėtojo kodas' },
  'VAT Number': { en: 'VAT Number', lt: 'PVM mokėtojo kodas' },
  
  // Common phrases
  'Thank you for your business': { en: 'Thank you for your business', lt: 'Dėkojame už pasirinkimą' },
  'Please pay by': { en: 'Please pay by', lt: 'Prašome apmokėti iki' },
  'Payment Reference': { en: 'Payment Reference', lt: 'Mokėjimo nuoroda' },
  'Page': { en: 'Page', lt: 'Puslapis' },
  'of': { en: 'of', lt: 'iš' },
};

/**
 * Get translated text for a key
 * Falls back to English if translation not found, then to the key itself
 */
export function t(key: string, lang: DocumentLanguage = 'en'): string {
  const translation = DOCUMENT_TRANSLATIONS[key];
  if (!translation) return key;
  return translation[lang] || translation['en'] || key;
}

/**
 * Get translated document type config labels
 */
export function getLocalizedDocumentLabels(documentType: string, lang: DocumentLanguage = 'en') {
  const configs: Record<string, { numberLabel: string; title: string; primaryDate: string; secondaryDate: string }> = {
    quote: {
      numberLabel: t('Quote #', lang),
      title: t('Quote', lang),
      primaryDate: t('Date', lang),
      secondaryDate: t('Valid Until', lang),
    },
    proposal: {
      numberLabel: t('Proposal #', lang),
      title: t('Proposal', lang),
      primaryDate: t('Date', lang),
      secondaryDate: t('Valid Until', lang),
    },
    estimate: {
      numberLabel: t('Estimate #', lang),
      title: t('Estimate', lang),
      primaryDate: t('Date', lang),
      secondaryDate: t('Valid Until', lang),
    },
    invoice: {
      numberLabel: t('Invoice #', lang),
      title: t('Invoice', lang),
      primaryDate: t('Invoice Date', lang),
      secondaryDate: t('Due Date', lang),
    },
    'work-order': {
      numberLabel: t('Work Order #', lang),
      title: t('Work Order', lang),
      primaryDate: t('Date', lang),
      secondaryDate: t('Installation Date', lang),
    },
    measurement: {
      numberLabel: t('Measurement #', lang),
      title: t('Measurement Sheet', lang),
      primaryDate: t('Measured Date', lang),
      secondaryDate: t('Due Date', lang),
    },
    brochure: {
      numberLabel: '',
      title: t('Brochure', lang),
      primaryDate: t('Date', lang),
      secondaryDate: '',
    },
    portfolio: {
      numberLabel: '',
      title: t('Portfolio', lang),
      primaryDate: t('Date', lang),
      secondaryDate: '',
    },
  };
  
  const normalizedType = (documentType || 'quote').toLowerCase().replace(/_/g, '-');
  return configs[normalizedType] || configs.quote;
}

/**
 * Get translated totals section labels
 */
export function getLocalizedTotalsLabels(lang: DocumentLanguage = 'en') {
  return {
    subtotal: t('Subtotal', lang),
    tax: t('Tax', lang),
    vat: t('VAT', lang),
    total: t('Total', lang),
    balanceDue: t('Balance Due', lang),
    amountPaid: t('Amount Paid', lang),
    discount: t('Discount', lang),
  };
}

/**
 * Get translated table headers
 */
export function getLocalizedTableHeaders(lang: DocumentLanguage = 'en') {
  return {
    description: t('Description', lang),
    quantity: t('Quantity', lang),
    qty: t('Qty', lang),
    unitPrice: t('Unit Price', lang),
    amount: t('Amount', lang),
    item: t('Item', lang),
    room: t('Room', lang),
    width: t('Width', lang),
    height: t('Height', lang),
  };
}

/**
 * Get translated payment status
 */
export function getLocalizedPaymentStatus(status: string, lang: DocumentLanguage = 'en'): string {
  const statusMap: Record<string, string> = {
    'paid': t('PAID', lang),
    'unpaid': t('UNPAID', lang),
    'overdue': t('OVERDUE', lang),
    'partial': t('PARTIAL', lang),
    'pending': t('PENDING', lang),
  };
  return statusMap[status?.toLowerCase()] || status?.toUpperCase() || t('UNPAID', lang);
}

/**
 * Get translated bank detail labels based on country
 */
export function getLocalizedBankLabels(lang: DocumentLanguage = 'en') {
  return {
    bank: t('Bank', lang),
    accountName: t('Account Name', lang),
    account: t('Account', lang),
    iban: t('IBAN', lang),
    bicSwift: t('BIC/SWIFT', lang),
    bsb: t('BSB', lang),
    sortCode: t('Sort Code', lang),
    routingNumber: t('Routing Number', lang),
  };
}
