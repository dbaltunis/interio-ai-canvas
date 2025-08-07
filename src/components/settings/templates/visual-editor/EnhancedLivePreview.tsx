import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Download, Share2, Eye, Printer } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface EnhancedLivePreviewProps {
  blocks: any[];
  projectData?: {
    project: any;
    treatments: any[];
    rooms: any[];
    surfaces: any[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    markupPercentage: number;
  };
  templateStyle?: 'simple' | 'detailed' | 'brochure';
}

export const EnhancedLivePreview = ({ 
  blocks, 
  projectData, 
  templateStyle = 'detailed' 
}: EnhancedLivePreviewProps) => {
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get client data if project data is available
  const client = projectData?.project?.client_id 
    ? clients?.find(c => c.id === projectData.project.client_id) 
    : null;

  const formatCurrency = (amount: number) => {
    if (businessSettings?.measurement_units) {
      try {
        const units = JSON.parse(businessSettings.measurement_units);
        const currency = units.currency || 'USD';
        const currencySymbols: Record<string, string> = {
          'NZD': 'NZ$',
          'AUD': 'A$',
          'USD': '$',
          'GBP': '£',
          'EUR': '€',
          'ZAR': 'R'
        };
        return `${currencySymbols[currency] || currency}${amount.toFixed(2)}`;
      } catch {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      }
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const replaceTokens = (text: string, data: any = {}) => {
    if (!text) return '';
    
    const tokens = {
      company_name: businessSettings?.company_name || 'Your Company Name',
      company_address: businessSettings?.address || 'Your Company Address',
      company_phone: businessSettings?.business_phone || '(555) 123-4567',
      company_email: businessSettings?.business_email || 'info@company.com',
      client_name: client?.name || 'Client Name',
      client_email: client?.email || 'client@email.com',
      client_address: client?.address || 'Client Address',
      client_phone: client?.phone || 'Client Phone',
      quote_number: `QT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toLocaleDateString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      ...data
    };

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return tokens[key] || match;
    });
  };

  const renderBlock = (block: any) => {
    const applyStyles = (baseClasses: string, blockStyles?: any) => {
      return `${baseClasses} ${blockStyles?.className || ''}`;
    };

    const getInlineStyles = (blockStyles?: any) => {
      if (!blockStyles) return {};
      
      return {
        background: blockStyles.background || blockStyles.backgroundColor,
        color: blockStyles.color || blockStyles.textColor,
        padding: blockStyles.padding,
        borderRadius: blockStyles.borderRadius,
        textAlign: blockStyles.textAlign,
        boxShadow: blockStyles.boxShadow,
        border: blockStyles.border,
        backgroundImage: blockStyles.backgroundImage,
        backgroundOrigin: blockStyles.backgroundOrigin,
        backgroundClip: blockStyles.backgroundClip,
        backdropFilter: blockStyles.backdropFilter,
        opacity: blockStyles.opacity
      };
    };

    switch (block.type) {
      case 'header':
        return (
          <div 
            key={block.id}
            className={applyStyles("mb-8 p-6 rounded-lg", block.styles)}
            style={getInlineStyles(block.styles)}
          >
            <div className={`flex items-start justify-between ${
              block.content.logoPosition === 'center' ? 'flex-col items-center text-center' : 
              block.content.logoPosition === 'right' ? 'flex-row-reverse' : ''
            }`}>
              <div className={block.content.logoPosition === 'right' ? 'text-right' : ''}>
                <h1 className="text-3xl font-bold mb-2 text-inherit">
                  {replaceTokens(block.content.companyName)}
                </h1>
                <div className="space-y-1 opacity-90 text-sm">
                  <p>{replaceTokens(block.content.companyAddress)}</p>
                  <p>{replaceTokens(block.content.companyPhone)}</p>
                  <p>{replaceTokens(block.content.companyEmail)}</p>
                </div>
              </div>
              
              {templateStyle === 'brochure' && (
                <div className="text-center">
                  <h2 className="text-4xl font-light mb-4">Window Treatment Solutions</h2>
                  <p className="text-lg opacity-80">Custom Design • Professional Installation • Premium Quality</p>
                </div>
              )}
              
              <div className={`${block.content.logoPosition === 'center' ? 'mt-4' : ''}`}>
                <h2 className="text-2xl font-semibold mb-2">QUOTATION</h2>
                <div className="text-sm space-y-1">
                  <p>Quote #: {replaceTokens('{{quote_number}}')}</p>
                  <p>Date: {replaceTokens('{{date}}')}</p>
                  <p>Valid Until: {replaceTokens('{{valid_until}}')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'client-info':
        return (
          <div key={block.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-brand-primary">
              {block.content.title}
            </h3>
            {client ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                {block.content.showClientName && (
                  <p className="font-medium">{client.name}</p>
                )}
                {block.content.showClientEmail && client.email && (
                  <p className="text-gray-600">{client.email}</p>
                )}
                {block.content.showClientAddress && client.address && (
                  <p className="text-gray-600">{client.address}</p>
                )}
                {block.content.showClientPhone && client.phone && (
                  <p className="text-gray-600">{client.phone}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 italic">Client information will appear here</p>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div 
            key={block.id} 
            className={`mb-6 ${
              block.content.style === 'intro' ? 'text-lg leading-relaxed' :
              block.content.style === 'terms' ? 'text-sm text-gray-600' :
              block.content.style === 'hero' ? 'text-xl leading-relaxed text-center' :
              block.content.style === 'features' ? 'text-base' :
              'text-base'
            }`}
          >
            {block.content.style === 'features' ? (
              <div className="grid grid-cols-2 gap-4 text-center">
                {block.content.text.split('✓').filter(Boolean).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center justify-center gap-2 bg-green-50 p-3 rounded-lg">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="font-medium">{feature.trim()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>{replaceTokens(block.content.text)}</p>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="mb-8">
            <div className={`${
              block.content.alignment === 'center' ? 'text-center' :
              block.content.alignment === 'right' ? 'text-right' :
              'text-left'
            }`}>
              {block.content.layout === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Product {i}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-600 text-lg font-medium mb-2">
                      {block.content.caption || "Beautiful Window Treatments"}
                    </div>
                    <div className="text-gray-500 text-sm">Professional showcase image</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'products':
        return (
          <div key={block.id} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-brand-primary">Quote Items</h3>
            
            {block.content.layout === 'itemized' || templateStyle === 'brochure' ? (
              // Detailed itemized view for brochure style
              <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-3 border-b">
                    <h4 className="font-semibold text-brand-primary">Living Room - Main Window</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Item</th>
                          <th className="text-left p-3 text-sm font-medium">Description</th>
                          <th className="text-center p-3 text-sm font-medium">Qty</th>
                          <th className="text-right p-3 text-sm font-medium">Rate</th>
                          <th className="text-right p-3 text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3 font-medium">Roman Blinds</td>
                          <td className="p-3 text-sm">Premium motorized blinds</td>
                          <td className="p-3 text-center">2</td>
                          <td className="p-3 text-right">{formatCurrency(484.54)}</td>
                          <td className="p-3 text-right font-medium">{formatCurrency(969.08)}</td>
                        </tr>
                        <tr className="border-t bg-gray-50">
                          <td className="p-3 pl-8 text-sm">• Fabric</td>
                          <td className="p-3 text-sm">OSL/01 Pepper | 1.44m width</td>
                          <td className="p-3 text-center text-sm">7.88m</td>
                          <td className="p-3 text-right text-sm">{formatCurrency(91.00)}</td>
                          <td className="p-3 text-right text-sm">{formatCurrency(717.08)}</td>
                        </tr>
                        <tr className="border-t bg-gray-50">
                          <td className="p-3 pl-8 text-sm">• Manufacturing</td>
                          <td className="p-3 text-sm">Custom sizing & assembly</td>
                          <td className="p-3 text-center text-sm">2</td>
                          <td className="p-3 text-right text-sm">{formatCurrency(90.00)}</td>
                          <td className="p-3 text-right text-sm">{formatCurrency(180.00)}</td>
                        </tr>
                        <tr className="border-t bg-gray-50">
                          <td className="p-3 pl-8 text-sm">• Blackout Lining</td>
                          <td className="p-3 text-sm">Premium blackout material</td>
                          <td className="p-3 text-center text-sm">7.88m</td>
                          <td className="p-3 text-right text-sm">{formatCurrency(10.00)}</td>
                          <td className="p-3 text-right text-sm">{formatCurrency(72.00)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // Simple table view
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 font-medium">Product/Service</th>
                      <th className="text-left p-4 font-medium">Description</th>
                      <th className="text-center p-4 font-medium">Qty</th>
                      <th className="text-right p-4 font-medium">Unit Price</th>
                      <th className="text-right p-4 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-4 font-medium">Roman Blinds</td>
                      <td className="p-4">Living Room • Premium motorized</td>
                      <td className="p-4 text-center">2</td>
                      <td className="p-4 text-right">{formatCurrency(484.54)}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(969.08)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-4 font-medium">Sheer Curtains</td>
                      <td className="p-4">Bedroom • Custom sized</td>
                      <td className="p-4 text-center">1</td>
                      <td className="p-4 text-right">{formatCurrency(360.00)}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(360.00)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'totals':
        return (
          <div key={block.id} className="mb-8">
            <div className="flex justify-end">
              <div className="w-80 space-y-2 bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(1329.08)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">GST (15%):</span>
                  <span className="font-medium">{formatCurrency(199.36)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-brand-primary">{formatCurrency(1528.44)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div key={block.id} className="mb-8">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-green-800">Ready to Proceed?</h3>
                <p className="text-green-700">{block.content.description}</p>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  {block.content.buttonText || 'Accept & Pay'}
                </Button>
                <p className="text-sm text-green-600">{block.content.securityText}</p>
              </div>
            </Card>
          </div>
        );

      case 'signature':
        return (
          <div key={block.id} className="mb-8">
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="border-b border-gray-400 mb-2 h-16"></div>
                <Label className="text-sm text-gray-600">{block.content.signatureLabel}</Label>
              </div>
              <div>
                <div className="border-b border-gray-400 mb-2 h-16"></div>
                <Label className="text-sm text-gray-600">{block.content.dateLabel}</Label>
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div 
            key={block.id}
            className={applyStyles("border-t pt-6 mt-8 text-center", block.styles)}
            style={getInlineStyles(block.styles)}
          >
            <div className="space-y-2">
              <p className="font-medium">{replaceTokens(block.content.text)}</p>
              {block.content.includeTerms && (
                <div className="text-sm opacity-80">
                  <p>Payment terms: Net 30 days. Quote valid for 30 days.</p>
                  <p className="mt-2">
                    {replaceTokens('{{company_name}} • {{company_phone}} • {{company_email}}')}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : 'border rounded-lg shadow-sm'}`}>
      {/* Preview Controls */}
      <div className="border-b p-4 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {templateStyle} Style
          </Badge>
          <span className="text-sm text-muted-foreground">Live Preview</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Quote Content */}
      <div className={`${isFullscreen ? 'max-w-4xl mx-auto p-8' : 'p-8'}`}>
        {blocks.map(renderBlock)}
      </div>
    </div>
  );
};