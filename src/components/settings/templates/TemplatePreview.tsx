
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TemplatePreviewProps {
  template: any;
}

export const TemplatePreview = ({ template }: TemplatePreviewProps) => {
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
    job_number: "JOB-001",
    items: [
      {
        room_name: "Living Room",
        treatment_name: "Blackout Curtains",
        quantity: 2,
        unit_price: 150.00,
        total: 300.00
      },
      {
        room_name: "Bedroom",
        treatment_name: "Roman Shades",
        quantity: 3,
        unit_price: 120.00,
        total: 360.00
      }
    ],
    subtotal: 660.00,
    tax_amount: 52.80,
    total_amount: 712.80
  };

  const renderContent = (content: string) => {
    let rendered = content;
    Object.entries(mockData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return rendered;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border shadow-lg">
      <div
        className="p-8 space-y-6"
        style={{
          fontFamily: template.styling.fontFamily,
          fontSize: template.styling.fontSize,
          lineHeight: template.styling.lineHeight || "1.5",
          color: template.styling.textColor || "#000000",
          backgroundColor: template.styling.backgroundColor || "#FFFFFF"
        }}
      >
        {/* Header Section */}
        <div className="border-b pb-6">
          <div className={`flex ${template.header.logoPosition === 'top-center' ? 'justify-center' : template.header.logoPosition === 'top-right' ? 'justify-end' : 'justify-start'} items-start gap-8`}>
            {template.header.showLogo && (
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded">
                <span className="text-xs text-gray-500">LOGO</span>
              </div>
            )}
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Company Info */}
                <div>
                  <h2 className="font-bold text-lg mb-2" style={{ color: template.styling.primaryColor }}>
                    {renderContent(template.header.companyInfo.name)}
                  </h2>
                  <div className="text-sm space-y-1">
                    <div>{renderContent(template.header.companyInfo.address)}</div>
                    <div>{renderContent(template.header.companyInfo.phone)}</div>
                    <div>{renderContent(template.header.companyInfo.email)}</div>
                  </div>
                </div>

                {/* Client Info */}
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: template.styling.primaryColor }}>
                    {template.header.clientInfo.label}
                  </h3>
                  <div className="text-sm space-y-1">
                    <div>{mockData.client_name}</div>
                    <div>{mockData.client_email}</div>
                    <div>{mockData.client_address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <h1 className="text-2xl font-bold" style={{ color: template.styling.primaryColor }}>
              QUOTE #{mockData.quote_number}
            </h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">Date: {mockData.quote_date}</div>
              <div className="text-sm text-gray-600">Job: {mockData.job_number}</div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        {template.footer.introText && (
          <div className="py-4">
            <div dangerouslySetInnerHTML={{ __html: renderContent(template.footer.introText) }} />
          </div>
        )}

        {/* Items Table */}
        <div className="space-y-4">
          {template.body.layout === 'table' && (
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: template.styling.primaryColor + '20' }}>
                  {template.body.columns.filter((col: any) => col.visible).map((column: any, index: number) => (
                    <th
                      key={index}
                      className="p-3 text-left font-semibold"
                      style={{
                        border: template.styling.borderStyle !== 'none' ? `${template.styling.borderWidth || '1px'} ${template.styling.borderStyle} ${template.styling.primaryColor}40` : 'none'
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockData.items.map((item, index) => (
                  <tr key={index}>
                    {template.body.columns.filter((col: any) => col.visible).map((column: any, colIndex: number) => (
                      <td
                        key={colIndex}
                        className="p-3"
                        style={{
                          border: template.styling.borderStyle !== 'none' ? `${template.styling.borderWidth || '1px'} ${template.styling.borderStyle} ${template.styling.primaryColor}20` : 'none'
                        }}
                      >
                        {column.key === 'room' && item.room_name}
                        {column.key === 'treatment' && item.treatment_name}
                        {column.key === 'quantity' && item.quantity}
                        {column.key === 'unitPrice' && `$${item.unit_price.toFixed(2)}`}
                        {column.key === 'total' && `$${item.total.toFixed(2)}`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              {template.body.showSubtotal && (
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${mockData.subtotal.toFixed(2)}</span>
                </div>
              )}
              {template.body.showTax && (
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${mockData.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {template.body.showTotal && (
                <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: template.styling.primaryColor }}>
                  <span>Total:</span>
                  <span>${mockData.total_amount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-4 pt-6 border-t">
          {template.footer.termsText && (
            <div>
              <div dangerouslySetInnerHTML={{ __html: renderContent(template.footer.termsText) }} />
            </div>
          )}

          {template.footer.thankYouText && (
            <div className="text-center py-4">
              <div dangerouslySetInnerHTML={{ __html: renderContent(template.footer.thankYouText) }} />
            </div>
          )}

          {template.footer.showSignature && (
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="border-b border-gray-400 mb-2 h-8"></div>
                <div className="text-sm">{template.footer.signatureLabel || "Authorized Signature"}</div>
              </div>
              <div>
                <div className="border-b border-gray-400 mb-2 h-8"></div>
                <div className="text-sm">{template.footer.dateLabel || "Date"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
