
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    windowSummaries?: any[];
  };
  isEditable?: boolean;
}

export const LivePreview = ({ blocks, projectData, isEditable = false }: LivePreviewProps) => {
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();
  const [editableContent, setEditableContent] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'simple' | 'detailed' | 'itemized' | 'visual'>('detailed');

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
    const content = block.content || {};
    const styles = content.style || {};
    
    return (
      <div 
        className={`flex items-start justify-between mb-8 p-6 rounded-lg`}
        style={{ 
          backgroundColor: styles.backgroundColor || '#f8fafc',
          color: styles.color || '#1e293b'
        }}
      >
        <div className={`flex-1 ${content.logoPosition === 'right' ? 'order-2' : ''}`}>
          {content.showLogo && businessSettings?.company_logo_url && (
            <div className={`mb-4 ${content.logoPosition === 'center' ? 'text-center' : ''}`}>
              <img 
                src={businessSettings.company_logo_url} 
                alt="Company Logo" 
                className="max-h-16 w-auto"
                style={{ 
                  maxHeight: '64px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">
            {businessSettings?.company_name || 'Your Company Name'}
          </h1>
          <div className="space-y-1 opacity-90 text-sm">
            {businessSettings?.address && <p>{businessSettings.address}</p>}
            {(businessSettings?.city || businessSettings?.state || businessSettings?.zip_code) && (
              <p>
                {businessSettings.city}{businessSettings.city && businessSettings.state ? ', ' : ''}
                {businessSettings.state} {businessSettings.zip_code}
              </p>
            )}
            {businessSettings?.business_phone && <p>{businessSettings.business_phone}</p>}
            {businessSettings?.business_email && <p>{businessSettings.business_email}</p>}
            {businessSettings?.website && <p>{businessSettings.website}</p>}
          </div>
        </div>
        <div className={`text-right ${content.logoPosition === 'right' ? 'order-1' : ''}`}>
          <h2 className="text-2xl font-semibold mb-2">Quote</h2>
          <div className="text-sm space-y-1">
            <p>Quote #: {replaceTokens('{{quote_number}}')}</p>
            <p>Date: {replaceTokens('{{date}}')}</p>
            <p>Valid Until: {replaceTokens('{{valid_until}}')}</p>
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
    const content = block.content || {};
    const treatments = projectData?.treatments || [];
    const rooms = projectData?.rooms || [];
    const surfaces = projectData?.surfaces || [];

    // Derive columns from booleans when columns array isn't provided
    const columns = (content.columns && Array.isArray(content.columns) && content.columns.length > 0)
      ? content.columns
      : [
          content.showProduct !== false ? 'product' : null,
          content.showDescription ? 'description' : null,
          content.showQuantity !== false ? 'qty' : null,
          content.showUnitPrice !== false ? 'unit_price' : null,
          content.showTotal !== false ? 'total' : null,
        ].filter(Boolean);

    if (!projectData) {
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary">{content.title || 'Quote Items'}</h3>
          <div className="text-center py-8 text-gray-500">No product data available</div>
        </div>
      );
    }

    // Show message if no treatments but rooms/surfaces exist
    if (treatments.length === 0 && (rooms.length > 0 || surfaces.length > 0)) {
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary">{content.title || 'Quote Items'}</h3>
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-600 mb-2">No treatments added yet</div>
            <div className="text-sm text-gray-500">
              You have {rooms.length} room{rooms.length !== 1 ? 's' : ''} and {surfaces.length} surface{surfaces.length !== 1 ? 's' : ''} configured.
              <br />
              Add treatments to see them in your quote.
            </div>
            {rooms.length > 0 && (
              <div className="mt-4 text-left max-h-48 overflow-auto px-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {rooms.map((r) => (
                    <li key={r.id}>
                      <span className="font-medium">{r.name}</span>
                      <ul className="ml-4 list-disc">
                        {surfaces.filter(s => s.room_id === r.id).map(s => (
                          <li key={s.id}>{s.name}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Use the viewMode instead of template layout
    const layout = viewMode;

    // Visual layout: card/grid presentation
    if (layout === 'visual') {
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary">{content.title || 'Quote Items'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((treatment, index) => {
              const room = rooms.find(r => r.id === treatment.room_id);
              const surface = surfaces.find(s => s.id === treatment.window_id);

              // Try match a product image if provided in block content
              const productImages: any[] = content.productImages || [];
              const match = productImages.find((pi: any) =>
                (pi.productName && (
                  (treatment.product_name && pi.productName.toLowerCase().includes(String(treatment.product_name).toLowerCase())) ||
                  (treatment.treatment_type && pi.productName.toLowerCase().includes(String(treatment.treatment_type).toLowerCase()))
                ))
              );

              return (
                <div key={treatment.id || index} className="border rounded-lg overflow-hidden bg-white">
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={match?.imageUrl || '/placeholder.svg'}
                      alt={`${treatment.treatment_type || 'Treatment'} ${treatment.product_name ? ' - ' + treatment.product_name : ''}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <div className="font-medium">{treatment.treatment_type} {treatment.product_name ? ' - ' + treatment.product_name : ''}</div>
                    <div className="text-sm text-gray-600">{room?.name || 'Room'} • {surface?.name || 'Window'}</div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">Qty: {treatment.quantity || 1}</span>
                      <span className="font-semibold">{formatCurrency(treatment.total_price || 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Totals */}
          <div className="flex justify-end mt-6">
            <div className="w-80 space-y-2">
              {content.showSubtotal !== false && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(projectData.subtotal)}</span>
                </div>
              )}
              {content.showTax && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">{content.taxLabel || 'Tax'} ({(projectData.taxRate * 100).toFixed(1)}%):</span>
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
    }

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-brand-primary">{content.title || 'Quote Items'}</h3>
        {layout === 'itemized' ? (
          // Itemized view with room groupings and detailed breakdowns
          <div className="space-y-6">
            {(() => {
              // Group treatments by room
              const treatmentsByRoom = treatments.reduce((acc, treatment) => {
                const room = rooms.find(r => r.id === treatment.room_id);
                const roomName = room?.name || 'Unspecified Room';
                if (!acc[roomName]) acc[roomName] = [];
                acc[roomName].push(treatment);
                return acc;
              }, {} as Record<string, any[]>);

              return Object.entries(treatmentsByRoom).map(([roomName, roomTreatments]) => (
                <div key={roomName} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-medium text-gray-900">{roomName}</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-gray-700 w-12">#</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Product/Service</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-700">Description</th>
                          <th className="text-center p-3 text-sm font-medium text-gray-700">Quantity</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">Price rate</th>
                          <th className="text-right p-3 text-sm font-medium text-gray-700">Total without GST</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(roomTreatments as any[]).map((treatment, treatmentIndex) => {
                          const surface = surfaces.find(s => s.id === treatment.window_id);
                          const surfaceName = surface?.name || 'Window';
                          
                          // Get window summary data for dynamic breakdown
                          const windowSummary = projectData?.windowSummaries?.find(
                            (ws: any) => ws.window_id === treatment.window_id
                          );
                          
                           const items: Array<{
                             number: string | number;
                             productService: string;
                             description: string;
                             quantity: string | number;
                             priceRate: number;
                             total: number;
                             isMain: boolean;
                           }> = [
                             // Main product line
                             {
                               number: treatmentIndex + 1,
                               productService: treatment.treatment_type || windowSummary?.template_name || 'Treatment',
                               description: surfaceName,
                               quantity: treatment.quantity || 1,
                               priceRate: treatment.unit_price || 0,
                               total: treatment.total_price || windowSummary?.total_cost || 0,
                               isMain: true
                             }
                           ];

                          // Add dynamic breakdown components from cost_breakdown
                          if (windowSummary?.cost_breakdown && Array.isArray(windowSummary.cost_breakdown)) {
                            windowSummary.cost_breakdown.forEach((component: any) => {
                              if (component.label && component.amount > 0) {
                                // Determine quantity and rate based on component type
                                let quantity: string | number = 1;
                                let priceRate = component.amount;

                                // Special handling for different component types
                                if (component.label.toLowerCase().includes('fabric')) {
                                  const meters = windowSummary.linear_meters || treatment.width || 0;
                                  if (meters > 0) {
                                    quantity = `${meters.toFixed(1)} m`;
                                    priceRate = component.amount / meters;
                                  }
                                } else if (component.label.toLowerCase().includes('lining')) {
                                  const meters = windowSummary.linear_meters || treatment.width || 0;
                                  if (meters > 0) {
                                    quantity = `${meters.toFixed(1)} m`;
                                    priceRate = component.amount / meters;
                                  }
                                } else if (component.label.toLowerCase().includes('heading')) {
                                  const width = treatment.width || windowSummary.measurements_details?.rail_width || 0;
                                  if (width > 0) {
                                    quantity = `${(width * 100).toFixed(0)} cm`;
                                    priceRate = component.amount / (width * 100);
                                  }
                                } else if (component.label.toLowerCase().includes('manufacturing')) {
                                  quantity = treatment.quantity || 1;
                                  priceRate = component.amount / (treatment.quantity || 1);
                                }

                                items.push({
                                  number: '',
                                  productService: component.label,
                                  description: component.description || '-',
                                  quantity: quantity,
                                  priceRate: priceRate,
                                  total: component.amount,
                                  isMain: false
                                });
                              }
                            });
                          }

                          // Add extra components from extras_details
                          if (windowSummary?.extras_details && Array.isArray(windowSummary.extras_details)) {
                            windowSummary.extras_details.forEach((extra: any) => {
                              if (extra.label && extra.amount > 0) {
                                items.push({
                                  number: '',
                                  productService: extra.label,
                                  description: extra.description || '-',
                                  quantity: extra.quantity || 1,
                                  priceRate: extra.amount / (extra.quantity || 1),
                                  total: extra.amount,
                                  isMain: false
                                });
                              }
                            });
                          }

                          // Fallback: if no cost breakdown, create basic manufacturing entry
                          if (!windowSummary?.cost_breakdown || windowSummary.cost_breakdown.length === 0) {
                            const manufacturingCost = treatment.total_price || windowSummary?.total_cost || 0;
                            if (manufacturingCost > 0) {
                              items.push({
                                number: '',
                                productService: 'Manufacturing price',
                                description: '-',
                                quantity: treatment.quantity || 1,
                                priceRate: manufacturingCost / (treatment.quantity || 1),
                                total: manufacturingCost,
                                isMain: false
                              });
                            }
                          }

                          return items.map((item, itemIndex) => (
                            <tr key={`${treatmentIndex}-${itemIndex}`} className={`${item.isMain ? 'bg-white' : 'bg-gray-50'} border-t`}>
                              <td className="p-3 text-sm font-medium">{item.number}</td>
                              <td className="p-3 text-sm">{item.productService}</td>
                              <td className="p-3 text-sm text-gray-600">{item.description}</td>
                              <td className="p-3 text-sm text-center">{typeof item.quantity === 'number' ? item.quantity : item.quantity}</td>
                              <td className="p-3 text-sm text-right">{formatCurrency(typeof item.priceRate === 'number' ? item.priceRate : 0)}</td>
                              <td className="p-3 text-sm text-right font-medium">{formatCurrency(typeof item.total === 'number' ? item.total : 0)}</td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : layout === 'detailed' ? (
          // Detailed breakdown view
          <div className="space-y-6">
            {treatments.map((treatment, index) => {
              const room = rooms.find(r => r.id === treatment.room_id);
              const surface = surfaces.find(s => s.id === treatment.window_id);

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
                <div key={treatment.id || index} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="font-medium text-brand-primary">{room?.name || 'Room'} - {surface?.name || 'Window'}</h4>
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
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
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
                  {columns.includes('product') && (
                    <th className="text-left p-4 font-medium text-gray-700">Product/Service</th>
                  )}
                  {columns.includes('description') && (
                    <th className="text-left p-4 font-medium text-gray-700">Description</th>
                  )}
                  {columns.includes('qty') && (
                    <th className="text-center p-4 font-medium text-gray-700">Qty</th>
                  )}
                  {columns.includes('unit_price') && (
                    <th className="text-right p-4 font-medium text-gray-700">Unit Price</th>
                  )}
                  {columns.includes('total') && (
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
                      {columns.includes('product') && (
                        <td className="p-4 font-medium">
                          {treatment.treatment_type} - {treatment.product_name || 'Custom Treatment'}
                        </td>
                      )}
                      {columns.includes('description') && (
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {room?.name} • {surface?.name}
                            {treatment.fabric_type && ` • ${treatment.fabric_type}`}
                          </div>
                        </td>
                      )}
                      {columns.includes('qty') && (
                        <td className="p-4 text-center">{treatment.quantity || 1}</td>
                      )}
                      {columns.includes('unit_price') && (
                        <td className="p-4 text-right">{formatCurrency(treatment.unit_price || 0)}</td>
                      )}
                      {columns.includes('total') && (
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
            {content.showSubtotal !== false && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(projectData.subtotal)}</span>
              </div>
            )}
            {content.showTax && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{content.taxLabel || 'Tax'} ({(projectData.taxRate * 100).toFixed(1)}%):</span>
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

  const renderClientInfo = (block: any) => {
    const content = block.content;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-brand-primary">Client Information</h3>
        {client ? (
          <div className="space-y-1">
            <p className="font-medium">{client.name}</p>
            {client.company_name && (
              <p className="text-gray-600">{client.company_name}</p>
            )}
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
  };

  const renderImage = (block: any) => {
    const content = block.content;
    
    if (!content.src) {
      return (
        <div className="mb-6 text-center">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <p className="text-gray-500">Image placeholder</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mb-6 text-center">
        <img 
          src={content.src} 
          alt={content.alt || 'Quote image'} 
          className="max-w-full h-auto mx-auto rounded-lg"
          style={{ width: content.width || '100%' }}
        />
      </div>
    );
  };

  const renderTotals = (block: any) => {
    const content = block.content;
    
    if (!projectData) {
      return (
        <div className="mb-6">
          <div className="flex justify-end">
            <div className="w-80 space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax (8.0%):</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
                <span>Total:</span>
                <span className="text-brand-primary">$0.00</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="flex justify-end">
          <div className="w-80 space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(projectData.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax ({(projectData.taxRate * 100).toFixed(1)}%):</span>
              <span className="font-medium">{formatCurrency(projectData.taxAmount)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
              <span>Total:</span>
              <span className="text-brand-primary">{formatCurrency(projectData.total)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSpacer = (block: any) => {
    const content = block.content;
    
    return (
      <div 
        style={{ 
          height: content.height || '20px',
          backgroundColor: content.backgroundColor || 'transparent'
        }} 
      />
    );
  };

  const renderDivider = (block: any) => {
    const content = block.content;
    
    return (
      <div 
        className="mb-6"
        style={{ margin: content.margin || '20px 0' }}
      >
        <hr 
          style={{
            borderColor: content.color || '#e2e8f0',
            borderStyle: content.style || 'solid',
            borderWidth: content.thickness || '1px'
          }}
        />
      </div>
    );
  };

  const renderSignature = (block: any) => {
    const content = block.content;
    
    return (
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-8 mt-8">
          {content.showSignature && (
            <div>
              <div className="border-b border-gray-300 pb-2 mb-2 h-16"></div>
              <p className="text-sm text-gray-600">{content.signatureLabel || 'Authorized Signature'}</p>
            </div>
          )}
          {content.showDate && (
            <div>
              <div className="border-b border-gray-300 pb-2 mb-2 h-16"></div>
              <p className="text-sm text-gray-600">{content.dateLabel || 'Date'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPayment = (block: any) => {
    const content = block.content;
    
    return (
      <div className="mb-6">
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Payment</h3>
          <p className="text-gray-600 mb-4">{content.description || 'Secure payment processing'}</p>
          <div className="mb-4">
            <span className="text-2xl font-bold text-brand-primary">
              {content.currency || '$'}{projectData?.total.toFixed(2) || content.amount || '0.00'}
            </span>
          </div>
          <button 
            className="bg-brand-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition-colors"
            disabled
          >
            {content.buttonText || 'Pay Now'}
          </button>
          <p className="text-xs text-gray-500 mt-3">
            {content.securityText || '🔒 Secure SSL encrypted payment'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex justify-end">
        <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'simple' | 'detailed' | 'itemized' | 'visual')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background">
            <SelectItem value="simple">Simple</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="itemized">Itemized</SelectItem>
            <SelectItem value="visual">Visual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-lg shadow-sm max-w-4xl mx-auto">
        <div className="p-8">
          {blocks.map((block) => {
          switch (block.type) {
            case 'header':
              return <div key={block.id}>{renderHeader(block)}</div>;
            case 'client':
              return <div key={block.id}>{renderClient(block)}</div>;
            case 'client-info':
              return <div key={block.id}>{renderClientInfo(block)}</div>;
            case 'image':
              return <div key={block.id}>{renderImage(block)}</div>;
            case 'products':
              return <div key={block.id}>{renderProducts(block)}</div>;
            case 'totals':
              return <div key={block.id}>{renderTotals(block)}</div>;
            case 'spacer':
              return <div key={block.id}>{renderSpacer(block)}</div>;
            case 'divider':
              return <div key={block.id}>{renderDivider(block)}</div>;
            case 'signature':
              return <div key={block.id}>{renderSignature(block)}</div>;
            case 'payment':
              return <div key={block.id}>{renderPayment(block)}</div>;
            case 'footer':
              return <div key={block.id}>{renderFooter(block)}</div>;
            default:
              return null;
          }
          })}
        </div>
      </div>
    </div>
  );
};
