import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  User,
  ShoppingCart,
  Calculator,
  PenTool,
  Type,
  Image as ImageIcon,
  Minus,
  Plus,
  Space
} from "lucide-react";
import { SignatureCanvas } from './SignatureCanvas';

interface LivePreviewBlockProps {
  block: any;
  projectData?: any;
  isEditable?: boolean;
}

const LivePreviewBlock = ({ block, projectData, isEditable }: LivePreviewBlockProps) => {
  const content = block.content || {};
  const style = content.style || {};
  
  // Trim and normalize block type to prevent matching issues
  const blockType = (block.type || '').toString().trim().toLowerCase();
  console.log('LivePreviewBlock rendering:', { 
    originalType: block.type, 
    normalizedType: blockType,
    blockData: block 
  });

  const renderTokenValue = (token: string) => {
    // Use real project data or fallback to defaults
    const project = projectData?.project || {};
    const client = project.client || projectData?.client || {};
    const businessSettings = projectData?.businessSettings || {};
    
    console.log('🔍 Client Data Debug:', {
      token,
      projectData: projectData,
      project: project,
      client: client,
      hasClient: !!client,
      clientKeys: Object.keys(client),
      clientName: client?.name,
      projectClientId: project?.client_id
    });
    
    const tokens = {
      // Company information from business settings
      company_name: businessSettings.company_name || 'Your Company Name',
      company_address: businessSettings.address ? 
        `${businessSettings.address}${businessSettings.city ? ', ' + businessSettings.city : ''}${businessSettings.state ? ', ' + businessSettings.state : ''}${businessSettings.zip_code ? ' ' + businessSettings.zip_code : ''}` 
        : '123 Business Ave, Suite 100',
      company_phone: businessSettings.business_phone || '(555) 123-4567',
      company_email: businessSettings.business_email || 'info@company.com',
      company_website: businessSettings.website || 'www.company.com',
      company_abn: businessSettings.abn || '',
      company_country: businessSettings.country || 'Australia',
      
      // Client information from project
      client_name: client.name || '',
      client_email: client.email || '', 
      client_phone: client.phone || '',
      client_address: client.address ? 
        `${client.address}${client.city ? ', ' + client.city : ''}${client.state ? ', ' + client.state : ''}${client.zip_code ? ' ' + client.zip_code : ''}` 
        : '',
      client_company: client.company_name || '',
      client_type: client.client_type || 'B2C',
      client_abn: client.abn || '',
      client_business_email: client.business_email || '',
      client_business_phone: client.business_phone || '',
      
      // Project information
      quote_number: project.quote_number || project.job_number || 'QT-2024-001',
      job_number: project.job_number || project.quote_number || 'JOB-2024-001',
      project_name: project.name || 'Window Treatment Project',
      project_id: project.id || '',
      
      // Dates
      date: project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      quote_date: project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      valid_until: projectData?.validUntil ? new Date(projectData.validUntil).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      
      // Financial information with currency support
      currency: projectData?.currency || 'USD',
      currency_symbol: projectData?.currency === 'AUD' ? 'A$' : projectData?.currency === 'NZD' ? 'NZ$' : '$',
      subtotal: projectData?.subtotal ? `${projectData.currency === 'AUD' ? 'A$' : projectData.currency === 'NZD' ? 'NZ$' : '$'}${projectData.subtotal.toFixed(2)}` : '$0.00',
      tax_amount: projectData?.taxAmount ? `${projectData.currency === 'AUD' ? 'A$' : projectData.currency === 'NZD' ? 'NZ$' : '$'}${projectData.taxAmount.toFixed(2)}` : '$0.00',
      tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '8.5%',
      total: projectData?.total ? `${projectData.currency === 'AUD' ? 'A$' : projectData.currency === 'NZD' ? 'NZ$' : '$'}${projectData.total.toFixed(2)}` : '$0.00',
      
      // Additional project details
      terms: projectData?.terms || 'Payment due within 30 days of invoice date.',
      notes: projectData?.notes || '',
      project_status: project.status || 'draft'
    };
    return tokens[token as keyof typeof tokens] !== undefined && tokens[token as keyof typeof tokens] !== '' 
      ? tokens[token as keyof typeof tokens] 
      : '';
  };

  const replaceTokens = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, token) => renderTokenValue(token));
  };

  switch (blockType) {
    case 'header':
      return (
        <div 
          className="p-6 rounded-lg mb-6" 
          style={{ 
            backgroundColor: style.backgroundColor || '#f8fafc',
            color: style.textColor || '#1e293b'
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {content.showLogo && (
                <div className={`mb-4 ${content.logoPosition === 'center' ? 'text-center' : ''}`}>
                  {projectData?.businessSettings?.company_logo_url ? (
                    <img 
                      src={projectData.businessSettings.company_logo_url} 
                      alt="Company Logo" 
                      className="h-16 w-auto object-contain"
                      style={{ maxWidth: '200px' }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              )}
              <h1 className="text-3xl font-bold mb-2">
                {renderTokenValue('company_name')}
              </h1>
              <div className="space-y-1 opacity-90 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{renderTokenValue('company_address')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{renderTokenValue('company_phone')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{renderTokenValue('company_email')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold mb-2">{content.documentTitle || 'Quote'}</h2>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  <span>{content.quoteNumberLabel || "Quote #"}: {renderTokenValue('quote_number')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{content.dateLabel || "Date"}: {renderTokenValue('date')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{content.validUntilLabel || "Valid Until"}: {renderTokenValue('valid_until')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'client-info':
      const clientName = renderTokenValue('client_name');
      const clientCompany = renderTokenValue('client_company');
      const clientEmail = renderTokenValue('client_email');
      const clientPhone = renderTokenValue('client_phone');
      const clientAddress = renderTokenValue('client_address');
      const clientAbn = renderTokenValue('client_abn');
      const clientBusinessEmail = renderTokenValue('client_business_email');
      const clientBusinessPhone = renderTokenValue('client_business_phone');
      const clientType = renderTokenValue('client_type');
      
      console.log('📋 Client Info Block - Rendered Values:', {
        clientName,
        clientCompany,
        clientEmail,
        clientPhone,
        clientAddress,
        clientAbn,
        clientBusinessEmail,
        clientBusinessPhone,
        clientType,
        showCompany: content.showCompany,
        showClientEmail: content.showClientEmail,
        showClientPhone: content.showClientPhone,
        showClientAddress: content.showClientAddress
      });
      
      const isB2B = clientType === 'B2B';
      
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-brand-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            {content.title || 'Bill To:'}
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-1">
              {clientName && <p className="font-medium">{clientName}</p>}
              {clientCompany && (
                <p className="text-gray-600 font-medium">{clientCompany}</p>
              )}
              {isB2B && clientAbn && (
                <p className="text-gray-600 text-sm">ABN: {clientAbn}</p>
              )}
              {isB2B && clientBusinessEmail && (
                <p className="text-gray-600 text-sm">Business: {clientBusinessEmail}</p>
              )}
              {isB2B && clientBusinessPhone && (
                <p className="text-gray-600 text-sm">Business Phone: {clientBusinessPhone}</p>
              )}
              {clientEmail && (
                <p className="text-gray-600">{isB2B ? 'Contact: ' : ''}{clientEmail}</p>
              )}
              {clientPhone && (
                <p className="text-gray-600">{isB2B ? 'Contact Phone: ' : 'Phone: '}{clientPhone}</p>
              )}
              {clientAddress && (
                <p className="text-gray-600">{clientAddress}</p>
              )}
            </div>
          </div>
        </div>
      );

    case 'products':
      const [showDetailedProducts, setShowDetailedProducts] = React.useState(false);
      const [groupByRoom, setGroupByRoom] = React.useState(false);
      
      // Get real workshop items data which has the detailed breakdown
      const workshopItems = projectData?.workshopItems || [];
      const projectItems = workshopItems.length > 0 ? workshopItems : (projectData?.treatments || projectData?.windowSummaries || []);
      const hasRealData = workshopItems.length > 0;

      // Function to get itemized breakdown for a workshop item
      const getItemizedBreakdown = (item: any) => {
        const components = [];
        
        // Extract fabric details
        if (item.fabric_details) {
          const fabricCost = parseFloat(item.linear_meters || 0) * parseFloat(item.fabric_details.price_per_meter || 0);
          components.push({
            type: 'Fabric',
            description: `${item.fabric_details.name || 'Fabric'} | ${parseFloat(item.fabric_details.width || 0).toFixed(2)} m`,
            quantity: parseFloat(item.linear_meters || 0).toFixed(2),
            unit: 'm',
            rate: parseFloat(item.fabric_details.price_per_meter || 0).toFixed(2),
            total: fabricCost.toFixed(2)
          });
        }

        // Extract manufacturing details
        if (item.manufacturing_details && item.manufacturing_details.cost > 0) {
          components.push({
            type: 'Manufacturing price',
            description: '-',
            quantity: '1',
            unit: '',
            rate: parseFloat(item.manufacturing_details.cost || 0).toFixed(2),
            total: parseFloat(item.manufacturing_details.cost || 0).toFixed(2)
          });
        }

        // Extract lining if present
        if (item.manufacturing_details?.lining_type) {
          const liningCost = parseFloat(item.linear_meters || 0) * 10; // Standard lining cost
          components.push({
            type: 'Lining',
            description: item.manufacturing_details.lining_type || 'Blackout',
            quantity: parseFloat(item.linear_meters || 0).toFixed(2),
            unit: 'm',
            rate: '10.00',
            total: liningCost.toFixed(2)
          });
        }

        // Add heading row (can be 0.00)
        components.push({
          type: 'Heading',
          description: 'Regular Headrail',
          quantity: Math.round((item.measurements?.rail_width || 200)),
          unit: 'cm',
          rate: '0.00',
          total: '0.00'
        });

        return components;
      };

      // Group items by room if enabled
      const groupedItems = groupByRoom && hasRealData ? 
        projectItems.reduce((acc: any, item: any) => {
          const room = item.room_name || item.location || 'Main Area';
          if (!acc[room]) acc[room] = [];
          acc[room].push(item);
          return acc;
        }, {}) : 
        { 'All Items': projectItems };

      return (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {content.title || 'Quote Items'}
            </h3>
            <div className="flex items-center gap-3">
              {hasRealData && (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={groupByRoom}
                    onChange={(e) => setGroupByRoom(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Group by room
                </label>
              )}
              <button
                onClick={() => setShowDetailedProducts(!showDetailedProducts)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
              >
                {showDetailedProducts ? 'Simple' : 'Detailed'}
              </button>
            </div>
          </div>

          {!hasRealData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                💡 No project data available. Add treatments to your project to see itemized breakdown.
              </p>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">#</th>
                  <th className="text-left p-3 text-sm font-medium">Product/Service</th>
                  <th className="text-left p-3 text-sm font-medium">Description</th>
                  <th className="text-center p-3 text-sm font-medium">Quantity</th>
                  <th className="text-right p-3 text-sm font-medium">Price rate</th>
                  <th className="text-right p-3 text-sm font-medium">Total without GST</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedItems).map(([roomName, items]: [string, any]) => (
                  <React.Fragment key={roomName}>
                    {groupByRoom && hasRealData && (
                      <tr className="bg-gray-100 border-t-2 border-gray-300">
                        <td colSpan={6} className="p-3 font-medium text-gray-800">
                          {roomName}
                        </td>
                      </tr>
                    )}
                    {(items as any[]).map((item: any, itemIndex: number) => {
                      const itemNumber = groupByRoom ? itemIndex + 1 : Object.values(groupedItems).flat().indexOf(item) + 1;
                      
                      if (showDetailedProducts && hasRealData) {
                        // Detailed view with itemization
                        const itemizedComponents = getItemizedBreakdown(item);
                        return (
                          <React.Fragment key={`${roomName}-${itemIndex}`}>
                            {/* Main product row */}
                            <tr className="border-t">
                              <td className="p-3 font-medium">{itemNumber}</td>
                              <td className="p-3 font-medium">
                                {item.treatment_type || item.name || 'Window Treatment'}
                              </td>
                              <td className="p-3">
                                {item.treatment_type || item.name || 'Custom Treatment'}
                              </td>
                              <td className="p-3 text-center">{item.quantity || 1}</td>
                              <td className="p-3 text-right">
                                ${(item.total_cost || item.total_price || 0).toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-medium">
                                ${((item.total_cost || item.total_price || 0) * (item.quantity || 1)).toFixed(2)}
                              </td>
                            </tr>
                            {/* Itemized component rows with smaller font and indentation */}
                            {itemizedComponents.map((component, compIndex) => (
                              <tr key={`${roomName}-${itemIndex}-${compIndex}`} className="border-t border-gray-100">
                                <td className="p-3"></td>
                                <td className="p-3 pl-8 text-sm text-gray-600">{component.type}</td>
                                <td className="p-3 text-sm text-gray-600">{component.description}</td>
                                <td className="p-3 text-center text-sm text-gray-600">{component.quantity} {component.unit}</td>
                                <td className="p-3 text-right text-sm text-gray-600">${component.rate}</td>
                                <td className="p-3 text-right text-sm text-gray-600">${component.total}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      } else {
                        // Simple view
                        return (
                          <tr key={`${roomName}-${itemIndex}`} className="border-t">
                            <td className="p-3">{itemNumber}</td>
                            <td className="p-3">{item.treatment_type || item.name || 'Window Treatment'}</td>
                            <td className="p-3 text-sm text-gray-600">
                              {item.description || item.notes || `${item.width || 0}" x ${item.height || 0}"`}
                            </td>
                            <td className="p-3 text-center">{item.quantity || 1}</td>
                            <td className="p-3 text-right">${(item.unit_price || item.cost_per_unit || 0).toFixed(2)}</td>
                            <td className="p-3 text-right font-medium">
                              ${(item.total_cost || item.total_price || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </React.Fragment>
                ))}
                
                {!hasRealData && (
                  <tr className="border-t">
                    <td className="p-3">1</td>
                    <td className="p-3">Sample Window Treatment</td>
                    <td className="p-3 text-sm text-gray-600">Custom drapery installation</td>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right">$1,250.00</td>
                    <td className="p-3 text-right font-medium">$1,250.00</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'totals':
      return (
        <div className="mb-8">
          <div className="flex justify-end">
            <div 
              className="w-80 space-y-2 p-4 rounded-lg"
              style={{ 
                backgroundColor: style.backgroundColor || '#f8fafc',
                borderColor: style.borderColor || '#e2e8f0'
              }}
            >
              {content.showSubtotal !== false && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{renderTokenValue('subtotal')}</span>
                </div>
              )}
              {content.showTax && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax ({renderTokenValue('tax_rate')}):</span>
                  <span className="font-medium">{renderTokenValue('tax_amount')}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
                <span>Total:</span>
                <span className="text-brand-primary">{renderTokenValue('total')}</span>
              </div>
            </div>
          </div>
        </div>
      );


    case 'text':
      return (
        <div className="mb-6" style={style}>
          <div 
            className="whitespace-pre-wrap"
            style={{ 
              fontSize: style.fontSize || '16px',
              fontWeight: style.fontWeight || 'normal',
              fontStyle: style.fontStyle || 'normal',
              textDecoration: style.textDecoration || 'none',
              textAlign: style.textAlign || 'left',
              color: style.color || 'inherit',
              padding: style.padding || '16px',
              backgroundColor: style.backgroundColor || 'transparent'
            }}
          >
            {content.text || 'Enter your text here...'}
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="mb-6 text-center">
          {content.src ? (
            <img 
              src={content.src} 
              alt={content.alt || 'Image'} 
              className="max-w-full h-auto mx-auto rounded-lg"
              style={{ width: content.width || 'auto' }}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Image placeholder</p>
            </div>
          )}
        </div>
      );

    case 'spacer':
      return (
        <div 
          className="w-full" 
          style={{ height: content.height || '20px' }}
        />
      );

    case 'divider':
      return (
        <div className="mb-6">
          <hr 
            style={{ 
              borderColor: content.color || '#e5e7eb',
              borderWidth: content.thickness || '1px'
            }} 
          />
        </div>
      );

    case 'line-items':
      const [showDetailed, setShowDetailed] = React.useState(false);
      
      // Mock detailed itemization data - in real app, this would come from projectData
      const detailedItems = [
        {
          category: 'Fabric',
          items: [
            { name: 'Premium Linen Fabric', quantity: '8.5', unit: 'metres', unitPrice: 45.00, total: 382.50 },
            { name: 'Fabric Cutting & Preparation', quantity: '1', unit: 'service', unitPrice: 25.00, total: 25.00 }
          ]
        },
        {
          category: 'Hardware',
          items: [
            { name: 'Curtain Rod - Premium Steel', quantity: '1', unit: 'piece', unitPrice: 185.00, total: 185.00 },
            { name: 'End Caps & Brackets', quantity: '2', unit: 'sets', unitPrice: 35.00, total: 70.00 },
            { name: 'Installation Hardware', quantity: '1', unit: 'kit', unitPrice: 45.00, total: 45.00 }
          ]
        },
        {
          category: 'Labor',
          items: [
            { name: 'Professional Measurement', quantity: '1', unit: 'hour', unitPrice: 85.00, total: 85.00 },
            { name: 'Custom Fabrication', quantity: '6', unit: 'hours', unitPrice: 65.00, total: 390.00 },
            { name: 'Installation Service', quantity: '2', unit: 'hours', unitPrice: 75.00, total: 150.00 }
          ]
        }
      ];

      const simpleItems = [
        { description: 'Custom Drapery Installation', quantity: '1', unitPrice: '$1,250.00', total: '$1,250.00' }
      ];

      return (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {content.title || 'Line Items'}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailed(!showDetailed)}
              className="flex items-center gap-2"
            >
              {showDetailed ? (
                <>
                  <Minus className="h-4 w-4" />
                  Simple View
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Detailed View
                </>
              )}
            </Button>
          </div>

          {showDetailed ? (
            // Detailed Itemized View
            <div className="space-y-6">
              {detailedItems.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h4 className="font-medium text-gray-900">{category.category}</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-sm">
                          <th className="text-left p-3 font-medium">Item Description</th>
                          <th className="text-center p-3 font-medium w-20">Qty</th>
                          <th className="text-center p-3 font-medium w-20">Unit</th>
                          <th className="text-right p-3 font-medium w-24">Unit Price</th>
                          <th className="text-right p-3 font-medium w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-t border-gray-200">
                            <td className="p-3 text-sm">{item.name}</td>
                            <td className="p-3 text-sm text-center">{item.quantity}</td>
                            <td className="p-3 text-sm text-center text-gray-600">{item.unit}</td>
                            <td className="p-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                            <td className="p-3 text-sm text-right font-medium">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 border-t">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span>{category.category} Subtotal:</span>
                      <span>${category.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Simple View
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left font-medium">Description</th>
                    <th className="border border-gray-300 p-3 text-center w-24 font-medium">Qty</th>
                    <th className="border border-gray-300 p-3 text-right w-32 font-medium">Unit Price</th>
                    <th className="border border-gray-300 p-3 text-right w-32 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {simpleItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-3">{item.description}</td>
                      <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-3 text-right">{item.unitPrice}</td>
                      <td className="border border-gray-300 p-3 text-right font-medium">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span className="font-medium">{renderTokenValue('subtotal')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tax ({renderTokenValue('tax_rate')}):</span>
                  <span className="font-medium">{renderTokenValue('tax_amount')}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                  <span>Total:</span>
                  <span>{renderTokenValue('total')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'terms-conditions':
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary">
            {content.title || 'Terms & Conditions'}
          </h3>
          <div className="text-sm space-y-3">
            <div>1. Payment Terms: 50% deposit required upon acceptance of this quote. Remaining balance due upon completion.</div>
            <div>2. Timeline: Project completion is estimated at 2-3 weeks from deposit receipt and final measurements.</div>
            <div>3. Warranty: All work comes with a 1-year warranty against defects in workmanship.</div>
            <div>4. Cancellation: This quote is valid for 30 days. Cancellation after work begins subject to materials and labor charges.</div>
          </div>
        </div>
      );

    case 'payment-info':
      return (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {content.title || 'Payment Information'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Methods
              </h4>
              <div className="text-sm space-y-1">
                <div>• Cash, Check, or Credit Card</div>
                <div>• Bank Transfer (ACH)</div>
                <div>• Financing Available</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Schedule</h4>
              <div className="text-sm space-y-1">
                <div>Deposit: 50% upon signing</div>
                <div>Progress: 25% at midpoint</div>
                <div>Final: 25% upon completion</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'project-scope':
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary">
            {content.title || 'Project Scope'}
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Included:</h4>
              <div className="text-sm space-y-1 pl-4">
                <div>✓ Professional measurement and consultation</div>
                <div>✓ Custom fabrication of drapery</div>
                <div>✓ Hardware installation and mounting</div>
                <div>✓ Final styling and adjustments</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Not Included:</h4>
              <div className="text-sm space-y-1 pl-4">
                <div>• Wall repairs or painting</div>
                <div>• Removal of existing treatments</div>
                <div>• Electrical work for motorization</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'signature':
      return (
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-semibold mb-6 text-brand-primary">
            {content.title || 'Authorization'}
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm mb-4">{content.authorizationText || "By signing below, you authorize us to proceed with this work as described:"}</p>
              <div className="border-t border-gray-400 pt-2 mt-12">
                <div className="text-sm">
                  <div className="font-medium">{content.clientSignatureLabel || "Client Signature"}</div>
                  <div className="text-gray-600">{content.printNameLabel || "Print Name"}: {renderTokenValue('client_name')}</div>
                  <div className="text-gray-600">{content.dateLabel || "Date"}: _________________</div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm mb-4">{content.thankYouText || "Thank you for choosing us for your project!"}</p>
              <div className="border-t border-gray-400 pt-2 mt-12">
                <div className="text-sm">
                  <div className="font-medium">{content.companySignatureLabel || "Company Representative"}</div>
                  <div className="text-gray-600">{content.printNameLabel || "Print Name"}: _________________</div>
                  <div className="text-gray-600">{content.dateLabel || "Date"}: _________________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      console.error('Unknown block type encountered:', {
        originalType: block.type,
        normalizedType: blockType,
        blockData: block
      });
      return (
        <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Unknown block type: {block.type}</p>
          <p className="text-xs mt-2">Normalized: {blockType}</p>
          <p className="text-xs mt-2">Check console for details</p>
        </div>
      );
  }
};

interface LivePreviewProps {
  blocks: any[];
  projectData?: any;
  isEditable?: boolean;
  onBlocksChange?: (blocks: any[]) => void;
  containerStyles?: any;
  onContainerStylesChange?: (styles: any) => void;
}

export const LivePreview = ({ 
  blocks, 
  projectData, 
  isEditable = false,
  onBlocksChange,
  containerStyles,
  onContainerStylesChange 
}: LivePreviewProps) => {
  console.log('LivePreview rendering with blocks:', blocks?.length || 0);

  // If editable and we have update functions, use the editable version
  if (isEditable && onBlocksChange) {
    const EditableLivePreview = React.lazy(() => import('./EditableLivePreview').then(module => ({ default: module.EditableLivePreview })));
    return (
      <Suspense fallback={<div className="p-8 text-center">Loading editor...</div>}>
        <EditableLivePreview
          blocks={blocks}
          projectData={projectData}
          onBlocksChange={onBlocksChange}
          containerStyles={containerStyles}
          onContainerStylesChange={onContainerStylesChange}
        />
      </Suspense>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No blocks to preview</h3>
          <p className="text-sm">Add some blocks to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div 
        className="bg-white min-h-full"
        style={{ backgroundColor: containerStyles?.backgroundColor || '#ffffff' }}
      >
        <div 
          className={`mx-auto ${containerStyles?.maxWidth === 'full' ? 'w-full' : `max-w-${containerStyles?.maxWidth || '4xl'}`}`}
          style={{ padding: containerStyles?.padding || '32px' }}
        >
          {blocks.map((block, index) => (
            <LivePreviewBlock 
              key={block.id || index} 
              block={block} 
              projectData={projectData}
              isEditable={isEditable}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};