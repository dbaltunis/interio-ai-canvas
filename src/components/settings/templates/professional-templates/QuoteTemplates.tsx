// Advanced Quote Template with Dynamic Features
export const detailedQuoteTemplate = {
  id: 'detailed-quote',
  name: 'Detailed Quote',
  description: 'Comprehensive quote template with detailed breakdowns and professional styling',
  documentType: 'quote',
  blocks: [
    {
      id: 'header-2',
      type: 'header',
      content: {
        showLogo: true,
        logoPosition: 'center',
        companyName: '{{company_name}}',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        style: {
          backgroundColor: '#059669',
          textColor: '#ffffff',
          primaryColor: '#10b981'
        }
      }
    },
    {
      id: 'spacer-1',
      type: 'spacer',
      content: {
        height: '30px'
      }
    },
    {
      id: 'text-intro',
      type: 'text',
      content: {
        text: 'Thank you for considering our services. Please find below a detailed quote for your project requirements.',
        style: {
          fontSize: '16px',
          textAlign: 'center',
          color: '#6b7280',
          fontStyle: 'italic'
        }
      }
    },
    {
      id: 'client-info-2',
      type: 'client-info',
      content: {
        title: 'Project Details',
        showClientName: true,
        showClientEmail: true,
        showClientAddress: true,
        showClientPhone: true,
        showCompany: true
      }
    },
    {
      id: 'products-2',
      type: 'products',
      content: {
        title: 'Detailed Quote Items',
        layout: 'itemized',
        showProduct: true,
        showDescription: true,
        showRoom: true,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        showSubtotal: true,
        tableStyle: 'detailed'
      }
    },
    {
      id: 'totals-2',
      type: 'totals',
      content: {
        showSubtotal: true,
        showTax: true,
        showTotal: true,
        showDiscount: true,
        style: {
          backgroundColor: '#f0fdf4',
          borderColor: '#22c55e'
        }
      }
    },
    {
      id: 'text-terms',
      type: 'text',
      content: {
        text: 'Terms & Conditions:\n• Payment due within 30 days of project completion\n• 50% deposit required to commence work\n• All materials guaranteed for 12 months\n• Quote valid for 30 days from date of issue',
        style: {
          fontSize: '12px',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderLeft: '4px solid #10b981'
        }
      }
    },
    {
      id: 'signature-2',
      type: 'signature',
      content: {
        showSignature: true,
        signatureLabel: 'Client Approval',
        showDate: true,
        dateLabel: 'Date Approved',
        enableDigitalSignature: true
      }
    }
  ]
};

// Luxury Quote Template with Premium Design
export const luxuryQuoteTemplate = {
  id: 'luxury-quote',
  name: 'Luxury Quote',
  description: 'Premium quote design with elegant styling and sophisticated layout',
  documentType: 'quote',
  blocks: [
    {
      id: 'header-3',
      type: 'header',
      content: {
        showLogo: true,
        logoPosition: 'right',
        companyName: '{{company_name}}',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        style: {
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          primaryColor: '#8b5cf6'
        }
      }
    },
    {
      id: 'divider-1',
      type: 'divider',
      content: {
        thickness: '2px',
        color: '#d1d5db'
      }
    },
    {
      id: 'text-luxury-intro',
      type: 'text',
      content: {
        text: 'EXCLUSIVE PROPOSAL',
        style: {
          fontSize: '24px',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#7c3aed',
          letterSpacing: '2px'
        }
      }
    },
    {
      id: 'client-info-3',
      type: 'client-info',
      content: {
        title: 'Prepared For:',
        showClientName: true,
        showClientEmail: true,
        showClientAddress: true,
        showClientPhone: true
      }
    },
    {
      id: 'products-3',
      type: 'products',
      content: {
        title: 'Premium Services',
        layout: 'visual',
        showProduct: true,
        showDescription: true,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        tableStyle: 'luxury'
      }
    },
    {
      id: 'totals-3',
      type: 'totals',
      content: {
        showSubtotal: true,
        showTax: true,
        showTotal: true,
        style: {
          backgroundColor: '#faf5ff',
          borderColor: '#7c3aed'
        }
      }
    },
    {
      id: 'signature-3',
      type: 'signature',
      content: {
        showSignature: true,
        signatureLabel: 'Executive Approval',
        showDate: true,
        dateLabel: 'Date',
        enableDigitalSignature: true
      }
    }
  ]
};