
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign } from "lucide-react";

interface LivePreviewProps {
  blocks: any[];
  templateName: string;
}

export const LivePreview = ({ blocks, templateName }: LivePreviewProps) => {
  const mockData = {
    company_name: "Window Treatments Pro",
    company_address: "123 Main Street, City, State 12345",
    company_phone: "(555) 123-4567",
    company_email: "info@windowtreatmentspro.com",
    client_name: "John Smith",
    client_email: "john@example.com",
    client_address: "456 Oak Avenue, City, State 67890",
    quote_number: "QT-0001",
    quote_date: new Date().toLocaleDateString(),
    job_number: "JOB-001"
  };

  const renderContent = (content: string) => {
    let rendered = content;
    Object.entries(mockData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return rendered;
  };

  const renderBlock = (block: any) => {
    const primaryColor = block.content.style?.primaryColor || '#415e6b';
    const textColor = block.content.style?.textColor || '#575656';

    switch (block.type) {
      case 'header':
        return (
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              {block.content.showLogo && (
                <div className="w-20 h-20 bg-blue-100 flex items-center justify-center rounded">
                  <span className="text-xs text-blue-600 font-medium">LOGO</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                  {renderContent(block.content.companyName)}
                </h1>
                <div className="text-sm space-y-1" style={{ color: textColor }}>
                  <div>{renderContent(block.content.companyAddress)}</div>
                  <div>{renderContent(block.content.companyPhone)}</div>
                  <div>{renderContent(block.content.companyEmail)}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
                QUOTE #{mockData.quote_number}
              </h2>
              <div className="text-sm mt-1" style={{ color: textColor }}>
                <div>Date: {mockData.quote_date}</div>
                <div>Job: {mockData.job_number}</div>
              </div>
            </div>
          </div>
        );

      case 'client-info':
        return (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3" style={{ color: primaryColor }}>
              {block.content.title}
            </h3>
            <div className="text-sm space-y-1">
              {block.content.showClientName && <div>{mockData.client_name}</div>}
              {block.content.showClientEmail && <div>{mockData.client_email}</div>}
              {block.content.showClientAddress && <div>{mockData.client_address}</div>}
            </div>
          </div>
        );

      case 'text':
        return (
          <div 
            className={`mb-6 ${
              block.content.style === 'intro' ? 'text-lg' : 
              block.content.style === 'terms' ? 'text-sm text-gray-600' : 
              'text-base'
            }`}
            style={{ 
              color: block.content.style?.textColor || textColor,
              fontSize: block.content.style?.fontSize === 'small' ? '0.875rem' : 
                       block.content.style?.fontSize === 'large' ? '1.125rem' : undefined
            }}
          >
            {renderContent(block.content.text)}
          </div>
        );

      case 'image':
        if (block.content.src) {
          return (
            <div className={`mb-6 ${
              block.content.alignment === 'left' ? 'text-left' :
              block.content.alignment === 'right' ? 'text-right' :
              'text-center'
            }`}>
              <img
                src={block.content.src}
                alt={block.content.alt || 'Uploaded image'}
                className="max-w-full h-auto rounded"
                style={{ width: block.content.width || 'auto' }}
              />
            </div>
          );
        } else {
          return (
            <div className="mb-6 text-center">
              <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
                <span className="text-gray-400">Image Placeholder</span>
              </div>
            </div>
          );
        }

      case 'products':
        const isSimpleView = block.content.layout === 'simple';
        
        if (isSimpleView) {
          return (
            <div className="mb-6">
              <h3 className="font-semibold mb-4" style={{ color: primaryColor }}>Quote Items</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Blackout Curtains - Living Room</span>
                  <span className="font-semibold">$300.00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Roman Shades - Bedroom</span>
                  <span className="font-semibold">$360.00</span>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="mb-6">
            <h3 className="font-semibold mb-4" style={{ color: primaryColor }}>Quote Items</h3>
            <table className={`w-full border-collapse ${
              block.content.tableStyle === 'minimal' ? '' : 
              block.content.tableStyle === 'striped' ? '' : 'border border-gray-300'
            }`}>
              <thead>
                <tr className={`${
                  block.content.tableStyle === 'striped' ? 'bg-gray-50' : 
                  block.content.tableStyle === 'minimal' ? 'border-b' : 'bg-gray-50'
                }`}>
                  {(block.content.showProduct !== false) && (
                    <th className={`p-3 text-left font-semibold ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`} style={{ color: primaryColor }}>
                      Product/Service
                    </th>
                  )}
                  {block.content.showDescription && (
                    <th className={`p-3 text-left font-semibold ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`} style={{ color: primaryColor }}>
                      Description
                    </th>
                  )}
                  {(block.content.showQuantity !== false) && (
                    <th className={`p-3 text-left font-semibold ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`} style={{ color: primaryColor }}>
                      Qty
                    </th>
                  )}
                  {(block.content.showUnitPrice !== false) && (
                    <th className={`p-3 text-left font-semibold ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`} style={{ color: primaryColor }}>
                      Unit Price
                    </th>
                  )}
                  {block.content.showTax && (
                    <th className={`p-3 text-left font-semibold ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`} style={{ color: primaryColor }}>
                      Tax/VAT
                    </th>
                  )}
                  {(block.content.showTotal !== false) && (
                    <th className={`p-3 text-left font-semibold ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`} style={{ color: primaryColor }}>
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className={block.content.tableStyle === 'striped' ? 'even:bg-gray-50' : ''}>
                  {(block.content.showProduct !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      Blackout Curtains
                    </td>
                  )}
                  {block.content.showDescription && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      High-quality blackout curtains for living room
                    </td>
                  )}
                  {(block.content.showQuantity !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      2
                    </td>
                  )}
                  {(block.content.showUnitPrice !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      $150.00
                    </td>
                  )}
                  {block.content.showTax && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      $24.00
                    </td>
                  )}
                  {(block.content.showTotal !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      $300.00
                    </td>
                  )}
                </tr>
                <tr className={block.content.tableStyle === 'striped' ? 'even:bg-gray-50' : ''}>
                  {(block.content.showProduct !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      Roman Shades
                    </td>
                  )}
                  {block.content.showDescription && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      Custom roman shades for bedroom windows
                    </td>
                  )}
                  {(block.content.showQuantity !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      3
                    </td>
                  )}
                  {(block.content.showUnitPrice !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      $120.00
                    </td>
                  )}
                  {block.content.showTax && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      $28.80
                    </td>
                  )}
                  {(block.content.showTotal !== false) && (
                    <td className={`p-3 ${
                      block.content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                    }`}>
                      $360.00
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'totals':
        return (
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              {block.content.showSubtotal && (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>$660.00</span>
                </div>
              )}
              {block.content.showTax && (
                <div className="flex justify-between">
                  <span>Tax/VAT:</span>
                  <span>$52.80</span>
                </div>
              )}
              {block.content.showTotal && (
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>$712.80</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'signature':
        if (block.content.enableDigitalSignature && block.content.signatureData) {
          return (
            <div className="mb-6 border-t pt-8">
              <div className="mb-4">
                <img 
                  src={block.content.signatureData} 
                  alt="Digital signature" 
                  className="max-w-xs border rounded"
                />
                <div className="text-sm font-medium mt-2">{block.content.signatureLabel}</div>
              </div>
              {block.content.showDate && (
                <div className="text-sm">
                  <span className="font-medium">{block.content.dateLabel}:</span> {new Date().toLocaleDateString()}
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t mb-6">
            {block.content.showSignature && (
              <div>
                <div className="border-b border-gray-400 mb-2 h-10"></div>
                <div className="text-sm font-medium">{block.content.signatureLabel}</div>
              </div>
            )}
            {block.content.showDate && (
              <div>
                <div className="border-b border-gray-400 mb-2 h-10"></div>
                <div className="text-sm font-medium">{block.content.dateLabel}</div>
              </div>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="mb-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      {block.content.buttonText || "Pay Now"}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {block.content.description || "Secure payment processing"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    {block.content.currency || "$"}{block.content.amount || "712.80"}
                  </div>
                  <div className="text-sm text-blue-700">
                    {block.content.paymentType === 'full' ? 'Full Payment' : 
                     block.content.paymentType === 'deposit' ? `${block.content.depositPercentage || 50}% Deposit` : 
                     'Custom Amount'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {block.content.buttonText || "Pay Now"}
                </Button>
                {block.content.showInstallments && (
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Payment Plan
                  </Button>
                )}
              </div>
              
              <div className="mt-3 text-xs text-blue-600 text-center">
                {block.content.securityText || "🔒 Secure SSL encrypted payment"}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <div className="p-8 bg-white">
          {blocks.map((block) => (
            <div key={block.id}>
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
