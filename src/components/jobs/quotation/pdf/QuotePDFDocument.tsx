import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { buildClientBreakdown } from '@/utils/quotes/buildClientBreakdown';
import { formatJobNumber } from '@/lib/format-job-number';
import { pdfStyles, colors, typography, spacing } from '@/styles/quoteStyles';

// Register fonts (optional - using default Helvetica for now)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header Styles
  headerCentered: {
    marginBottom: 30,
    textAlign: 'center',
  },
  headerLeftRight: {
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
    marginBottom: 15,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginBottom: 15,
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 10,
    color: '#666',
    marginBottom: 15,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginTop: 20,
    borderTop: '1px solid #e5e7eb',
  },
  clientSection: {
    flex: 1,
  },
  quoteDetailsSection: {
    textAlign: 'right',
  },
  sectionLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    color: '#333',
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textMuted: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  // Products Table
  productsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderBottom: '2px solid #e2e8f0',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #e2e8f0',
  },
  tableCol1: { width: '8%' },
  tableCol2: { width: '50%' },
  tableCol3: { width: '12%' },
  tableCol4: { width: '15%' },
  tableCol5: { width: '15%', textAlign: 'right' },
  // Totals
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
  },
  // Signature
  signatureSection: {
    marginTop: 40,
    paddingTop: 30,
    borderTop: '1px solid #e2e8f0',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderTop: '1px solid #333',
    marginTop: 40,
    paddingTop: 5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
});

interface QuotePDFDocumentProps {
  blocks: any[];
  projectData: any;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
}

export const QuotePDFDocument: React.FC<QuotePDFDocumentProps> = ({ 
  blocks, 
  projectData, 
  showDetailedBreakdown = false,
  showImages = false 
}) => {
  const renderTokenValue = (token: string) => {
    const project = projectData?.project || {};
    const client = project.client || projectData?.client || {};
    const businessSettings = projectData?.businessSettings || {};
    
    const tokens = {
      company_name: businessSettings.company_name || 'Your Company Name',
      company_address: businessSettings.address ? 
        `${businessSettings.address}${businessSettings.city ? ', ' + businessSettings.city : ''}${businessSettings.state ? ', ' + businessSettings.state : ''}` 
        : '123 Business Ave',
      company_phone: businessSettings.business_phone || '(555) 123-4567',
      company_email: businessSettings.business_email || 'info@company.com',
      company_website: businessSettings.website || 'www.company.com',
      
      client_name: client.name || 'Client Name',
      client_email: client.email || '', 
      client_phone: client.phone || '',
      client_address: client.address ? 
        `${client.address}${client.city ? ', ' + client.city : ''}` 
        : '',
      client_company: client.company_name || '',
      
      quote_number: formatJobNumber(project.quote_number || project.job_number) || 'QT-2024-001',
      date: project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      start_date: project.start_date ? new Date(project.start_date).toLocaleDateString() : '',
      due_date: project.due_date ? new Date(project.due_date).toLocaleDateString() : '',
      valid_until: project.due_date ? new Date(project.due_date).toLocaleDateString() : (projectData?.validUntil ? new Date(projectData.validUntil).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()),
      
      currency_symbol: projectData?.currency === 'AUD' ? 'A$' : projectData?.currency === 'NZD' ? 'NZ$' : '$',
      subtotal: projectData?.subtotal ? `${projectData.currency === 'AUD' ? 'A$' : '$'}${projectData.subtotal.toFixed(2)}` : '$0.00',
      tax_amount: projectData?.taxAmount ? `${projectData.currency === 'AUD' ? 'A$' : '$'}${projectData.taxAmount.toFixed(2)}` : '$0.00',
      tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '10%',
      total: projectData?.total ? `${projectData.currency === 'AUD' ? 'A$' : '$'}${projectData.total.toFixed(2)}` : '$0.00',
    };
    return tokens[token as keyof typeof tokens] || '';
  };

  const replaceTokens = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, token) => renderTokenValue(token));
  };

  const renderBlock = (block: any) => {
    const content = block.content || {};
    const style = content.style || {};
    const blockType = (block.type || '').toString().trim().toLowerCase();

    switch (blockType) {
      case 'document-header':
        const headerLayout = content.layout || 'centered';
        const logoUrl = projectData?.businessSettings?.company_logo_url;

        if (headerLayout === 'centered') {
          return (
            <View style={styles.headerCentered} key={block.id}>
              {/* Logo */}
              {content.showLogo !== false && logoUrl && (
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                  <Image 
                    src={logoUrl} 
                    style={{ width: 120, height: 60, objectFit: 'contain' }}
                  />
                </View>
              )}

              {/* Document Title */}
              <Text style={styles.documentTitle}>
                {content.documentTitle || "Your Quote"}
              </Text>

              {/* Tagline */}
              {content.tagline && (
                <Text style={styles.tagline}>{content.tagline}</Text>
              )}

              {/* Metadata Row */}
              <View style={styles.metadataRow}>
                {/* Client Info - Left */}
                <View style={styles.clientSection}>
                  <Text style={styles.sectionLabel}>
                    {content.clientLabel || "SOLD TO"}
                  </Text>
                  <Text style={styles.textBold}>{renderTokenValue('client_name')}</Text>
                  {content.showClientCompany !== false && renderTokenValue('client_company') && (
                    <Text style={styles.textMuted}>{renderTokenValue('client_company')}</Text>
                  )}
                  {content.showClientEmail !== false && renderTokenValue('client_email') && (
                    <Text style={styles.textMuted}>{renderTokenValue('client_email')}</Text>
                  )}
                  {content.showClientPhone !== false && renderTokenValue('client_phone') && (
                    <Text style={styles.textMuted}>{renderTokenValue('client_phone')}</Text>
                  )}
                  {content.showClientAddress !== false && renderTokenValue('client_address') && (
                    <Text style={styles.textMuted}>{renderTokenValue('client_address')}</Text>
                  )}
                </View>

                {/* Quote Details - Right */}
                <View style={styles.quoteDetailsSection}>
                  <Text style={styles.text}>
                    {content.quoteNumberLabel || "Order number"}: <Text style={{ fontWeight: 'bold' }}>{renderTokenValue('quote_number')}</Text>
                  </Text>
                  <Text style={styles.text}>
                    Start Date: {renderTokenValue('start_date') || renderTokenValue('date')}
                  </Text>
                  <Text style={styles.text}>
                    Due Date: {renderTokenValue('due_date') || renderTokenValue('valid_until')}
                  </Text>
                </View>
              </View>
            </View>
          );
        }

        // Add other layout types as needed
        return null;

      case 'products':
        const items = projectData?.items || [];
        const windowSummaries = projectData?.windowSummaries?.windows || [];
        
        console.log('📄 PDF Products Block:', {
          itemsCount: items.length,
          firstItem: items[0],
          showDetailedBreakdown,
          showImages
        });
        
        return (
          <View style={styles.productsSection} key={block.id}>
            <Text style={styles.sectionTitle}>{content.title || 'Quote Items'}</Text>
            
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol1, { fontWeight: 'bold' }]}>#</Text>
                <Text style={[styles.tableCol2, { fontWeight: 'bold' }]}>Description</Text>
                <Text style={[styles.tableCol3, { fontWeight: 'bold' }]}>Qty</Text>
                <Text style={[styles.tableCol5, { fontWeight: 'bold' }]}>Total</Text>
              </View>

              {/* Table Rows */}
              {items.map((item: any, index: number) => {
                // Use breakdown from item if available, or build from windowSummary
                const windowSummary = windowSummaries.find((ws: any) => ws.window_id === item.id);
                const breakdown = item.breakdown || (showDetailedBreakdown && windowSummary?.summary 
                  ? buildClientBreakdown(windowSummary.summary) 
                  : []);
                
                // Get actual price - handle both total and total_price fields
                const itemTotal = item.total || item.total_price || item.unit_price || 0;
                
                return (
                  <View key={index} style={{ marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }} wrap={false}>
                    {/* Main Item Row */}
                    <View style={[styles.tableRow, { borderBottom: 'none', paddingBottom: 4, flexDirection: 'row', alignItems: 'flex-start' }]}>
                      <Text style={styles.tableCol1}>{index + 1}</Text>
                      <View style={[styles.tableCol2, { flexDirection: 'row', gap: 8 }]}>
                        {showImages && item.image_url && (
                          <Image 
                            src={item.image_url} 
                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{item.name || item.product_name || item.description || 'Window Treatment'}</Text>
                          {item.description && item.description !== item.name && (
                            <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{item.description}</Text>
                          )}
                          {item.surface_name && (
                            <Text style={{ fontSize: 8, color: '#999', marginTop: 1 }}>Room: {item.room_name || 'Unassigned'} • {item.surface_name}</Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.tableCol3}>{item.quantity || 1}</Text>
                      <Text style={[styles.tableCol5, { fontWeight: 'bold' }]}>
                        {renderTokenValue('currency_symbol')}{Number(itemTotal).toFixed(2)}
                      </Text>
                    </View>
                    
                    {/* Breakdown Details */}
                    {breakdown && breakdown.length > 0 && (
                      <View style={{ marginLeft: 30, marginTop: 8, paddingLeft: 12, borderLeft: '2px solid #e5e7eb' }}>
                        {breakdown.map((breakdownItem: any, idx: number) => (
                          <View key={idx} style={{ marginBottom: 6, flexDirection: 'row', alignItems: 'flex-start' }}>
                            {showImages && breakdownItem.image_url && (
                              <Image 
                                src={breakdownItem.image_url} 
                                style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4, marginRight: 6 }}
                              />
                            )}
                            <Text style={{ fontSize: 10, marginRight: 6, color: '#6b7280' }}>•</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 1 }}>
                                {breakdownItem.name}
                              </Text>
                              {breakdownItem.description && (
                                <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 1 }}>
                                  {breakdownItem.description}
                                </Text>
                              )}
                              {breakdownItem.quantity && breakdownItem.unit && (
                                <Text style={{ fontSize: 8, color: '#9ca3af' }}>
                                  {typeof breakdownItem.quantity === 'number' ? breakdownItem.quantity.toFixed(2) : breakdownItem.quantity} {breakdownItem.unit} × {renderTokenValue('currency_symbol')}{(breakdownItem.unit_price || 0).toFixed(2)} = {renderTokenValue('currency_symbol')}{(breakdownItem.total_cost || 0).toFixed(2)}
                                </Text>
                              )}
                              {!breakdownItem.quantity && breakdownItem.total_cost > 0 && (
                                <Text style={{ fontSize: 8, color: '#9ca3af' }}>
                                  {renderTokenValue('currency_symbol')}{(breakdownItem.total_cost || 0).toFixed(2)}
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );

      case 'totals':
        return (
          <View style={styles.totalsSection} key={block.id}>
            {content.showSubtotal !== false && (
              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
                <Text>{renderTokenValue('subtotal')}</Text>
              </View>
            )}
            {content.showTax !== false && (
              <View style={styles.totalRow}>
                <Text>Tax ({renderTokenValue('tax_rate')}):</Text>
                <Text>{renderTokenValue('tax_amount')}</Text>
              </View>
            )}
            {content.showTotal !== false && (
              <View style={styles.totalRowFinal}>
                <Text>Total:</Text>
                <Text>{renderTokenValue('total')}</Text>
              </View>
            )}
          </View>
        );

      case 'signature':
        return (
          <View style={styles.signatureSection} key={block.id}>
            <Text style={styles.sectionTitle}>Authorization</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine}>
                  <Text style={{ fontSize: 9, color: '#666' }}>
                    {content.signatureLabel || 'Authorized Signature'}
                  </Text>
                </View>
              </View>
              {content.showDate !== false && (
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine}>
                    <Text style={{ fontSize: 9, color: '#666' }}>
                      {content.dateLabel || 'Date'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        );

      case 'text':
      case 'intro-text':
        return (
          <View style={{ marginVertical: 10 }} key={block.id} wrap={false}>
            <Text style={{ fontSize: content.fontSize || 10, lineHeight: 1.5 }}>
              {replaceTokens(content.text || '')}
            </Text>
          </View>
        );

      case 'client-info':
        return (
          <View style={{ marginVertical: 15, padding: 12, backgroundColor: '#f8fafc', borderRadius: 4 }} key={block.id} wrap={false}>
            <Text style={styles.sectionLabel}>
              {content.label || 'CLIENT INFORMATION'}
            </Text>
            <View style={{ marginTop: 8, gap: 4 }}>
              <Text style={styles.textBold}>{renderTokenValue('client_name')}</Text>
              {content.showCompany !== false && renderTokenValue('client_company') && (
                <Text style={styles.textMuted}>{renderTokenValue('client_company')}</Text>
              )}
              {content.showEmail !== false && renderTokenValue('client_email') && (
                <Text style={styles.textMuted}>{renderTokenValue('client_email')}</Text>
              )}
              {content.showPhone !== false && renderTokenValue('client_phone') && (
                <Text style={styles.textMuted}>{renderTokenValue('client_phone')}</Text>
              )}
              {content.showAddress !== false && renderTokenValue('client_address') && (
                <Text style={styles.textMuted}>{renderTokenValue('client_address')}</Text>
              )}
            </View>
          </View>
        );

      case 'image':
        if (!content.imageUrl && !content.url) return null;
        return (
          <View style={{ marginVertical: 15, alignItems: content.alignment || 'center' }} key={block.id}>
            <Image 
              src={content.imageUrl || content.url} 
              style={{ 
                maxWidth: content.width || '100%',
                maxHeight: content.height || 300,
                objectFit: 'contain'
              }}
            />
            {content.caption && (
              <Text style={{ fontSize: 8, color: '#666', marginTop: 4, textAlign: 'center' }}>
                {content.caption}
              </Text>
            )}
          </View>
        );

      case 'spacer':
        return (
          <View 
            key={block.id} 
            style={{ height: content.height || spacing.md }} 
          />
        );

      case 'divider':
        return (
          <View 
            key={block.id}
            style={{
              borderBottom: `${content.thickness || 1}px solid ${content.color || colors.border}`,
              marginVertical: spacing.md,
            }}
          />
        );

      case 'payment':
        return (
          <View style={{ marginVertical: 15, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, borderLeft: '3px solid #10b981' }} key={block.id} wrap={false}>
            <Text style={[styles.sectionTitle, { borderBottom: 'none' }]}>
              {content.title || 'Payment Information'}
            </Text>
            <View style={{ marginTop: 8, gap: 6 }}>
              {content.bankName && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', width: 100 }}>Bank:</Text>
                  <Text style={{ fontSize: 9 }}>{content.bankName}</Text>
                </View>
              )}
              {content.accountName && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', width: 100 }}>Account Name:</Text>
                  <Text style={{ fontSize: 9 }}>{content.accountName}</Text>
                </View>
              )}
              {content.accountNumber && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', width: 100 }}>Account:</Text>
                  <Text style={{ fontSize: 9 }}>{content.accountNumber}</Text>
                </View>
              )}
              {content.bsb && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 9, fontWeight: 'bold', width: 100 }}>BSB:</Text>
                  <Text style={{ fontSize: 9 }}>{content.bsb}</Text>
                </View>
              )}
              {content.paymentTerms && (
                <Text style={{ fontSize: 8, color: '#666', marginTop: 4 }}>
                  {content.paymentTerms}
                </Text>
              )}
            </View>
          </View>
        );

      case 'terms':
        return (
          <View style={{ marginVertical: 15 }} key={block.id}>
            <Text style={styles.sectionTitle}>
              {content.title || 'Terms & Conditions'}
            </Text>
            <Text style={{ fontSize: 9, lineHeight: 1.4, marginTop: 8 }}>
              {replaceTokens(content.text || content.termsText || '')}
            </Text>
          </View>
        );

      case 'footer':
        // This is for footer content blocks (not the page footer)
        return (
          <View style={{ marginTop: 30, paddingTop: 15, borderTop: `1px solid ${colors.border}`, textAlign: 'center' }} key={block.id}>
            <Text style={{ fontSize: 8, color: colors.textMuted }}>
              {replaceTokens(content.text || '')}
            </Text>
          </View>
        );

      default:
        console.warn('Unknown block type in PDF:', blockType);
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {blocks.map(block => renderBlock(block))}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>{renderTokenValue('company_name')} • {renderTokenValue('company_phone')} • {renderTokenValue('company_email')}</Text>
        </View>
      </Page>
    </Document>
  );
};
