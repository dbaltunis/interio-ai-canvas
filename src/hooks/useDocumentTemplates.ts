
import { useState, useEffect } from "react";

export interface DocumentTemplate {
  id: number;
  name: string;
  type: string;
  status: string;
  lastModified: string;
  blocks?: any[];
}

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from settings - this should match the templates from DocumentTemplatesTab
    const mockTemplates: DocumentTemplate[] = [
      { 
        id: 1, 
        name: "Standard Quote", 
        type: "Quote", 
        status: "Active", 
        lastModified: "2024-01-15",
        blocks: [
          {
            id: 'header-1',
            type: 'header',
            content: {
              companyName: '{{company_name}}',
              address: '{{company_address}}',
              phone: '{{company_phone}}',
              email: '{{company_email}}',
              logoPosition: 'left' as const,
              quoteTitle: 'QUOTE',
              quoteNumber: 'QT-{{quote_number}}',
              date: '{{date}}',
              validUntil: '{{valid_until}}'
            },
            styles: {
              backgroundColor: '#f8fafc',
              textColor: '#1e293b',
              fontSize: 'base'
            }
          },
          {
            id: 'client-1',
            type: 'client',
            content: {
              title: 'Bill To:',
              showCompany: true,
              showAddress: true,
              showContact: true
            },
            styles: {
              backgroundColor: '#ffffff',
              textColor: '#374151',
              fontSize: 'sm'
            }
          },
          {
            id: 'products-1',
            type: 'products',
            content: {
              title: 'Quote Items',
              tableStyle: 'simple' as 'simple' | 'detailed',
              columns: ['product', 'description', 'qty', 'unit_price', 'total'],
              showTax: true,
              taxLabel: 'Tax',
              showSubtotal: true
            },
            styles: {
              backgroundColor: '#ffffff',
              textColor: '#374151',
              fontSize: 'sm'
            }
          },
          {
            id: 'footer-1',
            type: 'footer',
            content: {
              text: 'Thank you for your business!',
              showTerms: true,
              companyInfo: 'Contact us at {{company_phone}} or {{company_email}}'
            },
            styles: {
              backgroundColor: '#f8fafc',
              textColor: '#6b7280',
              fontSize: 'xs'
            }
          }
        ]
      },
      { 
        id: 2, 
        name: "Premium Quote", 
        type: "Quote", 
        status: "Active", 
        lastModified: "2024-01-10",
        blocks: [
          {
            id: 'header-1',
            type: 'header',
            content: {
              companyName: '{{company_name}}',
              address: '{{company_address}}',
              phone: '{{company_phone}}',
              email: '{{company_email}}',
              logoPosition: 'right' as const,
              quoteTitle: 'PREMIUM QUOTE',
              quoteNumber: 'PQ-{{quote_number}}',
              date: '{{date}}',
              validUntil: '{{valid_until}}'
            },
            styles: {
              backgroundColor: '#1e40af',
              textColor: '#ffffff',
              fontSize: 'lg'
            }
          },
          {
            id: 'client-1',
            type: 'client',
            content: {
              title: 'Client Information:',
              showCompany: true,
              showAddress: true,
              showContact: true
            },
            styles: {
              backgroundColor: '#ffffff',
              textColor: '#374151',
              fontSize: 'base'
            }
          },
          {
            id: 'products-1',
            type: 'products',
            content: {
              title: 'Detailed Quote Breakdown',
              tableStyle: 'detailed' as 'simple' | 'detailed',
              columns: ['product', 'description', 'qty', 'unit_price', 'total'],
              showTax: true,
              taxLabel: 'Sales Tax',
              showSubtotal: true
            },
            styles: {
              backgroundColor: '#ffffff',
              textColor: '#374151',
              fontSize: 'sm'
            }
          },
          {
            id: 'footer-1',
            type: 'footer',
            content: {
              text: 'Thank you for choosing our premium services!',
              showTerms: true,
              companyInfo: 'Premium support: {{company_phone}} | {{company_email}}'
            },
            styles: {
              backgroundColor: '#1e40af',
              textColor: '#ffffff',
              fontSize: 'sm'
            }
          }
        ]
      },
      { 
        id: 3, 
        name: "Installation Invoice", 
        type: "Invoice", 
        status: "Active", 
        lastModified: "2024-01-08" 
      },
      { 
        id: 4, 
        name: "Work Order - Curtains", 
        type: "Work Order", 
        status: "Draft", 
        lastModified: "2024-01-05" 
      }
    ];

    // Filter only active quote templates
    const activeQuoteTemplates = mockTemplates.filter(
      template => template.type === "Quote" && template.status === "Active"
    );

    setTemplates(activeQuoteTemplates);
    setIsLoading(false);
  }, []);

  return {
    data: templates,
    isLoading
  };
};

export const useActiveQuoteTemplates = () => {
  return useDocumentTemplates();
};
