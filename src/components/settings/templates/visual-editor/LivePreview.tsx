
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/useClients";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface LivePreviewProps {
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
  isEditable?: boolean;
}

export const LivePreview = ({ blocks, projectData, isEditable = false }: LivePreviewProps) => {
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();
  const [editableContent, setEditableContent] = useState<Record<string, any>>({});

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
      company_name: businessSettings?.company_name || data.companyName || 'Your Company Name',
      company_address: businessSettings?.address || 'Your Company Address',
      company_city: businessSettings?.city || '',
      company_state: businessSettings?.state || '',
      company_zip: businessSettings?.zip_code || '',
      company_country: businessSettings?.country || '',
      company_phone: businessSettings?.business_phone || '(555) 123-4567',
      company_email: businessSettings?.business_email || 'info@company.com',
      company_website: businessSettings?.website || '',
      company_abn: businessSettings?.abn || '',
      quote_number: data.quoteNumber || `QT-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      date: new Date().toLocaleDateString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      ...data
    };

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return tokens[key] || match;
    });
  };

  const handleContentEdit = (blockId: string, field: string, value: string) => {
    if (!isEditable) return;
    
    setEditableContent(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        [field]: value
      }
    }));
  };

  const getEditableValue = (blockId: string, field: string, defaultValue: string) => {
    return editableContent[blockId]?.[field] ?? defaultValue;
  };

  const renderHeader = (block: any) => {
    const content = block.content;
    const styles = block.styles;
    
    return (
      <div 
        className={`flex items-start justify-between mb-8 p-6 rounded-lg`}
        style={{ 
          backgroundColor: styles?.backgroundColor || '#f8fafc',
          color: styles?.textColor || '#1e293b'
        }}
      >
        <div className={content.logoPosition === 'right' ? 'order-2' : ''}>
          {isEditable ? (
            <Input
              value={getEditableValue(block.id, 'companyName', replaceTokens(content.companyName))}
              onChange={(e) => handleContentEdit(block.id, 'companyName', e.target.value)}
              className="text-3xl font-bold mb-2 border-none bg-transparent p-0"
            />
          ) : (
            <h1 className="text-3xl font-bold mb-2">
              {replaceTokens(content.companyName)}
            </h1>
          )}
          <div className="space-y-1 opacity-90 text-sm">
            <p>{replaceTokens(content.address)}</p>
            <p>{replaceTokens(content.phone)}</p>
            <p>{replaceTokens(content.email)}</p>
          </div>
        </div>
        <div className={`text-right ${content.logoPosition === 'right' ? 'order-1' : ''}`}>
          <h2 className="text-2xl font-semibold mb-2">{content.quoteTitle}</h2>
          <div className="text-sm space-y-1">
            <p>Quote #: {replaceTokens(content.quoteNumber)}</p>
            <p>Date: {replaceTokens(content.date)}</p>
            <p>Valid Until: {replaceTokens(content.validUntil)}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderClient = (block: any) => {
    const content = block.content;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-brand-primary">{content.title}</h3>
        {client ? (
          <div className="space-y-1">
            <p className="font-medium">{client.name}</p>
            {content.showCompany && client.company_name && (
              <p className="text-gray-600">{client.company_name}</p>
            )}
            {content.showContact && (
              <>
                {client.email && <p className="text-gray-600">{client.email}</p>}
                {client.phone && <p className="text-gray-600">{client.phone}</p>}
              </>
            )}
            {content.showAddress && client.address && (
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
  };

  const renderProducts = (block: any) => {
    const content = block.content;
    const treatments = projectData?.treatments || [];
    const rooms = projectData?.rooms || [];
    const surfaces = projectData?.surfaces || [];
    
    if (!projectData) {
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary">{content.title}</h3>
          <div className="text-center py-8 text-gray-500">
            No product data available
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-brand-primary">{content.title}</h3>
        
        {content.tableStyle === 'detailed' ? (
          // Detailed breakdown view
          <div className="space-y-6">
            {treatments.map((treatment, index) => {
              const room = rooms.find(r => r.id === treatment.room_id);
              const surface = surfaces.find(s => s.id === treatment.window_id);
              
              // Create breakdown items
              const breakdownItems = [
                {
                  description: `${treatment.treatment_type} - ${treatment.product_name || 'Custom Treatment'}`,
                  category: 'Product',
                  quantity: treatment.quantity || 1,
                  unit_price: treatment.unit_price || 0,
                  total: treatment.total_price || 0
                },
                ...(treatment.fabric_type ? [{
                  description: `Fabric: ${treatment.fabric_type}`,
                  category: 'Materials',
                  quantity: treatment.quantity || 1,
                  unit_price: ((treatment.material_cost || 0) * 0.7),
                  total: ((treatment.material_cost || 0) * 0.7) * (treatment.quantity || 1)
                }] : []),
                ...(treatment.labor_cost && treatment.labor_cost > 0 ? [{
                  description: 'Installation & Labor',
                  category: 'Labor',
                  quantity: 1,
                  unit_price: treatment.labor_cost,
                  total: treatment.labor_cost
                }] : []),
                ...(treatment.hardware ? [{
                  description: `Hardware: ${treatment.hardware}`,
                  category: 'Hardware',
                  quantity: treatment.quantity || 1,
                  unit_price: ((treatment.material_cost || 0) * 0.3),
                  total: ((treatment.material_cost || 0) * 0.3) * (treatment.quantity || 1)
                }] : [])
              ];

              return (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="font-medium text-brand-primary">
                      {room?.name || 'Room'} - {surface?.name || 'Window'}
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
                        {breakdownItems.map((item, bIndex) => (
                          <tr key={bIndex} className="border-t">
                            <td className="p-3">{item.description}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Simple table view
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {content.columns?.includes('product') && (
                    <th className="text-left p-4 font-medium text-gray-700">Product/Service</th>
                  )}
                  {content.columns?.includes('description') && (
                    <th className="text-left p-4 font-medium text-gray-700">Description</th>
                  )}
                  {content.columns?.includes('qty') && (
                    <th className="text-center p-4 font-medium text-gray-700">Qty</th>
                  )}
                  {content.columns?.includes('unit_price') && (
                    <th className="text-right p-4 font-medium text-gray-700">Unit Price</th>
                  )}
                  {content.columns?.includes('total') && (
                    <th className="text-right p-4 font-medium text-gray-700">Total</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment, index) => {
                  const room = rooms.find(r => r.id === treatment.room_id);
                  const surface = surfaces.find(s => s.id === treatment.window_id);
                  return (
                    <tr key={treatment.id || index} className="border-t">
                      {content.columns?.includes('product') && (
                        <td className="p-4 font-medium">
                          {treatment.treatment_type} - {treatment.product_name || 'Custom Treatment'}
                        </td>
                      )}
                      {content.columns?.includes('description') && (
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {room?.name} • {surface?.name}
                            {treatment.fabric_type && ` • ${treatment.fabric_type}`}
                          </div>
                        </td>
                      )}
                      {content.columns?.includes('qty') && (
                        <td className="p-4 text-center">{treatment.quantity || 1}</td>
                      )}
                      {content.columns?.includes('unit_price') && (
                        <td className="p-4 text-right">{formatCurrency(treatment.unit_price || 0)}</td>
                      )}
                      {content.columns?.includes('total') && (
                        <td className="p-4 text-right font-medium">{formatCurrency(treatment.total_price || 0)}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-80 space-y-2">
            {content.showSubtotal && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(projectData.subtotal)}</span>
              </div>
            )}
            {content.showTax && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{content.taxLabel} ({(projectData.taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">{formatCurrency(projectData.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
              <span>Total:</span>
              <span className="text-brand-primary">{formatCurrency(projectData.total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFooter = (block: any) => {
    const content = block.content;
    const styles = block.styles;
    
    return (
      <div 
        className="border-t pt-6 mt-8"
        style={{ 
          backgroundColor: styles?.backgroundColor || '#f8fafc',
          color: styles?.textColor || '#6b7280'
        }}
      >
        <div className="text-center space-y-2">
          {isEditable ? (
            <Input
              value={getEditableValue(block.id, 'text', content.text)}
              onChange={(e) => handleContentEdit(block.id, 'text', e.target.value)}
              className="font-medium text-center border-none bg-transparent"
            />
          ) : (
            <p className="font-medium">{content.text}</p>
          )}
          
          {content.showTerms && (
            <div className="text-sm">
              <p>Payment terms: Net 30 days. Quote valid for 30 days.</p>
              {businessSettings && (
                <p className="mt-2">
                  Terms and Conditions apply. Please review our full terms on our website.
                </p>
              )}
            </div>
          )}
          
          <p className="text-sm">
            {replaceTokens(content.companyInfo)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm max-w-4xl mx-auto">
      <div className="p-8">
        {blocks.map((block) => {
          switch (block.type) {
            case 'header':
              return <div key={block.id}>{renderHeader(block)}</div>;
            case 'client':
              return <div key={block.id}>{renderClient(block)}</div>;
            case 'products':
              return <div key={block.id}>{renderProducts(block)}</div>;
            case 'footer':
              return <div key={block.id}>{renderFooter(block)}</div>;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};
