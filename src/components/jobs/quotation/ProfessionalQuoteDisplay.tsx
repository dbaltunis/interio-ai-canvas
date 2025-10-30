import React from 'react';
import { format } from 'date-fns';
import { Building2 } from 'lucide-react';
import { formatJobNumber } from '@/lib/format-job-number';

interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  room_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
  children?: Array<{
    name: string;
    price: number;
  }>;
}

interface ProfessionalQuoteDisplayProps {
  projectData: {
    project: any;
    client: any;
    businessSettings: any;
    treatments: QuoteItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    validUntil?: string;
  };
  showImages?: boolean;
  showDetailedBreakdown?: boolean;
  groupByRoom?: boolean;
}

export const ProfessionalQuoteDisplay = React.forwardRef<HTMLDivElement, ProfessionalQuoteDisplayProps>(
  ({ projectData, showImages = true, showDetailedBreakdown = false, groupByRoom = false }, ref) => {
    const { project, client, businessSettings, treatments, subtotal, taxRate, taxAmount, total, validUntil } = projectData;
    
    const currencySymbol = '£';
    
    const formatCurrency = (amount: number) => {
      return `${currencySymbol}${amount.toFixed(2)}`;
    };

    // Group treatments by room if needed
    const groupedTreatments = React.useMemo(() => {
      if (!groupByRoom) {
        return { 'All Items': treatments };
      }
      
      const grouped: Record<string, QuoteItem[]> = {};
      treatments.forEach(item => {
        const roomName = item.room_name || 'Other Items';
        if (!grouped[roomName]) {
          grouped[roomName] = [];
        }
        grouped[roomName].push(item);
      });
      return grouped;
    }, [treatments, groupByRoom]);

    return (
      <div 
        ref={ref}
        style={{
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12px',
          lineHeight: '1.6',
          color: '#000000',
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '210mm',
          minHeight: '297mm',
          padding: '20mm 15mm',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
            {/* Logo & Company Info */}
            <div>
              {businessSettings?.company_logo_url ? (
                <img 
                  src={businessSettings.company_logo_url} 
                  alt="Company Logo"
                  style={{ 
                    height: '60px',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    marginBottom: '12px'
                  }}
                />
              ) : (
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: '#3b82f6', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Building2 style={{ color: 'white', width: '32px', height: '32px' }} />
                </div>
              )}
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                {businessSettings?.company_name || 'Your Company'}
              </div>
              {businessSettings?.address && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {businessSettings.address}
                  {businessSettings.city && `, ${businessSettings.city}`}
                  {businessSettings.state && `, ${businessSettings.state}`}
                  {businessSettings.zip_code && ` ${businessSettings.zip_code}`}
                </div>
              )}
              {businessSettings?.business_phone && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {businessSettings.business_phone}
                </div>
              )}
              {businessSettings?.business_email && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {businessSettings.business_email}
                </div>
              )}
            </div>

            {/* Quote Details */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                QUOTATION
              </div>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>Quote #:</span> {formatJobNumber(project?.job_number || project?.quote_number) || 'QT-001'}
              </div>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600' }}>Date:</span> {project?.created_at ? format(new Date(project.created_at), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy')}
              </div>
              <div style={{ fontSize: '12px' }}>
                <span style={{ fontWeight: '600' }}>Valid Until:</span> {validUntil ? format(new Date(validUntil), 'MMM dd, yyyy') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          {/* Client Information */}
          {client && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>
                CLIENT INFORMATION
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                {client.name}
              </div>
              {client.company_name && (
                <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '2px' }}>
                  {client.company_name}
                </div>
              )}
              {client.email && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>
                  {client.phone}
                </div>
              )}
              {client.address && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {client.address}
                  {client.city && `, ${client.city}`}
                  {client.state && `, ${client.state}`}
                  {client.zip_code && ` ${client.zip_code}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quote Items */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase', color: '#1f2937' }}>
            QUOTE ITEMS
          </div>

          {Object.entries(groupedTreatments).map(([roomName, items]) => (
            <div key={roomName} style={{ marginBottom: '24px' }}>
              {groupByRoom && roomName !== 'All Items' && (
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '13px', 
                  marginBottom: '12px', 
                  paddingBottom: '6px',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#374151'
                }}>
                  {roomName}
                </div>
              )}

              {items.map((item, index) => (
                <div 
                  key={item.id || index}
                  style={{ 
                    marginBottom: '20px',
                    paddingBottom: '20px',
                    borderBottom: index < items.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                  className="avoid-page-break"
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {/* Image */}
                    {showImages && item.image_url && (
                      <div style={{ flexShrink: 0 }}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                            {item.name}
                          </div>
                          {item.description && (
                            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                              {item.description}
                            </div>
                          )}
                          {!groupByRoom && item.room_name && (
                            <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                              Room: {item.room_name}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '100px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {formatCurrency(item.total)}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdown */}
                      {showDetailedBreakdown && item.children && item.children.length > 0 && (
                        <div style={{ 
                          marginTop: '12px', 
                          paddingLeft: '16px', 
                          borderLeft: '2px solid #e5e7eb',
                          fontSize: '11px'
                        }}>
                          {item.children.map((child, childIndex) => (
                            <div 
                              key={childIndex}
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '4px',
                                color: '#6b7280'
                              }}
                            >
                              <span>• {child.name}</span>
                              <span>{formatCurrency(child.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '20px', 
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', fontSize: '13px' }}>
              <span style={{ color: '#6b7280' }}>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px', fontSize: '13px' }}>
              <span style={{ color: '#6b7280' }}>VAT ({(taxRate * 100).toFixed(1)}%):</span>
              <span style={{ fontWeight: '600' }}>{formatCurrency(taxAmount)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '250px', 
              fontSize: '16px',
              fontWeight: 'bold',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div style={{ 
          marginTop: '48px',
          fontSize: '10px',
          color: '#6b7280',
          lineHeight: '1.6'
        }}>
          <div style={{ fontWeight: '600', fontSize: '11px', marginBottom: '8px', color: '#374151' }}>
            TERMS & CONDITIONS
          </div>
          <div style={{ whiteSpace: 'pre-line' }}>
            • Payment terms: 50% deposit required, balance due upon completion
            {'\n'}• Prices valid for 30 days from quote date
            {'\n'}• All measurements are approximate and subject to site verification
            {'\n'}• Installation included unless otherwise stated
            {'\n'}• Lead time: 4-6 weeks from deposit receipt
          </div>
        </div>

        {/* Signature Section */}
        <div style={{ 
          marginTop: '40px',
          paddingTop: '40px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ borderTop: '1px solid #000', width: '200px', marginBottom: '8px' }}></div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Authorized Signature</div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #000', width: '120px', marginBottom: '8px' }}></div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Date</div>
          </div>
        </div>
      </div>
    );
  }
);

ProfessionalQuoteDisplay.displayName = 'ProfessionalQuoteDisplay';
