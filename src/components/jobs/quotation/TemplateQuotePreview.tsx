
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useBusinessSettings, formatCurrency } from "@/hooks/useBusinessSettings";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import QuoteItemBreakdown from "@/components/quotes/QuoteItemBreakdown";

interface TemplateQuotePreviewProps {
  project: any;
  treatments: any[];
  rooms: any[];
  surfaces: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  markupPercentage: number;
  templateId: string;
}

export const TemplateQuotePreview = ({
  project,
  treatments,
  rooms,
  surfaces,
  subtotal,
  taxRate,
  taxAmount,
  total,
  markupPercentage,
  templateId
}: TemplateQuotePreviewProps) => {
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();
  const client = clients?.find(c => c.id === project.client_id);

  const { data: projectSummaries } = useProjectWindowSummaries(project?.id);

  // Generate quote items from treatments with detailed breakdown from saved window summaries
  const quoteItems = treatments.map((treatment) => {
    const room = rooms.find(r => r.id === treatment.room_id);
    const surface = surfaces.find(s => s.id === treatment.window_id);
    const summary = (projectSummaries?.windows || []).find(w => w.window_id === treatment.window_id)?.summary;
    const breakdown = summary ? buildClientBreakdown(summary) : [];
    const currency = summary?.currency;

    return {
      id: treatment.id,
      room: room?.name || 'Unknown Room',
      window: surface?.name || 'Window',
      breakdown,
      currency,
      quantity: treatment.quantity || 1,
      unitPrice: treatment.unit_price || 0,
      totalPrice: treatment.total_price || 0,
      title: `${treatment.treatment_type} - ${treatment.product_name || 'Custom Treatment'}`,
      fabric: treatment.fabric_type,
    };
  });

  const formatCurrencyWithSettings = (amount: number) => {
    if (businessSettings?.measurement_units) {
      try {
        const units = JSON.parse(businessSettings.measurement_units);
        return formatCurrency(amount, units.currency);
      } catch {
        return formatCurrency(amount, 'USD');
      }
    }
    return formatCurrency(amount, 'USD');
  };

  const renderHeader = () => (
    <div className="flex items-start justify-between mb-8 p-6 border-b-2 border-gray-200">
      <div className="flex items-start gap-4">
        {businessSettings?.company_logo_url && (
          <img 
            src={businessSettings.company_logo_url} 
            alt="Company Logo" 
            className="h-16 w-16 object-contain"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {businessSettings?.company_name || 'Your Company Name'}
          </h1>
          <div className="space-y-1 text-gray-600">
            {businessSettings?.address && <p>{businessSettings.address}</p>}
            {(businessSettings?.city || businessSettings?.state || businessSettings?.zip_code) && (
              <p>
                {businessSettings?.city}
                {businessSettings?.city && businessSettings?.state && ', '}
                {businessSettings?.state} {businessSettings?.zip_code}
              </p>
            )}
            {businessSettings?.business_phone && <p>Phone: {businessSettings.business_phone}</p>}
            {businessSettings?.business_email && <p>Email: {businessSettings.business_email}</p>}
            {businessSettings?.abn && <p>ABN: {businessSettings.abn}</p>}
            {businessSettings?.website && <p>Web: {businessSettings.website}</p>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">QUOTE</h2>
        <p className="text-sm text-gray-600">Quote #: QT-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</p>
        <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-600">Valid Until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
    </div>
  );

  const renderClientInfo = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">Bill To:</h3>
      {client ? (
        <div className="space-y-1">
          <p className="font-medium">{client.name}</p>
          {client.company_name && <p className="text-gray-600">{client.company_name}</p>}
          {client.email && <p className="text-gray-600">{client.email}</p>}
          {client.phone && <p className="text-gray-600">{client.phone}</p>}
          {client.address && (
            <p className="text-gray-600">
              {client.address}
              {client.city && `, ${client.city}`}
              {client.state && `, ${client.state}`}
              {client.zip_code && ` ${client.zip_code}`}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No client assigned</p>
      )}
    </div>
  );

  const renderProductsTable = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Quote Items</h3>
      
      {templateId === 'detailed' ? (
        // Detailed breakdown view
        <div className="space-y-6">
          {quoteItems.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-gray-900">
                  {item.room} - {item.window}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Description</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-700">Qty</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.room} • {item.window}</div>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrencyWithSettings(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrencyWithSettings(item.totalPrice)}</td>
                    </tr>
                    {item.breakdown.map((breakdownItem, bIndex) => (
                      <tr key={bIndex} className="border-t">
                        <td className="p-3">
                          <div>{breakdownItem.name || breakdownItem.category || 'Item'}</div>
                          {breakdownItem.description && (
                            <div className="text-xs text-gray-600">{breakdownItem.description}</div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {breakdownItem.quantity ? (
                            <>
                              {Number(breakdownItem.quantity).toFixed(1)}
                              {breakdownItem.unit ? ` ${breakdownItem.unit}` : ''}
                            </>
                          ) : ''}
                        </td>
                        <td className="p-3 text-right">{formatCurrencyWithSettings(Number(breakdownItem.unit_price || 0))}</td>
                        <td className="p-3 text-right font-medium">{formatCurrencyWithSettings(Number(breakdownItem.total_cost || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Simple table view
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Description</th>
                <th className="text-center p-4 font-medium text-gray-700">Qty</th>
                <th className="text-right p-4 font-medium text-gray-700">Unit Price</th>
                <th className="text-right p-4 font-medium text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-600">
                        {item.room} • {item.window}
                      </div>
                      {Array.isArray(item.breakdown) && item.breakdown.length > 0 && (
                        <QuoteItemBreakdown
                          breakdown={item.breakdown}
                          currency={item.currency || 'USD'}
                          formatCurrencyFn={formatCurrencyWithSettings}
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">{item.quantity}</td>
                  <td className="p-4 text-right">{formatCurrencyWithSettings(item.unitPrice)}</td>
                  <td className="p-4 text-right font-medium">{formatCurrencyWithSettings(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTotals = () => (
    <div className="flex justify-end mb-8">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrencyWithSettings(subtotal)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
          <span className="font-medium">{formatCurrencyWithSettings(taxAmount)}</span>
        </div>
        <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
          <span>Total:</span>
          <span className="text-gray-900">{formatCurrencyWithSettings(total)}</span>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="border-t pt-6 mt-8">
      <div className="text-center text-gray-600 space-y-2">
        <p className="font-medium">
          Thank you for choosing {businessSettings?.company_name || 'our services'}!
        </p>
        <p className="text-sm">
          Payment terms: Net 30 days. Quote valid for 30 days.
        </p>
        <p className="text-sm">
          For questions about this quote, please contact us at{' '}
          {businessSettings?.business_email || 'info@company.com'}
          {businessSettings?.business_phone && ` or ${businessSettings.business_phone}`}
        </p>
      </div>
    </div>
  );

  // Get template styling with defaults
  const templateStyling = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
    documentShadow: 'none',
    documentBorder: 'none',
    documentCorners: 'square',
    documentBackground: 'white',
    margins: 'normal',
    ...(businessSettings as any)?.templateStyling
  };

  // Get document styling classes based on template settings
  const getDocumentClasses = () => {
    const shadowClasses = {
      none: '',
      light: 'shadow-sm',
      medium: 'shadow-md',
      strong: 'shadow-lg'
    };

    const borderClasses = {
      none: '',
      thin: 'border border-gray-200',
      medium: 'border-2 border-gray-300',
      thick: 'border-4 border-gray-400'
    };

    const cornerClasses = {
      square: '',
      'slightly-rounded': 'rounded-sm',
      rounded: 'rounded-lg'
    };

    const marginClasses = {
      narrow: 'p-4',
      normal: 'p-8',
      wide: 'p-12'
    };

    const backgroundClasses = {
      white: 'bg-white',
      subtle: 'bg-gray-50',
      transparent: 'bg-transparent'
    };

    return `document-surface text-black break-inside-avoid print:max-w-none print:mx-0 print:bg-white print:text-black print:shadow-none print:border-none print:rounded-none print:p-8 ${shadowClasses[templateStyling.documentShadow]} ${borderClasses[templateStyling.documentBorder]} ${cornerClasses[templateStyling.documentCorners]} ${marginClasses[templateStyling.margins]} ${backgroundClasses[templateStyling.documentBackground]}`;
  };

  // Check if we're in a full-screen context (no Card wrapper needed)
  const isFullScreen = typeof window !== 'undefined' && 
    document.getElementById('quote-full-view')?.contains(document.querySelector('.document-surface'));

  const documentContent = (
    <div 
      className={getDocumentClasses()}
      style={{
        fontFamily: templateStyling.fontFamily,
        fontSize: templateStyling.fontSize,
        lineHeight: templateStyling.lineHeight,
        color: templateStyling.textColor,
        backgroundColor: templateStyling.backgroundColor
      }}
    >
      {renderHeader()}
      {renderClientInfo()}
      {renderProductsTable()}
      {renderTotals()}
      {renderFooter()}
    </div>
  );

  if (isFullScreen) {
    return documentContent;
  }

  return (
    <Card>
      <CardHeader className="no-print">
        <CardTitle className="flex items-center justify-between">
          <span>Quote Preview - {templateId} Template</span>
          <Badge variant="outline">{templateId}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-4xl mx-auto">
          {documentContent}
        </div>
      </CardContent>
    </Card>
  );
};
