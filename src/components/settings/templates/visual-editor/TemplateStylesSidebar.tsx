import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Layout, Briefcase, Star } from "lucide-react";

interface TemplateStylesSidebarProps {
  onSelectTemplate: (blocks: any[]) => void;
  currentBlocks: any[];
}

const templatePresets = [
  {
    id: 'simple',
    name: 'Simple Quote',
    icon: FileText,
    description: 'Clean, minimal design',
    category: 'Basic',
    preview: '/placeholder.svg',
    blocks: [
      {
        id: 'header-simple',
        type: 'header',
        content: {
          showLogo: true,
          logoPosition: 'left',
          companyName: '{{company_name}}',
          companyAddress: '{{company_address}}',
          companyPhone: '{{company_phone}}',
          companyEmail: '{{company_email}}',
          style: { 
            primaryColor: '#2563eb', 
            textColor: '#1e293b',
            backgroundColor: '#f8fafc'
          }
        },
        styles: {
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }
      },
      {
        id: 'client-simple',
        type: 'client-info',
        content: {
          title: 'Bill To:',
          showClientName: true,
          showClientEmail: true,
          showClientAddress: true,
          showClientPhone: false
        }
      },
      {
        id: 'products-simple',
        type: 'products',
        content: {
          layout: 'simple',
          showProduct: true,
          showDescription: false,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true,
          tableStyle: 'minimal'
        }
      },
      {
        id: 'totals-simple',
        type: 'totals',
        content: {
          showSubtotal: true,
          showTax: true,
          showTotal: true
        }
      },
      {
        id: 'footer-simple',
        type: 'footer',
        content: {
          text: 'Thank you for your business!',
          includeTerms: true
        }
      }
    ]
  },
  {
    id: 'detailed',
    name: 'Detailed Professional',
    icon: Briefcase,
    description: 'Comprehensive breakdown with itemized costs',
    category: 'Professional',
    preview: '/placeholder.svg',
    blocks: [
      {
        id: 'header-detailed',
        type: 'header',
        content: {
          showLogo: true,
          logoPosition: 'left',
          companyName: '{{company_name}}',
          companyAddress: '{{company_address}}',
          companyPhone: '{{company_phone}}',
          companyEmail: '{{company_email}}',
          style: { 
            primaryColor: '#059669', 
            textColor: '#064e3b',
            backgroundColor: '#ecfdf5'
          }
        },
        styles: {
          backgroundColor: '#ecfdf5',
          borderRadius: '0.75rem',
          padding: '2rem',
          border: '1px solid #a7f3d0'
        }
      },
      {
        id: 'intro-detailed',
        type: 'text',
        content: {
          text: 'We are pleased to present this detailed quote for your window treatment project. Please review each item carefully.',
          style: 'intro'
        }
      },
      {
        id: 'client-detailed',
        type: 'client-info',
        content: {
          title: 'Project Details & Client Information:',
          showClientName: true,
          showClientEmail: true,
          showClientAddress: true,
          showClientPhone: true
        }
      },
      {
        id: 'products-detailed',
        type: 'products',
        content: {
          layout: 'detailed',
          showProduct: true,
          showDescription: true,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true,
          showTax: true,
          tableStyle: 'bordered'
        }
      },
      {
        id: 'totals-detailed',
        type: 'totals',
        content: {
          showSubtotal: true,
          showTax: true,
          showTotal: true
        }
      },
      {
        id: 'terms-detailed',
        type: 'text',
        content: {
          text: 'Terms & Conditions: Payment terms are Net 30 days. This quote is valid for 30 days from the date above. All materials and labor are guaranteed for 1 year.',
          style: 'terms'
        }
      },
      {
        id: 'signature-detailed',
        type: 'signature',
        content: {
          showSignature: true,
          signatureLabel: 'Client Approval',
          showDate: true,
          dateLabel: 'Date Approved'
        }
      },
      {
        id: 'footer-detailed',
        type: 'footer',
        content: {
          text: 'We appreciate your business and look forward to working with you!',
          includeTerms: true
        }
      }
    ]
  },
  {
    id: 'brochure',
    name: 'Marketing Brochure',
    icon: Sparkles,
    description: 'Beautiful brochure-style with images and rich content',
    category: 'Premium',
    premium: true,
    preview: '/placeholder.svg',
    blocks: [
      {
        id: 'header-brochure',
        type: 'header',
        content: {
          showLogo: true,
          logoPosition: 'center',
          companyName: '{{company_name}}',
          companyAddress: '{{company_address}}',
          companyPhone: '{{company_phone}}',
          companyEmail: '{{company_email}}',
          style: { 
            primaryColor: '#7c3aed', 
            textColor: '#ffffff',
            backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
          }
        },
        styles: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: '#ffffff',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center'
        }
      },
      {
        id: 'hero-image',
        type: 'image',
        content: {
          src: '/placeholder.svg',
          alt: 'Beautiful window treatments showcase',
          width: '100%',
          alignment: 'center',
          caption: 'Transform Your Space with Premium Window Treatments'
        }
      },
      {
        id: 'intro-brochure',
        type: 'text',
        content: {
          text: 'Experience the perfect blend of style, functionality, and craftsmanship. Our custom window treatments are designed to enhance your space while providing superior light control and privacy.',
          style: 'hero'
        }
      },
      {
        id: 'client-brochure',
        type: 'client-info',
        content: {
          title: 'Prepared Exclusively For:',
          showClientName: true,
          showClientEmail: false,
          showClientAddress: true,
          showClientPhone: false
        }
      },
      {
        id: 'showcase-images',
        type: 'image',
        content: {
          src: '/placeholder.svg',
          alt: 'Product showcase gallery',
          width: '100%',
          alignment: 'center',
          layout: 'grid'
        }
      },
      {
        id: 'products-brochure',
        type: 'products',
        content: {
          layout: 'itemized',
          showProduct: true,
          showDescription: true,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true,
          tableStyle: 'elegant'
        }
      },
      {
        id: 'features-text',
        type: 'text',
        content: {
          text: '✓ Premium Materials  ✓ Expert Installation  ✓ 5-Year Warranty  ✓ Free Consultation',
          style: 'features'
        }
      },
      {
        id: 'totals-brochure',
        type: 'totals',
        content: {
          showSubtotal: true,
          showTax: true,
          showTotal: true
        }
      },
      {
        id: 'payment-brochure',
        type: 'payment',
        content: {
          paymentType: 'full',
          currency: '$',
          buttonText: 'Accept & Pay',
          description: 'Secure online payment processing',
          showInstallments: true
        }
      },
      {
        id: 'footer-brochure',
        type: 'footer',
        content: {
          text: 'Thank you for choosing us for your window treatment needs!',
          includeTerms: true
        },
        styles: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '0.75rem',
          padding: '2rem'
        }
      }
    ]
  }
];

export const TemplateStylesSidebar = ({ onSelectTemplate, currentBlocks }: TemplateStylesSidebarProps) => {
  const categories = ['Basic', 'Professional', 'Premium'];

  return (
    <div className="h-full p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Styles</h3>
        <p className="text-sm text-gray-600">Choose a professional template to get started</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-800">{category}</h4>
            {category === 'Premium' && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            {templatePresets
              .filter(template => template.category === category)
              .map((template) => (
                <Card key={template.id} className="p-3 hover:shadow-md transition-all cursor-pointer group">
                  <div 
                    className="space-y-2"
                    onClick={() => onSelectTemplate(template.blocks)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 p-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors">
                        <template.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm text-gray-900 truncate">
                            {template.name}
                          </h5>
                          {template.premium && (
                            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Template Preview */}
                    <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                      <div className="bg-white rounded shadow-sm p-2 text-xs space-y-1">
                        <div className="h-2 bg-blue-100 rounded w-3/4"></div>
                        <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                        <div className="grid grid-cols-3 gap-1 my-2">
                          <div className="h-1 bg-green-100 rounded"></div>
                          <div className="h-1 bg-green-100 rounded"></div>
                          <div className="h-1 bg-green-100 rounded"></div>
                        </div>
                        <div className="h-1 bg-blue-200 rounded w-1/3 ml-auto"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Custom Template Section */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-800 mb-3">Custom Templates</h4>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => onSelectTemplate([])}
        >
          <Layout className="h-4 w-4 mr-2" />
          Start Blank Template
        </Button>
      </div>
    </div>
  );
};