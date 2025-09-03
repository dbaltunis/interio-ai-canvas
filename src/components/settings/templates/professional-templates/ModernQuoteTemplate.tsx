export const modernQuoteTemplate = {
  id: 'modern-quote',
  name: 'Modern Quote',
  description: 'Clean, professional layout with subtle branding',
  documentType: 'quote',
  blocks: [
    {
      id: 'modern-header',
      type: 'header',
      content: {
        layout: 'split',
        showLogo: true,
        logoPosition: 'left',
        companyName: '{{company_name}}',
        companyTagline: 'Professional Window Solutions',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        companyWebsite: '{{company_website}}',
        style: {
          primaryColor: '#2563eb',
          secondaryColor: '#f1f5f9',
          textColor: '#1e293b',
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          fontSize: '16px',
          fontFamily: 'Inter, sans-serif',
          headerHeight: '120px'
        }
      },
      editable: true
    },
    {
      id: 'quote-details',
      type: 'quote-info',
      content: {
        layout: 'modern-grid',
        quoteNumber: '{{quote_number}}',
        quoteDate: '{{quote_date}}',
        validUntil: '{{valid_until}}',
        projectName: '{{project_name}}',
        style: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0'
        }
      },
      editable: true
    },
    {
      id: 'client-details',
      type: 'client-info',
      content: {
        layout: 'modern-card',
        title: 'Project Details',
        showClientName: true,
        showClientCompany: true,
        showClientEmail: true,
        showClientAddress: true,
        showClientPhone: true,
        style: {
          cardStyle: 'elevated',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0'
        }
      },
      editable: true
    },
    {
      id: 'intro-section',
      type: 'text',
      content: {
        text: 'Thank you for considering our professional window treatment services. We are pleased to present this comprehensive quotation tailored to your specific requirements.',
        style: {
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#475569',
          margin: '32px 0',
          fontWeight: '400'
        }
      },
      editable: true
    },
    {
      id: 'products-showcase',
      type: 'products',
      content: {
        layout: 'modern-detailed',
        showProduct: true,
        showDescription: true,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        showTax: false,
        tableStyle: 'modern-striped',
        style: {
          headerBackgroundColor: '#2563eb',
          headerTextColor: '#ffffff',
          rowBackgroundColor: '#ffffff',
          alternateRowColor: '#f8fafc',
          borderColor: '#e2e8f0',
          borderRadius: '8px'
        }
      },
      editable: true
    },
    {
      id: 'pricing-summary',
      type: 'totals',
      content: {
        layout: 'modern-card',
        showSubtotal: true,
        showDiscount: false,
        showTax: true,
        showTotal: true,
        style: {
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          padding: '24px',
          margin: '32px 0',
          totalHighlight: '#2563eb'
        }
      },
      editable: true
    },
    {
      id: 'terms-conditions',
      type: 'text',
      content: {
        title: 'Terms & Conditions',
        text: `• Payment: 50% deposit required, balance due on completion
• Validity: This quote is valid for 30 days from the date of issue
• Installation: Professional installation included in quoted price
• Warranty: 5-year manufacturer warranty on all products
• Delivery: 2-3 weeks from confirmation of order`,
        style: {
          backgroundColor: '#fefce8',
          borderLeft: '4px solid #eab308',
          padding: '20px',
          borderRadius: '0 8px 8px 0',
          fontSize: '14px',
          lineHeight: '1.5'
        }
      },
      editable: true
    },
    {
      id: 'next-steps',
      type: 'call-to-action',
      content: {
        title: 'Ready to Proceed?',
        description: 'We\'re excited to transform your space with beautiful window treatments.',
        buttonText: 'Accept Quote',
        buttonStyle: 'primary',
        contactInfo: 'Questions? Call us at {{company_phone}} or email {{company_email}}',
        style: {
          backgroundColor: '#2563eb',
          textColor: '#ffffff',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }
      },
      editable: true
    },
    {
      id: 'modern-footer',
      type: 'footer',
      content: {
        layout: 'modern-minimal',
        text: 'Thank you for choosing {{company_name}} for your window treatment needs.',
        includeTerms: false,
        style: {
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748b',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          marginTop: '40px'
        }
      },
      editable: true
    }
  ]
};

export const detailedQuoteTemplate = {
  id: 'detailed-quote',
  name: 'Detailed Quote',
  description: 'Comprehensive breakdown with room-by-room pricing',
  documentType: 'quote',
  blocks: [
    {
      id: 'detailed-header',
      type: 'header',
      content: {
        layout: 'professional',
        showLogo: true,
        logoPosition: 'center',
        companyName: '{{company_name}}',
        companyTagline: 'Bespoke Window Solutions Since 2010',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        companyWebsite: '{{company_website}}',
        style: {
          primaryColor: '#059669',
          secondaryColor: '#ecfdf5',
          textColor: '#065f46',
          backgroundColor: '#ffffff',
          borderColor: '#10b981',
          fontSize: '16px',
          fontFamily: 'Georgia, serif',
          headerHeight: '140px'
        }
      },
      editable: true
    },
    {
      id: 'project-overview',
      type: 'project-summary',
      content: {
        title: 'Project Overview',
        projectName: '{{project_name}}',
        clientName: '{{client_name}}',
        projectAddress: '{{client_address}}',
        consultationDate: '{{consultation_date}}',
        estimatedCompletion: '{{estimated_completion}}',
        style: {
          layout: 'detailed-grid',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '24px'
        }
      },
      editable: true
    },
    {
      id: 'room-breakdown',
      type: 'room-by-room',
      content: {
        title: 'Room-by-Room Breakdown',
        showRoomImages: true,
        showMeasurements: true,
        showProductDetails: true,
        groupByRoom: true,
        style: {
          roomHeaderColor: '#059669',
          roomBackgroundColor: '#f9fafb',
          productBackgroundColor: '#ffffff'
        }
      },
      editable: true
    },
    {
      id: 'detailed-products',
      type: 'products',
      content: {
        layout: 'detailed-breakdown',
        showProduct: true,
        showDescription: true,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        showRoomLocation: true,
        showMeasurements: true,
        tableStyle: 'detailed-bordered',
        style: {
          headerBackgroundColor: '#059669',
          headerTextColor: '#ffffff',
          rowBackgroundColor: '#ffffff',
          alternateRowColor: '#f9fafb'
        }
      },
      editable: true
    },
    {
      id: 'cost-breakdown',
      type: 'cost-analysis',
      content: {
        showMaterialsCost: true,
        showLaborCost: true,
        showInstallationCost: true,
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showTotal: true,
        style: {
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '24px'
        }
      },
      editable: true
    },
    {
      id: 'detailed-terms',
      type: 'detailed-terms',
      content: {
        title: 'Detailed Terms & Conditions',
        sections: [
          {
            title: 'Payment Schedule',
            content: '• 30% deposit upon acceptance\n• 40% on commencement of manufacturing\n• 30% balance on completion of installation'
          },
          {
            title: 'Installation Details',
            content: '• Professional measuring and installation included\n• Installation typically takes 1-2 days\n• Furniture protection and cleanup included'
          },
          {
            title: 'Warranty Information',
            content: '• 5-year manufacturer warranty on all hardware\n• 2-year installation warranty\n• Fabric warranty varies by manufacturer'
          }
        ],
        style: {
          sectionSpacing: '20px',
          titleColor: '#059669',
          contentBackgroundColor: '#ffffff'
        }
      },
      editable: true
    }
  ]
};

export const luxuryQuoteTemplate = {
  id: 'luxury-quote',
  name: 'Luxury Quote',
  description: 'Premium design for high-end clients',
  documentType: 'quote',
  blocks: [
    {
      id: 'luxury-header',
      type: 'header',
      content: {
        layout: 'luxury-elegant',
        showLogo: true,
        logoPosition: 'center',
        companyName: '{{company_name}}',
        companyTagline: 'Exquisite Window Couture',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        style: {
          primaryColor: '#7c3aed',
          secondaryColor: '#faf5ff',
          accentColor: '#d4af37',
          textColor: '#581c87',
          backgroundColor: '#ffffff',
          fontFamily: 'Playfair Display, serif',
          headerHeight: '160px',
          borderStyle: 'luxury-embossed'
        }
      },
      editable: true
    },
    {
      id: 'luxury-intro',
      type: 'luxury-introduction',
      content: {
        title: 'Bespoke Window Treatment Proposal',
        subtitle: 'Crafted exclusively for discerning clientele',
        personalMessage: 'Dear {{client_name}},\n\nWe are delighted to present this exclusive proposal for your luxury window treatment requirements. Each piece will be meticulously handcrafted to the highest standards of excellence.',
        style: {
          backgroundColor: '#faf5ff',
          borderColor: '#d4af37',
          padding: '40px',
          fontStyle: 'elegant'
        }
      },
      editable: true
    },
    {
      id: 'luxury-portfolio',
      type: 'portfolio-showcase',
      content: {
        title: 'Curated Selection',
        showProductImages: true,
        showMaterialSamples: true,
        showDesignConcepts: true,
        layout: 'gallery-luxury',
        style: {
          galleryBackgroundColor: '#ffffff',
          borderColor: '#d4af37',
          shadowStyle: 'luxury-elevated'
        }
      },
      editable: true
    },
    {
      id: 'luxury-products',
      type: 'products',
      content: {
        layout: 'luxury-showcase',
        showProduct: true,
        showDescription: true,
        showMaterials: true,
        showCraftsmanship: true,
        showQuantity: true,
        showInvestment: true,
        tableStyle: 'luxury-minimal',
        style: {
          headerBackgroundColor: '#7c3aed',
          headerTextColor: '#ffffff',
          accentColor: '#d4af37',
          rowSpacing: '24px'
        }
      },
      editable: true
    },
    {
      id: 'luxury-investment',
      type: 'investment-summary',
      content: {
        title: 'Investment Summary',
        showDesignConsultation: true,
        showBespokeCrafting: true,
        showProfessionalInstallation: true,
        showSubtotal: true,
        showTotal: true,
        currencySymbol: '£',
        style: {
          backgroundColor: '#faf5ff',
          borderColor: '#d4af37',
          padding: '32px',
          totalHighlight: '#7c3aed'
        }
      },
      editable: true
    },
    {
      id: 'luxury-concierge',
      type: 'concierge-service',
      content: {
        title: 'White Glove Service',
        services: [
          'Complimentary design consultation',
          'Bespoke manufacturing by master craftsmen',
          'Professional installation and styling',
          'Comprehensive aftercare service',
          'Lifetime craftsmanship guarantee'
        ],
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#d4af37',
          iconColor: '#7c3aed'
        }
      },
      editable: true
    }
  ]
};