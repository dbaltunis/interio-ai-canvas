// Professional Template Library
import { modernQuoteTemplate } from './ModernQuoteTemplate';
import { detailedQuoteTemplate, luxuryQuoteTemplate } from './QuoteTemplates';
import { standardInvoiceTemplate, installerWorkOrderTemplate, measurementSheetTemplate } from './BusinessDocumentTemplates';
import { productShowcaseTemplate, digitalEbookTemplate } from './BrochureTemplates';

// Template Library Definition
const templateLibrary = {
  quote: {
    'modern-quote': modernQuoteTemplate,
    'detailed-quote': detailedQuoteTemplate,
    'luxury-quote': luxuryQuoteTemplate
  },
  invoice: {
    'standard-invoice': standardInvoiceTemplate,
    'branded-invoice': {
      ...standardInvoiceTemplate,
      id: 'branded-invoice',
      name: 'Branded Invoice',
      description: 'Invoice with enhanced branding elements'
    }
  },
  'work-order': {
    'installer-work-order': installerWorkOrderTemplate
  },
  measurement: {
    'measurement-sheet': measurementSheetTemplate
  },
  brochure: {
    'product-showcase': productShowcaseTemplate,
    'digital-ebook': digitalEbookTemplate
  }
};

// Get template by type and ID
export const getTemplateByTypeAndId = (documentType: string, templateId: string) => {
  const typeTemplates = templateLibrary[documentType as keyof typeof templateLibrary];
  
  if (!typeTemplates) {
    console.warn(`Document type '${documentType}' not found in template library`);
    return null;
  }
  
  const template = typeTemplates[templateId as keyof typeof typeTemplates];
  
  if (!template) {
    console.warn(`Template '${templateId}' not found for document type '${documentType}'`);
    return null;
  }
  
  return template;
};

// Get all templates for a document type
export const getAllTemplatesByType = (documentType: string) => {
  return templateLibrary[documentType as keyof typeof templateLibrary] || {};
};

// Get all available document types
export const getAllDocumentTypes = () => {
  return Object.keys(templateLibrary);
};

export default templateLibrary;