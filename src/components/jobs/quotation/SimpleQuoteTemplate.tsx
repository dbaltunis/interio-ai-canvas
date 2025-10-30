import React from 'react';
import { Building2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { buildClientBreakdown } from '@/utils/quotes/buildClientBreakdown';

interface SimpleQuoteTemplateProps {
  projectData: any;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
}

export const SimpleQuoteTemplate = React.forwardRef<HTMLDivElement, SimpleQuoteTemplateProps>(
  ({ projectData, showDetailedBreakdown = false, showImages = true }, ref) => {
    const project = projectData?.project || {};
    const client = project.client || projectData?.client || {};
    const businessSettings = projectData?.businessSettings || {};
    const items = projectData?.items || [];
    const currency = projectData?.currency || 'GBP';
    const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : currency === 'AUD' ? 'A$' : currency === 'NZD' ? 'NZ$' : '$';

    // Calculate totals
    const subtotal = projectData?.subtotal || 0;
    const taxRate = projectData?.taxRate || 0;
    const taxAmount = projectData?.taxAmount || 0;
    const total = projectData?.total || 0;

    return (
      <div
        ref={ref}
        id="quote-preview"
        className="bg-white"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '15mm',
          margin: '0 auto',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '11pt',
          color: '#1e293b',
          lineHeight: '1.5',
          pageBreakAfter: 'auto',
        }}
      >
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex items-start justify-between">
            {/* Logo & Company Info */}
            <div className="flex-1">
              {businessSettings?.company_logo_url ? (
                <img
                  src={businessSettings.company_logo_url}
                  alt="Company Logo"
                  style={{
                    height: '60px',
                    maxWidth: '200px',
                    objectFit: 'contain',
                    marginBottom: '12px',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              )}
              <div style={{ fontSize: '16pt', fontWeight: 'bold', marginBottom: '8px' }}>
                {businessSettings?.company_name || 'Your Company'}
              </div>
              <div style={{ fontSize: '9pt', color: '#64748b', lineHeight: '1.6' }}>
                {businessSettings?.address && <div>{businessSettings.address}</div>}
                {businessSettings?.city && (
                  <div>
                    {businessSettings.city}
                    {businessSettings.state && `, ${businessSettings.state}`}
                    {businessSettings.zip_code && ` ${businessSettings.zip_code}`}
                  </div>
                )}
                {businessSettings?.business_phone && <div>{businessSettings.business_phone}</div>}
                {businessSettings?.business_email && <div>{businessSettings.business_email}</div>}
              </div>
            </div>

            {/* Quote Details */}
            <div className="text-right">
              <h1 style={{ fontSize: '24pt', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>
                QUOTATION
              </h1>
              <div style={{ fontSize: '9pt', color: '#64748b', lineHeight: '1.8' }}>
                <div>
                  <strong>Quote #:</strong> {project.job_number || 'QT-2024-001'}
                </div>
                <div>
                  <strong>Date:</strong>{' '}
                  {project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                </div>
                <div>
                  <strong>Valid Until:</strong>{' '}
                  {project.due_date
                    ? new Date(project.due_date).toLocaleDateString()
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <div style={{ fontSize: '8pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>
            BILL TO
          </div>
          <div style={{ fontSize: '10pt', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{client.name || 'Client Name'}</div>
            {client.company_name && <div>{client.company_name}</div>}
            {client.address && (
              <div>
                {client.address}
                {client.city && `, ${client.city}`}
                {client.state && `, ${client.state}`}
                {client.zip_code && ` ${client.zip_code}`}
              </div>
            )}
            {client.email && <div>{client.email}</div>}
            {client.phone && <div>{client.phone}</div>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold' }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold' }}>Description</th>
                {showImages && <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold' }}>Image</th>}
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>Qty</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>Unit Price</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => {
                if (item.isHeader) {
                  return (
                    <tr key={`header-${index}`} style={{ pageBreakInside: 'avoid' }}>
                      <td
                        colSpan={showImages ? 6 : 5}
                        style={{
                          padding: '12px 8px',
                          fontWeight: 'bold',
                          backgroundColor: '#f1f5f9',
                          borderTop: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {item.name}
                      </td>
                    </tr>
                  );
                }

                const breakdown = showDetailedBreakdown && item.breakdown ? buildClientBreakdown(item.breakdown) : null;

                return (
                  <React.Fragment key={item.id || index}>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>{index + 1}</td>
                      <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '500' }}>{item.name}</div>
                        {item.description && (
                          <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '4px' }}>{item.description}</div>
                        )}
                        {item.room_name && (
                          <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '2px' }}>Room: {item.room_name}</div>
                        )}
                        {item.surface_name && (
                          <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '2px' }}>Surface: {item.surface_name}</div>
                        )}
                      </td>
                      {showImages && (
                        <td style={{ padding: '10px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                          )}
                        </td>
                      )}
                      <td style={{ padding: '10px 8px', textAlign: 'right', verticalAlign: 'top' }}>{item.quantity || 1}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', verticalAlign: 'top' }}>
                        {formatCurrency(item.unit_price || 0, currency)}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', verticalAlign: 'top', fontWeight: '500' }}>
                        {formatCurrency(item.total || 0, currency)}
                      </td>
                    </tr>

                    {/* Detailed Breakdown */}
                    {breakdown && breakdown.length > 0 && (
                      <tr style={{ borderBottom: '1px solid #e2e8f0', pageBreakInside: 'avoid' }}>
                        <td colSpan={showImages ? 6 : 5} style={{ padding: '8px 8px 8px 32px', backgroundColor: '#fafafa' }}>
                          <div style={{ fontSize: '8pt', color: '#64748b' }}>
                            {breakdown.map((detail: any, idx: number) => (
                              <div key={idx} style={{ marginBottom: '2px' }}>
                                • {detail.label}: {formatCurrency(detail.amount, currency)}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div style={{ marginLeft: 'auto', width: '50%', marginBottom: '32px', pageBreakInside: 'avoid' }}>
          <table style={{ width: '100%', fontSize: '10pt' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px', textAlign: 'right', color: '#64748b' }}>Subtotal:</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(subtotal, currency)}</td>
              </tr>
              {taxRate > 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#64748b' }}>
                    Tax ({(taxRate * 100).toFixed(1)}%):
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(taxAmount, currency)}</td>
                </tr>
              )}
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: '12pt' }}>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>TOTAL:</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#3b82f6' }}>{formatCurrency(total, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Conditions */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', pageBreakInside: 'avoid' }}>
          <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '8px' }}>Terms & Conditions</div>
          <div style={{ fontSize: '8pt', color: '#64748b', lineHeight: '1.6' }}>
            <p>• This quote is valid for 30 days from the date of issue.</p>
            <p>• A 50% deposit is required to commence work.</p>
            <p>• Final payment is due upon completion of installation.</p>
            <p>• All measurements must be verified on-site before ordering.</p>
            <p>• Prices are subject to change if specifications are modified.</p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '8pt',
            color: '#94a3b8',
          }}
        >
          Thank you for your business!
        </div>
      </div>
    );
  }
);

SimpleQuoteTemplate.displayName = 'SimpleQuoteTemplate';
