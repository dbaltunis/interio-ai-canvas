
import { Card } from "@/components/ui/card";

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
                <h1 className="text-2xl font-bold text-blue-600 mb-2">
                  {renderContent(block.content.companyName)}
                </h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{renderContent(block.content.companyAddress)}</div>
                  <div>{renderContent(block.content.companyPhone)}</div>
                  <div>{renderContent(block.content.companyEmail)}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600">QUOTE #{mockData.quote_number}</h2>
              <div className="text-sm text-gray-600 mt-1">
                <div>Date: {mockData.quote_date}</div>
                <div>Job: {mockData.job_number}</div>
              </div>
            </div>
          </div>
        );

      case 'client-info':
        return (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3 text-blue-600">{block.content.title}</h3>
            <div className="text-sm space-y-1">
              {block.content.showClientName && <div>{mockData.client_name}</div>}
              {block.content.showClientEmail && <div>{mockData.client_email}</div>}
              {block.content.showClientAddress && <div>{mockData.client_address}</div>}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`mb-6 ${
            block.content.style === 'intro' ? 'text-lg' : 
            block.content.style === 'terms' ? 'text-sm text-gray-600' : 
            'text-base'
          }`}>
            {renderContent(block.content.text)}
          </div>
        );

      case 'image':
        return (
          <div className="mb-6 text-center">
            <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
              <span className="text-gray-400">Image Placeholder</span>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  {block.content.showRoom && (
                    <th className="border border-gray-300 p-3 text-left font-semibold text-blue-600">Room</th>
                  )}
                  {block.content.showTreatment && (
                    <th className="border border-gray-300 p-3 text-left font-semibold text-blue-600">Treatment</th>
                  )}
                  {block.content.showQuantity && (
                    <th className="border border-gray-300 p-3 text-left font-semibold text-blue-600">Qty</th>
                  )}
                  {block.content.showUnitPrice && (
                    <th className="border border-gray-300 p-3 text-left font-semibold text-blue-600">Unit Price</th>
                  )}
                  {block.content.showTotal && (
                    <th className="border border-gray-300 p-3 text-left font-semibold text-blue-600">Total</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {block.content.showRoom && <td className="border border-gray-300 p-3">Living Room</td>}
                  {block.content.showTreatment && <td className="border border-gray-300 p-3">Blackout Curtains</td>}
                  {block.content.showQuantity && <td className="border border-gray-300 p-3">2</td>}
                  {block.content.showUnitPrice && <td className="border border-gray-300 p-3">$150.00</td>}
                  {block.content.showTotal && <td className="border border-gray-300 p-3">$300.00</td>}
                </tr>
                <tr>
                  {block.content.showRoom && <td className="border border-gray-300 p-3">Bedroom</td>}
                  {block.content.showTreatment && <td className="border border-gray-300 p-3">Roman Shades</td>}
                  {block.content.showQuantity && <td className="border border-gray-300 p-3">3</td>}
                  {block.content.showUnitPrice && <td className="border border-gray-300 p-3">$120.00</td>}
                  {block.content.showTotal && <td className="border border-gray-300 p-3">$360.00</td>}
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
                  <span>Tax:</span>
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
        return (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t">
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
