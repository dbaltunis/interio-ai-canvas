import { modernQuoteTemplate, detailedQuoteTemplate, luxuryQuoteTemplate } from './ModernQuoteTemplate';
import { productShowcaseTemplate, digitalEbookTemplate } from './BrochureTemplates';
import { 
  standardInvoiceTemplate, 
  installerWorkOrderTemplate, 
  measurementSheetTemplate 
} from './BusinessDocumentTemplates';

// Template library with all professional templates
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
    'installer-workorder': installerWorkOrderTemplate,
    'fitter-workorder': {
      ...installerWorkOrderTemplate,
      id: 'fitter-workorder',
      name: 'Fitter Work Order',
      description: 'Specialized fitting instructions and measurements'
    }
  },
  measurement: {
    'standard-measurement': measurementSheetTemplate
  },
  brochure: {
    'product-showcase': productShowcaseTemplate,
    'company-brochure': {
      ...productShowcaseTemplate,
      id: 'company-brochure',
      name: 'Company Brochure',
      description: 'Professional company presentation'
    },
    'ebook-template': digitalEbookTemplate
  },
  portfolio: {
    'project-portfolio': {
      id: 'project-portfolio',
      name: 'Project Portfolio',
      description: 'Before/after project showcases',
      documentType: 'portfolio',
      blocks: [
        {
          id: 'portfolio-cover',
          type: 'cover-page',
          content: {
            title: '{{company_name}} Portfolio',
            subtitle: 'Transforming Homes with Beautiful Window Treatments',
            style: {
              backgroundColor: '#1e293b',
              textColor: '#ffffff'
            }
          },
          editable: true
        },
        {
          id: 'project-showcase',
          type: 'project-gallery',
          content: {
            title: 'Recent Projects',
            projects: [
              {
                name: 'Modern Family Home',
                location: 'Chelsea, London',
                beforeImage: '/api/placeholder/400/300',
                afterImage: '/api/placeholder/400/300',
                description: 'Complete window treatment solution for contemporary family home'
              }
            ],
            style: {
              layout: 'before-after-gallery'
            }
          },
          editable: true
        }
      ]
    }
  }
};

export const getTemplateByTypeAndId = (documentType: string, templateId: string) => {
  const typeTemplates = templateLibrary[documentType as keyof typeof templateLibrary];
  if (!typeTemplates) {
    console.warn(`Document type "${documentType}" not found in template library`);
    return null;
  }
  
  const template = typeTemplates[templateId as keyof typeof typeTemplates];
  if (!template) {
    console.warn(`Template "${templateId}" not found for document type "${documentType}"`);
    return null;
  }
  
  return template;
};

export const getAllTemplatesByType = (documentType: string) => {
  return templateLibrary[documentType as keyof typeof templateLibrary] || {};
};

export const getAllDocumentTypes = () => {
  return Object.keys(templateLibrary);
};

export default templateLibrary;