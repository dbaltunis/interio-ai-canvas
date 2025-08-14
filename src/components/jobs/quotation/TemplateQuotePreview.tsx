import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';
import { LivePreview } from '@/components/settings/templates/visual-editor/LivePreview';

interface TemplateQuotePreviewProps {
  project: any;
  treatments: any[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  markupPercentage: number;
  templateId: string;
  isFullScreen?: boolean;
}

interface QuoteItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  breakdown?: Array<{
    description: string;
    amount: number;
  }>;
}

export const TemplateQuotePreview = ({
  project,
  treatments,
  subtotal,
  taxRate,
  taxAmount,
  total,
  markupPercentage,
  templateId,
  isFullScreen = false
}: TemplateQuotePreviewProps) => {
  const { data: clients } = useClients();
  const { data: businessSettings } = useBusinessSettings();
  const { data: templates } = useQuoteTemplates();
  const selectedTemplate = templates?.find(t => t.id === templateId);
  
  // Use LivePreview for visual templates or if blocks exist
  if (selectedTemplate?.blocks && Array.isArray(selectedTemplate.blocks)) {
    const projectData = {
      project,
      treatments,
      rooms: [], // Add rooms data if available
      surfaces: [], // Add surfaces data if available
      subtotal,
      taxRate,
      taxAmount,
      total,
      markupPercentage
    };

    if (isFullScreen) {
      return (
        <div 
          className="pdf-document-content"
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#000000',
            backgroundColor: '#ffffff',
            minHeight: '100vh',
            width: '100%',
            padding: '32px'
          }}
        >
          <div className="p-8">
            <LivePreview 
              blocks={selectedTemplate.blocks} 
              projectData={projectData}
              isEditable={false}
            />
          </div>
        </div>
      );
    }

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#000000' }}>
              Quote Preview - {selectedTemplate?.name || templateId} Template
            </h3>
            <Badge variant="outline" style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #d1d5db' }}>
              {selectedTemplate?.name || templateId}
            </Badge>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#ffffff', padding: 0 }}>
          <LivePreview 
            blocks={selectedTemplate.blocks} 
            projectData={projectData}
            isEditable={false}
          />
        </div>
      </div>
    );
  }

  // Fallback to legacy rendering for simple templates
  const client = clients?.find(c => c.id === project.client_id);
  const isSimpleTemplate = selectedTemplate?.template_type === 'simple' || selectedTemplate?.blockSettings;
  const blockSettings = selectedTemplate?.blockSettings;

  // Format currency using business settings
  const formatCurrencyWithSettings = (amount: number) => {
    const currency = 'USD'; // Default to USD since currency field doesn't exist in business settings yet
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    });
    return formatter.format(amount);
  };

  // Create quote items from treatments
  const quoteItems: QuoteItem[] = treatments.map(treatment => {
    const basePrice = treatment.base_price || 0;
    const laborPrice = treatment.labor_price || 0;
    const materialPrice = treatment.material_price || 0;
    const quantity = treatment.quantity || 1;
    
    const unitPrice = basePrice + laborPrice + materialPrice;
    const totalPrice = unitPrice * quantity;

    // Create detailed breakdown for premium template
    const breakdown = templateId === 'premium' || blockSettings?.itemsLayout === 'detailed' ? [
      { description: 'Base price', amount: basePrice },
      { description: 'Labor', amount: laborPrice },
      { description: 'Materials', amount: materialPrice }
    ].filter(item => item.amount > 0) : undefined;

    return {
      name: treatment.name || 'Window Treatment',
      description: treatment.description,
      quantity,
      unitPrice,
      totalPrice,
      breakdown
    };
  });

  const renderHeader = () => (
    <div className="bg-white text-black p-6 border-b space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          {businessSettings?.company_name && (
            <h1 className="text-2xl font-bold text-black">{businessSettings.company_name}</h1>
          )}
          {businessSettings?.address && (
            <p className="text-sm text-gray-600">{businessSettings.address}</p>
          )}
          <div className="text-sm text-gray-600 space-y-1">
            {businessSettings?.business_phone && <p>Phone: {businessSettings.business_phone}</p>}
            {businessSettings?.business_email && <p>Email: {businessSettings.business_email}</p>}
            {businessSettings?.website && <p>Website: {businessSettings.website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-black">QUOTE</h2>
          <p className="text-sm text-gray-600">Quote #: {project.id?.slice(0, 8)}</p>
          <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">Valid until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );

  const renderClientInfo = () => (
    <div className="bg-white text-black p-6 border-b space-y-3">
      <h3 className="text-lg font-semibold text-black">Bill To:</h3>
      {client ? (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-black">{client.name}</p>
          {client.address && <p className="text-gray-600">{client.address}</p>}
          {client.email && <p className="text-gray-600">Email: {client.email}</p>}
          {client.phone && <p className="text-gray-600">Phone: {client.phone}</p>}
        </div>
      ) : (
        <p className="text-sm text-gray-600">Client information not available</p>
      )}
    </div>
  );

  const renderProductsTable = () => {
    // Check if we should show detailed or simple layout based on blockSettings
    const useDetailedLayout = blockSettings?.itemsLayout === 'detailed' || templateId === 'premium' || templateId === 'detailed';
    
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quote Items</h3>
        
        {useDetailedLayout ? (
        // Detailed breakdown view
        <div className="space-y-6">
          {quoteItems.map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    <div className="font-medium text-gray-900">{formatCurrencyWithSettings(item.totalPrice)}</div>
                  </div>
                </div>
              </div>
              
              {item.breakdown && (
                <div className="p-4">
                  <div className="space-y-2">
                    {item.breakdown.map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{detail.description}</span>
                        <span className="text-gray-900">{formatCurrencyWithSettings(detail.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span>Unit Price:</span>
                        <span>{formatCurrencyWithSettings(item.unitPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Simple table view
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-4 text-left font-medium text-gray-900">Description</th>
                <th className="border border-gray-200 p-4 text-center font-medium text-gray-900">Qty</th>
                <th className="border border-gray-200 p-4 text-right font-medium text-gray-900">Unit Price</th>
                <th className="border border-gray-200 p-4 text-right font-medium text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {quoteItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1">{item.description}</div>
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
  };

  const renderTotals = () => (
    <div className="flex justify-end mb-8">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrencyWithSettings(subtotal)}</span>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
            <span className="font-medium">{formatCurrencyWithSettings(taxAmount)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between py-2">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-semibold text-gray-900">{formatCurrencyWithSettings(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="bg-gray-50 text-gray-700 p-6 border-t space-y-4">
      <div className="text-sm">
        <h4 className="font-medium mb-2">Terms & Conditions:</h4>
        <p>• Payment is due within 30 days of quote acceptance</p>
        <p>• This quote is valid for 30 days from the date issued</p>
        <p>• All work will be performed according to industry standards</p>
        <p>• Changes to scope may affect final pricing</p>
      </div>
      
      {businessSettings && (
        <div className="text-xs text-gray-600 pt-4 border-t border-gray-200">
          <p>Questions? Contact us:</p>
          {businessSettings.business_phone && <p>Phone: {businessSettings.business_phone}</p>}
          {businessSettings.business_email && <p>Email: {businessSettings.business_email}</p>}
        </div>
      )}
    </div>
  );

  // selectedTemplate is already defined above, no need to redefine

  const renderSimpleTemplateContent = () => {
    if (!blockSettings) return renderLegacyContent();

    return (
      <>
        {/* Company Header */}
        {blockSettings.showCompanyHeader && renderHeader()}
        
        {/* Custom Intro Text */}
        {blockSettings.customIntroText && (
          <div className="bg-white p-4 border-b mb-6">
            <p className="text-black text-sm leading-relaxed">{blockSettings.customIntroText}</p>
          </div>
        )}
        
        {/* Client Information */}
        {blockSettings.showClientInfo && renderClientInfo()}
        
        {/* Quote Items */}
        {blockSettings.showQuoteItems && renderProductsTable()}
        
        {/* Totals */}
        {blockSettings.showTotals && renderTotals()}
        
        {/* Footer */}
        {blockSettings.showFooter && (
          <div className="bg-white text-black p-6 border-t space-y-4 mt-8">
            {blockSettings.customFooterText && (
              <p className="text-sm font-medium">{blockSettings.customFooterText}</p>
            )}
            {blockSettings.paymentTerms && (
              <p className="text-xs text-gray-600 leading-relaxed">{blockSettings.paymentTerms}</p>
            )}
            {businessSettings && (
              <div className="text-xs text-gray-600 space-y-1">
                <p>Contact us:</p>
                {businessSettings.business_phone && <p>Phone: {businessSettings.business_phone}</p>}
                {businessSettings.business_email && <p>Email: {businessSettings.business_email}</p>}
                {businessSettings.website && <p>Website: {businessSettings.website}</p>}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderLegacyContent = () => (
    <>
      {renderHeader()}
      {renderClientInfo()}
      {renderProductsTable()}
      {renderTotals()}
      {renderFooter()}
    </>
  );

  if (isFullScreen) {
    return (
      <div 
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#000000',
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          width: '100%',
          padding: '32px'
        }}
      >
        {renderLegacyContent()}
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#000000' }}>Quote Preview - {selectedTemplate?.name || templateId} Template</h3>
          <Badge variant="outline" style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #d1d5db' }}>{selectedTemplate?.name || templateId}</Badge>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#ffffff', padding: 0 }}>
        <div 
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#000000',
            backgroundColor: '#ffffff',
            minHeight: '100vh',
            width: '100%',
            padding: '32px'
          }}
        >
          {renderLegacyContent()}
        </div>
      </div>
    </div>
  );
};