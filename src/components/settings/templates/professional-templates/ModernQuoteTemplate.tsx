// Modern Quote Template with Professional Blocks
export const modernQuoteTemplate = {
  id: 'modern-quote',
  name: 'Modern Quote',
  description: 'Clean, modern quote design with bold typography and professional layout',
  documentType: 'quote',
  blocks: [
    {
      id: 'header-1',
      type: 'header',
      content: {
        showLogo: true,
        logoPosition: 'left',
        companyName: '{{company_name}}',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        style: {
          backgroundColor: '#1e293b',
          textColor: '#ffffff',
          primaryColor: '#3b82f6'
        }
      }
    },
    {
      id: 'client-info-1',
      type: 'client-info',
      content: {
        title: 'Bill To:',
        showClientName: true,
        showClientEmail: true,
        showClientAddress: true,
        showClientPhone: true
      }
    },
    {
      id: 'products-1',
      type: 'products',
      content: {
        title: 'Quote Items',
        layout: 'detailed',
        showProduct: true,
        showDescription: true,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        tableStyle: 'modern'
      }
    },
    {
      id: 'totals-1',
      type: 'totals',
      content: {
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showTotal: true,
        style: {
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0'
        }
      }
    },
    {
      id: 'signature-1',
      type: 'signature',
      content: {
        showSignature: true,
        signatureLabel: 'Authorized Signature',
        showDate: true,
        dateLabel: 'Date',
        enableDigitalSignature: true
      }
    }
  ]
};