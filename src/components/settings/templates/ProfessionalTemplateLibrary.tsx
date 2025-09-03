import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileText, 
  DollarSign, 
  Building, 
  Palette, 
  X,
  Eye,
  Receipt, 
  Wrench, 
  Ruler, 
  BookOpen,
  Crown,
  Wand2
} from 'lucide-react';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  isPremium?: boolean;
  templates: {
    id: string;
    name: string;
    description: string;
    blocks: any[];
    type: string;
  }[];
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'quotes',
    name: 'Quote Templates',
    description: 'Professional quotations for your services',
    icon: FileText,
    color: 'bg-blue-500',
    templates: [
      {
        id: 'modern-quote',
        name: 'Modern Quote',
        description: 'Clean, professional quote with company branding',
        type: 'enhanced',
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
                backgroundColor: '#f8fafc',
                textColor: '#1e293b'
              }
            }
          },
          {
            id: 'client-info-1',
            type: 'client-info',
            content: {
              title: 'Bill To:',
              showCompany: true,
              showClientEmail: true,
              showClientPhone: true,
              showClientAddress: true
            }
          },
          {
            id: 'products-1',
            type: 'products',
            content: {
              title: 'Quote Items',
              showDescription: true,
              showQuantity: true,
              showUnitPrice: true,
              showTotal: true
            }
          },
          {
            id: 'totals-1',
            type: 'totals',
            content: {
              showSubtotal: true,
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
              signatureLabel: 'Authorized Signature',
              dateLabel: 'Date',
              enableDigitalSignature: false
            }
          }
        ]
      },
      {
        id: 'detailed-quote',
        name: 'Detailed Quote',
        description: 'Comprehensive quote with detailed breakdowns',
        type: 'enhanced',
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
              companyEmail: '{{company_email}}'
            }
          },
          {
            id: 'text-1',
            type: 'text',
            content: {
              text: 'Thank you for considering our services. Please find below our detailed quotation for your project.',
              style: {
                fontSize: '16px',
                padding: '20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px'
              }
            }
          },
          {
            id: 'client-info-2',
            type: 'client-info',
            content: {
              title: 'Project Details:',
              showCompany: true,
              showClientEmail: true,
              showClientPhone: true,
              showClientAddress: true
            }
          },
          {
            id: 'products-2',
            type: 'products',
            content: {
              title: 'Detailed Line Items',
              showDescription: true,
              showQuantity: true,
              showUnitPrice: true,
              showTotal: true
            }
          },
          {
            id: 'totals-2',
            type: 'totals',
            content: {
              showSubtotal: true,
              showTax: true,
              showTotal: true
            }
          },
          {
            id: 'text-2',
            type: 'text',
            content: {
              text: 'Terms & Conditions:\n• Quote valid for 30 days\n• 50% deposit required to commence work\n• Final payment due upon completion\n• All work guaranteed for 12 months',
              style: {
                fontSize: '14px',
                padding: '16px',
                backgroundColor: '#fafafa'
              }
            }
          },
          {
            id: 'signature-2',
            type: 'signature',
            content: {
              signatureLabel: 'Client Acceptance',
              dateLabel: 'Date',
              enableDigitalSignature: true
            }
          }
        ]
      }
    ]
  },
  {
    id: 'invoices',
    name: 'Invoice Templates',
    description: 'Professional invoices for billing',
    icon: Receipt,
    color: 'bg-green-500',
    isPremium: true,
    templates: [
      {
        id: 'standard-invoice',
        name: 'Standard Invoice',
        description: 'Clean invoice template with payment terms',
        type: 'enhanced',
        blocks: [
          {
            id: 'header-3',
            type: 'header',
            content: {
              showLogo: true,
              logoPosition: 'left',
              companyName: '{{company_name}}',
              companyAddress: '{{company_address}}',
              companyPhone: '{{company_phone}}',
              companyEmail: '{{company_email}}'
            }
          },
          {
            id: 'client-info-3',
            type: 'client-info',
            content: {
              title: 'Invoice To:',
              showCompany: true,
              showClientEmail: true,
              showClientPhone: true,
              showClientAddress: true
            }
          },
          {
            id: 'products-3',
            type: 'products',
            content: {
              title: 'Services Provided',
              showDescription: true,
              showQuantity: true,
              showUnitPrice: true,
              showTotal: true
            }
          },
          {
            id: 'totals-3',
            type: 'totals',
            content: {
              showSubtotal: true,
              showTax: true,
              showTotal: true
            }
          },
          {
            id: 'text-3',
            type: 'text',
            content: {
              text: 'Payment Terms: Net 30 days\nPayment due within 30 days of invoice date.\nLate payments may incur additional charges.',
              style: {
                fontSize: '14px',
                padding: '16px',
                backgroundColor: '#fef3c7'
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: 'work-orders',
    name: 'Work Orders',
    description: 'Job specifications and instructions',
    icon: Wrench,
    color: 'bg-orange-500',
    isPremium: true,
    templates: [
      {
        id: 'installer-work-order',
        name: 'Installer Work Order',
        description: 'Detailed work instructions for field teams',
        type: 'enhanced',
        blocks: [
          {
            id: 'header-4',
            type: 'header',
            content: {
              showLogo: true,
              logoPosition: 'left',
              companyName: '{{company_name}}',
              companyAddress: '{{company_address}}',
              companyPhone: '{{company_phone}}',
              companyEmail: '{{company_email}}'
            }
          },
          {
            id: 'text-4',
            type: 'text',
            content: {
              text: 'WORK ORDER INSTRUCTIONS\n\nProject: {{project_name}}\nScheduled Date: {{date}}\nClient: {{client_name}}',
              style: {
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px',
                backgroundColor: '#dbeafe'
              }
            }
          },
          {
            id: 'products-4',
            type: 'products',
            content: {
              title: 'Items to Install',
              showDescription: true,
              showQuantity: true,
              showUnitPrice: false,
              showTotal: false
            }
          },
          {
            id: 'text-5',
            type: 'text',
            content: {
              text: 'Special Instructions:\n• Please call client 30 minutes before arrival\n• Remove shoes when entering home\n• Clean up all debris upon completion\n• Take before/after photos\n• Obtain client signature upon completion',
              style: {
                fontSize: '14px',
                padding: '16px',
                backgroundColor: '#fef3c7'
              }
            }
          },
          {
            id: 'signature-3',
            type: 'signature',
            content: {
              signatureLabel: 'Installer Signature',
              dateLabel: 'Completion Date',
              enableDigitalSignature: false
            }
          }
        ]
      }
    ]
  }
];

interface ProfessionalTemplateLibraryProps {
  onSelectTemplate: (template: any) => void;
  onClose: () => void;
}

export const ProfessionalTemplateLibrary = ({ onSelectTemplate, onClose }: ProfessionalTemplateLibraryProps) => {
  const handleSelectTemplate = (template: any) => {
    onSelectTemplate({
      ...template,
      name: `${template.name} Copy`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-background rounded-lg shadow-xl border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Professional Template Library</h2>
              <p className="text-sm text-gray-600">Choose from our collection of professionally designed templates</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-8">
            {templateCategories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {category.name}
                      {category.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.templates.map((template) => (
                    <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base group-hover:text-brand-primary transition-colors">
                            {template.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {template.blocks.length} blocks
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button 
                          onClick={() => handleSelectTemplate(template)}
                          className="w-full group-hover:bg-brand-primary group-hover:text-white transition-colors"
                          variant="outline"
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};