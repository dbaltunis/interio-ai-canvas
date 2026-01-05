/**
 * Document Type Configuration
 * Defines labels, required sections, and behavior for each document type
 */

export interface DocumentTypeConfig {
  numberLabel: string;
  numberPrefix: string;
  primaryDateLabel: string;
  secondaryDateLabel: string;
  secondaryDateToken: string;
  requiresBankDetails: boolean;
  requiresRegistrationFooter: boolean;
  requiresPaymentTerms: boolean;
  signatureType: 'client-acceptance' | 'installer-signoff' | 'none';
  termsType: 'full' | 'payment-only' | 'safety-notes' | 'none';
  showValidityPeriod: boolean;
  showPaymentStatus: boolean;
  showInstallerInfo: boolean;
  showMeasurements: boolean;
  documentTitle: string;
}

export const DOCUMENT_TYPE_CONFIG: Record<string, DocumentTypeConfig> = {
  quote: {
    numberLabel: 'Quote #',
    numberPrefix: 'QT',
    primaryDateLabel: 'Date',
    secondaryDateLabel: 'Valid Until',
    secondaryDateToken: 'valid_until',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'client-acceptance',
    termsType: 'full',
    showValidityPeriod: true,
    showPaymentStatus: false,
    showInstallerInfo: false,
    showMeasurements: false,
    documentTitle: 'Quote',
  },
  proposal: {
    numberLabel: 'Proposal #',
    numberPrefix: 'PR',
    primaryDateLabel: 'Date',
    secondaryDateLabel: 'Valid Until',
    secondaryDateToken: 'valid_until',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'client-acceptance',
    termsType: 'full',
    showValidityPeriod: true,
    showPaymentStatus: false,
    showInstallerInfo: false,
    showMeasurements: false,
    documentTitle: 'Proposal',
  },
  estimate: {
    numberLabel: 'Estimate #',
    numberPrefix: 'ES',
    primaryDateLabel: 'Date',
    secondaryDateLabel: 'Valid Until',
    secondaryDateToken: 'valid_until',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'client-acceptance',
    termsType: 'full',
    showValidityPeriod: true,
    showPaymentStatus: false,
    showInstallerInfo: false,
    showMeasurements: false,
    documentTitle: 'Estimate',
  },
  invoice: {
    numberLabel: 'Invoice #',
    numberPrefix: 'INV',
    primaryDateLabel: 'Invoice Date',
    secondaryDateLabel: 'Due Date',
    secondaryDateToken: 'due_date',
    requiresBankDetails: true,
    requiresRegistrationFooter: true,
    requiresPaymentTerms: true,
    signatureType: 'none',
    termsType: 'payment-only',
    showValidityPeriod: false,
    showPaymentStatus: true,
    showInstallerInfo: false,
    showMeasurements: false,
    documentTitle: 'Invoice',
  },
  'work-order': {
    numberLabel: 'Work Order #',
    numberPrefix: 'WO',
    primaryDateLabel: 'Date',
    secondaryDateLabel: 'Installation Date',
    secondaryDateToken: 'due_date',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'installer-signoff',
    termsType: 'safety-notes',
    showValidityPeriod: false,
    showPaymentStatus: false,
    showInstallerInfo: true,
    showMeasurements: true,
    documentTitle: 'Work Order',
  },
  measurement: {
    numberLabel: 'Measurement #',
    numberPrefix: 'MS',
    primaryDateLabel: 'Measured Date',
    secondaryDateLabel: 'Due Date',
    secondaryDateToken: 'due_date',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'none',
    termsType: 'none',
    showValidityPeriod: false,
    showPaymentStatus: false,
    showInstallerInfo: false,
    showMeasurements: true,
    documentTitle: 'Measurement Sheet',
  },
  brochure: {
    numberLabel: '',
    numberPrefix: '',
    primaryDateLabel: 'Date',
    secondaryDateLabel: '',
    secondaryDateToken: '',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'none',
    termsType: 'none',
    showValidityPeriod: false,
    showPaymentStatus: false,
    showInstallerInfo: false,
    showMeasurements: false,
    documentTitle: 'Brochure',
  },
  portfolio: {
    numberLabel: '',
    numberPrefix: '',
    primaryDateLabel: 'Date',
    secondaryDateLabel: '',
    secondaryDateToken: '',
    requiresBankDetails: false,
    requiresRegistrationFooter: false,
    requiresPaymentTerms: false,
    signatureType: 'none',
    termsType: 'none',
    showValidityPeriod: false,
    showPaymentStatus: false,
    showInstallerInfo: false,
    showMeasurements: false,
    documentTitle: 'Portfolio',
  },
};

/**
 * Get document type configuration with fallback to quote
 */
export const getDocumentTypeConfig = (documentType: string): DocumentTypeConfig => {
  const normalizedType = (documentType || 'quote').toLowerCase().replace(/_/g, '-');
  return DOCUMENT_TYPE_CONFIG[normalizedType] || DOCUMENT_TYPE_CONFIG.quote;
};

/**
 * Available blocks per document type
 */
export const DOCUMENT_TYPE_BLOCKS: Record<string, string[]> = {
  quote: [
    'document-header',
    'client-info',
    'text',
    'image',
    'products',
    'totals',
    'terms-conditions',
    'signature',
    'payment',
    'footer',
  ],
  proposal: [
    'document-header',
    'client-info',
    'text',
    'image',
    'products',
    'totals',
    'terms-conditions',
    'signature',
    'payment',
    'footer',
  ],
  estimate: [
    'document-header',
    'client-info',
    'text',
    'image',
    'products',
    'totals',
    'terms-conditions',
    'signature',
    'footer',
  ],
  invoice: [
    'document-header',
    'client-info',
    'text',
    'products',
    'totals',
    'payment-details',
    'registration-footer',
    'footer',
  ],
  'work-order': [
    'document-header',
    'client-info',
    'text',
    'image',
    'products',
    'installation-details',
    'measurements',
    'installer-signoff',
    'footer',
  ],
  measurement: [
    'document-header',
    'client-info',
    'text',
    'measurements',
    'image',
    'footer',
  ],
  brochure: [
    'document-header',
    'text',
    'image',
    'products',
    'footer',
  ],
  portfolio: [
    'document-header',
    'text',
    'image',
    'footer',
  ],
};

/**
 * Get available blocks for a document type
 */
export const getAvailableBlocks = (documentType: string): string[] => {
  const normalizedType = (documentType || 'quote').toLowerCase().replace(/_/g, '-');
  return DOCUMENT_TYPE_BLOCKS[normalizedType] || DOCUMENT_TYPE_BLOCKS.quote;
};
