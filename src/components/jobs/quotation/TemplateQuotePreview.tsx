
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";

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
  const client = clients?.find(c => c.id === project.client_id);

  // Generate quote items from treatments with detailed breakdown
  const quoteItems = treatments.map(treatment => {
    const room = rooms.find(r => r.id === treatment.room_id);
    const surface = surfaces.find(s => s.id === treatment.window_id);
    
    // Create detailed breakdown items for each treatment
    const breakdown = [];
    
    // Main product
    breakdown.push({
      description: `${treatment.treatment_type} - ${treatment.product_name || 'Custom Treatment'}`,
      category: 'Product',
      quantity: treatment.quantity || 1,
      unit_price: treatment.unit_price || 0,
      total: treatment.total_price || 0
    });

    // Add fabric if specified
    if (treatment.fabric_type) {
      breakdown.push({
        description: `Fabric: ${treatment.fabric_type}`,
        category: 'Materials',
        quantity: treatment.quantity || 1,
        unit_price: (treatment.material_cost || 0) * 0.7,
        total: ((treatment.material_cost || 0) * 0.7) * (treatment.quantity || 1)
      });
    }

    // Add labor
    if (treatment.labor_cost && treatment.labor_cost > 0) {
      breakdown.push({
        description: 'Installation & Labor',
        category: 'Labor',
        quantity: 1,
        unit_price: treatment.labor_cost,
        total: treatment.labor_cost
      });
    }

    // Add hardware if specified
    if (treatment.hardware) {
      breakdown.push({
        description: `Hardware: ${treatment.hardware}`,
        category: 'Hardware',
        quantity: treatment.quantity || 1,
        unit_price: (treatment.material_cost || 0) * 0.3,
        total: ((treatment.material_cost || 0) * 0.3) * (treatment.quantity || 1)
      });
    }

    return {
      id: treatment.id,
      room: room?.name || 'Unknown Room',
      window: surface?.name || 'Window',
      breakdown
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderHeader = () => (
    <div className="flex items-start justify-between mb-8 p-6 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-lg">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Company Name</h1>
        <div className="space-y-1 text-brand-primary-foreground">
          <p>123 Business Street</p>
          <p>City, State 12345</p>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@company.com</p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-2xl font-semibold mb-2">QUOTE</h2>
        <p className="text-sm">Quote #: QT-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</p>
        <p className="text-sm">Date: {new Date().toLocaleDateString()}</p>
        <p className="text-sm">Valid Until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
    </div>
  );

  const renderClientInfo = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-brand-primary">Bill To:</h3>
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
      <h3 className="text-lg font-semibold mb-4 text-brand-primary">Quote Items</h3>
      
      {templateId === 'detailed' ? (
        // Detailed breakdown view
        <div className="space-y-6">
          {quoteItems.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-brand-primary">
                  {item.room} - {item.window}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Item</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Category</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-700">Qty</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.breakdown.map((breakdownItem, bIndex) => (
                      <tr key={bIndex} className="border-t">
                        <td className="p-3">{breakdownItem.description}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {breakdownItem.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">{breakdownItem.quantity}</td>
                        <td className="p-3 text-right">{formatCurrency(breakdownItem.unit_price)}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(breakdownItem.total)}</td>
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
              {treatments.map((treatment) => {
                const room = rooms.find(r => r.id === treatment.room_id);
                const surface = surfaces.find(s => s.id === treatment.window_id);
                return (
                  <tr key={treatment.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {treatment.treatment_type} - {treatment.product_name || 'Custom Treatment'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {room?.name} • {surface?.name}
                          {treatment.fabric_type && ` • ${treatment.fabric_type}`}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">{treatment.quantity || 1}</td>
                    <td className="p-4 text-right">{formatCurrency(treatment.unit_price || 0)}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(treatment.total_price || 0)}</td>
                  </tr>
                );
              })}
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
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
          <span className="font-medium">{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
          <span>Total:</span>
          <span className="text-brand-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="border-t pt-6 mt-8">
      <div className="text-center text-gray-600 space-y-2">
        <p className="font-medium">Thank you for choosing our services!</p>
        <p className="text-sm">
          Payment terms: Net 30 days. Quote valid for 30 days.
        </p>
        <p className="text-sm">
          For questions about this quote, please contact us at info@company.com or (555) 123-4567
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quote Preview - {templateId} Template</span>
          <Badge variant="outline">{templateId}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-8 border rounded-lg shadow-sm max-w-4xl mx-auto">
          {renderHeader()}
          {renderClientInfo()}
          {renderProductsTable()}
          {renderTotals()}
          {renderFooter()}
        </div>
      </CardContent>
    </Card>
  );
};
