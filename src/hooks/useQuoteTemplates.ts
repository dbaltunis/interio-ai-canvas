
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuoteTemplate {
  id: string;
  name: string;
  status: 'active' | 'draft';
  blocks: any[];
  created_at: string;
  updated_at: string;
}

export const useQuoteTemplates = () => {
  return useQuery({
    queryKey: ["quote-templates"],
    queryFn: async () => {
      // For now, return mock data since we don't have templates in the database yet
      // This should be replaced with actual database queries when templates table is created
      const mockTemplates: QuoteTemplate[] = [
        {
          id: 'standard',
          name: 'Standard Quote',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
          id: 'premium',
          name: 'Premium Quote',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
        }
      ];
      
      return mockTemplates;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveQuoteTemplates = () => {
  const { data: templates, ...rest } = useQuoteTemplates();
  
  return {
    data: templates?.filter(template => template.status === 'active') || [],
    ...rest
  };
};
