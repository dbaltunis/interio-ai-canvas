import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Hash, 
  Calendar,
  User,
  Info,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { getDocumentTypeConfig, type DocumentTypeConfig } from '@/utils/documentTypeConfig';
import { getRegistrationLabels } from '@/utils/businessRegistrationLabels';

interface BlockRendererProps {
  block: any;
  projectData?: any;
  userTimezone?: string;
  userDateFormat?: string;
  isPrintMode?: boolean;
  isEditable?: boolean;
  documentType?: string;
  renderEditableText?: (props: {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
  }) => React.ReactNode;
  onContentChange?: (updates: any) => void;
}

// Centralized token resolver used by both canvas and app
export const resolveToken = (
  token: string,
  projectData: any,
  businessSettings: any,
  userTimezone: string = 'UTC',
  userDateFormat: string = 'M/d/yyyy'
) => {
  const project = projectData?.project || {};
  const client = project.client || projectData?.client || {};
  
  const getDefaultCurrency = () => businessSettings?.currency || projectData?.currency || 'USD';
  
  // Helper to format bank details based on country
  const formatBankDetails = () => {
    if (!businessSettings) return '';
    const country = businessSettings.country || 'Australia';
    const parts: string[] = [];
    
    if (businessSettings.bank_name) parts.push(`Bank: ${businessSettings.bank_name}`);
    if (businessSettings.bank_account_name) parts.push(`Account Name: ${businessSettings.bank_account_name}`);
    
    // Country-specific formatting
    if (country === 'Australia' && businessSettings.bank_bsb) {
      parts.push(`BSB: ${businessSettings.bank_bsb}`);
      if (businessSettings.bank_account_number) parts.push(`Account: ${businessSettings.bank_account_number}`);
    } else if (country === 'United Kingdom' && businessSettings.bank_sort_code) {
      parts.push(`Sort Code: ${businessSettings.bank_sort_code}`);
      if (businessSettings.bank_account_number) parts.push(`Account: ${businessSettings.bank_account_number}`);
    } else if ((country === 'United States' || country === 'Canada') && businessSettings.bank_routing_number) {
      parts.push(`Routing: ${businessSettings.bank_routing_number}`);
      if (businessSettings.bank_account_number) parts.push(`Account: ${businessSettings.bank_account_number}`);
    } else if (businessSettings.bank_iban) {
      parts.push(`IBAN: ${businessSettings.bank_iban}`);
      if (businessSettings.bank_swift_bic) parts.push(`BIC/SWIFT: ${businessSettings.bank_swift_bic}`);
    } else if (businessSettings.bank_account_number) {
      parts.push(`Account: ${businessSettings.bank_account_number}`);
    }
    
    return parts.join(' | ');
  };

  // Helper to format registration footer with country-aware labels
  const formatRegistrationFooter = () => {
    if (!businessSettings) return '';
    const country = businessSettings.country || 'Australia';
    const parts: string[] = [];
    
    // Get country-specific labels
    const labels = getRegistrationLabels(country);
    
    // Only show ABN for Australia (the only country that uses ABN)
    if (country === 'Australia' && businessSettings.abn) {
      parts.push(`ABN: ${businessSettings.abn}`);
    }
    
    // Registration number with country-specific label
    if (businessSettings.registration_number) {
      parts.push(`${labels.registrationLabel}: ${businessSettings.registration_number}`);
    }
    
    // Tax number with country-specific label
    if (businessSettings.tax_number) {
      parts.push(`${labels.taxLabel}: ${businessSettings.tax_number}`);
    }
    
    return parts.join(' | ');
  };
  
  // Helper to format late payment terms
  const formatLatePaymentTerms = () => {
    if (!businessSettings) return '';
    const parts: string[] = [];
    
    if (businessSettings.late_payment_interest_rate && businessSettings.late_payment_interest_rate > 0) {
      parts.push(`Interest of ${businessSettings.late_payment_interest_rate}% per month will be charged on overdue amounts.`);
    }
    
    if (businessSettings.late_payment_fee_amount && businessSettings.late_payment_fee_amount > 0) {
      const currency = businessSettings.currency || projectData?.currency || 'AUD';
      parts.push(`A late payment fee of ${formatCurrency(businessSettings.late_payment_fee_amount, currency)} may apply.`);
    }
    
    if (businessSettings.late_payment_terms) {
      parts.push(businessSettings.late_payment_terms);
    }
    
    return parts.join(' ');
  };

  // Helper to calculate balance due
  const calculateBalanceDue = () => {
    const total = projectData?.total || 0;
    const amountPaid = project.amount_paid || projectData?.amountPaid || 0;
    return total - amountPaid;
  };

  // Helper to determine if invoice is overdue
  const isInvoiceOverdue = () => {
    if (!project.due_date) return false;
    const dueDate = new Date(project.due_date);
    const today = new Date();
    const paymentStatus = project.payment_status || 'unpaid';
    return today > dueDate && paymentStatus !== 'paid';
  };

  // Helper to get effective payment status
  const getEffectivePaymentStatus = () => {
    const status = project.payment_status || 'unpaid';
    if (status === 'unpaid' && isInvoiceOverdue()) return 'overdue';
    return status;
  };

  const tokens: Record<string, any> = {
    // Company information - no hardcoded fallbacks, show empty if not configured
    company_name: businessSettings?.company_name || '',
    company_legal_name: businessSettings?.legal_name || '',
    company_trading_name: businessSettings?.trading_name || businessSettings?.company_name || '',
    company_address: businessSettings?.address ? 
      `${businessSettings.address}${businessSettings.city ? ', ' + businessSettings.city : ''}${businessSettings.state ? ', ' + businessSettings.state : ''}${businessSettings.zip_code ? ' ' + businessSettings.zip_code : ''}` 
      : '',
    company_phone: businessSettings?.business_phone || '',
    company_email: businessSettings?.business_email || '',
    company_website: businessSettings?.website || '',
    company_abn: businessSettings?.abn || '',
    company_registration_number: businessSettings?.registration_number || '',
    company_tax_number: businessSettings?.tax_number || '',
    company_organization_type: businessSettings?.organization_type || '',
    company_country: businessSettings?.country || '',
    // Bank details tokens
    company_bank_name: businessSettings?.bank_name || '',
    company_bank_account_name: businessSettings?.bank_account_name || '',
    company_bank_details: formatBankDetails(),
    company_registration_footer: formatRegistrationFooter(),
    // Late payment terms
    late_payment_terms: formatLatePaymentTerms(),
    
    // Client information
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
    quote_number: project.job_number || project.quote_number || 'QT-2024-001',
    job_number: project.job_number || project.quote_number || 'JOB-2024-001',
    project_name: project.name || 'Project',
    
    // Invoice-specific fields
    supply_date: project.supply_date 
      ? formatInTimeZone(new Date(project.supply_date), userTimezone, userDateFormat)
      : '',
    po_number: project.po_number || '',
    payment_reference: project.payment_reference || 
      `${businessSettings?.payment_reference_prefix || 'INV'}-${project.job_number || project.quote_number || 'REF'}`,
    payment_status: getEffectivePaymentStatus(),
    amount_paid: formatCurrency(project.amount_paid || projectData?.amountPaid || 0, getDefaultCurrency()),
    balance_due: formatCurrency(calculateBalanceDue(), getDefaultCurrency()),
    
    // Dates
    date: project.start_date 
      ? formatInTimeZone(new Date(project.start_date), userTimezone, userDateFormat)
      : (project.created_at 
        ? formatInTimeZone(new Date(project.created_at), userTimezone, userDateFormat)
        : formatInTimeZone(new Date(), userTimezone, userDateFormat)),
    start_date: project.start_date 
      ? formatInTimeZone(new Date(project.start_date), userTimezone, userDateFormat)
      : '',
    due_date: project.due_date 
      ? formatInTimeZone(new Date(project.due_date), userTimezone, userDateFormat)
      : '',
    valid_until: project.due_date 
      ? formatInTimeZone(new Date(project.due_date), userTimezone, userDateFormat)
      : formatInTimeZone(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), userTimezone, userDateFormat),
    
    // Financial
    currency: getDefaultCurrency(),
    subtotal: formatCurrency(projectData?.subtotal || 0, getDefaultCurrency()),
    tax_amount: formatCurrency(projectData?.taxAmount || 0, getDefaultCurrency()),
    tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '10%',
    total: formatCurrency(projectData?.total || 0, getDefaultCurrency()),
  };
  
  return tokens[token] !== undefined ? tokens[token] : '';
};

// ============= DOCUMENT HEADER BLOCK =============
export const DocumentHeaderBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy',
  isPrintMode = false,
  isEditable = false,
  documentType = 'quote',
  renderEditableText,
  onContentChange
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  const headerLayout = content.layout || 'centered';
  
  // Get document type configuration
  const docConfig = getDocumentTypeConfig(documentType);
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);
  
  const updateContent = (updates: any) => {
    if (onContentChange) onContentChange(updates);
  };

  // Render text - editable or static
  const renderText = (value: string, onChange: (v: string) => void, className?: string, placeholder?: string, multiline?: boolean) => {
    if (isEditable && renderEditableText) {
      return renderEditableText({ value, onChange, className, placeholder, multiline });
    }
    return <span className={className}>{value || placeholder}</span>;
  };

  return (
    <div 
      className="mb-8" 
      style={{ 
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: '24px 20px',
        margin: '0 0 24px 0'
      }}
    >
      {headerLayout === 'centered' && (
        <div className="text-center space-y-4">
          {/* Logo - Centered */}
          {content.showLogo !== false && (
            <div className="flex justify-center mb-4">
              {businessSettings?.company_logo_url ? (
                <img 
                  src={businessSettings.company_logo_url} 
                  alt="Company Logo" 
                  className="object-contain"
                  style={{ 
                    height: content.logoSize || '70px',
                    maxWidth: '280px'
                  }}
                />
              ) : (
                <div 
                  style={{ 
                    height: content.logoSize || '70px',
                    width: content.logoSize || '70px',
                    backgroundColor: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Building2 className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Company Details - Below Logo */}
          <div className="text-sm text-gray-600 space-y-0.5">
            <div style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
              {isEditable ? renderText(
                content.companyName || getToken('company_name'),
                (v) => updateContent({ companyName: v }),
                'font-semibold',
                'Company Name'
              ) : (content.companyName || getToken('company_name'))}
            </div>
            <div>{getToken('company_address')}</div>
            <div>{getToken('company_phone')}</div>
            <div>{getToken('company_email')}</div>
          </div>

          {/* Document Title - Dynamic based on document type */}
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', letterSpacing: '-0.025em', marginTop: '16px' }}>
            {isEditable ? renderText(
              // Use doc type title if saved title is from a different type (legacy fix)
              (() => {
                const savedTitle = content.documentTitle;
                const docTypeTitle = docConfig.documentTitle;
                const legacyTitles = ['Quote', 'Invoice', 'Proposal', 'Estimate', 'Work Order', 'Measurement', 'Brochure', 'Portfolio'];
                const isLegacyMismatch = savedTitle && legacyTitles.includes(savedTitle) && savedTitle !== docTypeTitle;
                return isLegacyMismatch ? docTypeTitle : (savedTitle || docTypeTitle);
              })(),
              (v) => updateContent({ documentTitle: v }),
              'text-3xl font-bold',
              'Document Title'
            ) : (() => {
              const savedTitle = content.documentTitle;
              const docTypeTitle = docConfig.documentTitle;
              const legacyTitles = ['Quote', 'Invoice', 'Proposal', 'Estimate', 'Work Order', 'Measurement', 'Brochure', 'Portfolio'];
              const isLegacyMismatch = savedTitle && legacyTitles.includes(savedTitle) && savedTitle !== docTypeTitle;
              return isLegacyMismatch ? docTypeTitle : (savedTitle || docTypeTitle);
            })()}
          </h1>

          {/* Tagline */}
          {content.tagline && (
            <p style={{ fontSize: '14px', color: '#374151', maxWidth: '600px', margin: '8px auto 0' }}>
              {content.tagline}
            </p>
          )}

          {/* Metadata Row: Client on Left, Quote Details on Right */}
          <div className="flex items-start justify-between pt-5 mt-5" style={{ borderTop: isPrintMode ? 'none' : '2px solid #e5e7eb' }}>
            {/* Client Info - Left */}
            <div className="text-left">
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isEditable ? renderText(
                  content.clientLabel || 'Sold to',
                  (v) => updateContent({ clientLabel: v }),
                  'text-xs font-semibold uppercase',
                  'Client Label'
                ) : (content.clientLabel || 'Sold to')}
              </div>
              <div className="text-sm space-y-1">
                <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
                  {getToken('client_name') || 'Client Name'}
                </div>
                {content.showClientCompany !== false && getToken('client_company') && (
                  <div style={{ color: '#374151', fontSize: '14px' }}>{getToken('client_company')}</div>
                )}
                {content.showClientEmail !== false && getToken('client_email') && (
                  <div style={{ color: '#374151', fontSize: '14px' }}>{getToken('client_email')}</div>
                )}
                {content.showClientPhone !== false && getToken('client_phone') && (
                  <div style={{ color: '#374151', fontSize: '14px' }}>{getToken('client_phone')}</div>
                )}
                {content.showClientAddress !== false && getToken('client_address') && (
                  <div style={{ color: '#374151', fontSize: '14px' }}>{getToken('client_address')}</div>
                )}
              </div>
            </div>

            {/* Document Details - Right (Dynamic labels based on document type) */}
            <div className="text-right">
              <div className="text-sm space-y-1">
                {docConfig.numberLabel && (
                  <div>
                    <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>
                      {content.quoteNumberLabel || docConfig.numberLabel}{' '}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
                      {getToken('job_number')}
                    </span>
                  </div>
                )}
                <div>
                  <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>
                    {docConfig.primaryDateLabel}: </span>
                  <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14px' }}>
                    {getToken('date')}
                  </span>
                </div>
                {docConfig.secondaryDateLabel && (
                  <div>
                    <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>
                      {docConfig.secondaryDateLabel}: </span>
                    <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14px' }}>
                      {getToken(docConfig.secondaryDateToken || 'valid_until')}
                    </span>
                  </div>
                )}
                {/* Payment Status Badge for Invoices */}
                {docConfig.showPaymentStatus && (
                  <div className="mt-2">
                    <span 
                      style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: projectData?.paymentStatus === 'paid' ? '#dcfce7' : 
                                        projectData?.paymentStatus === 'overdue' ? '#fef2f2' : '#fef3c7',
                        color: projectData?.paymentStatus === 'paid' ? '#166534' : 
                               projectData?.paymentStatus === 'overdue' ? '#991b1b' : '#92400e'
                      }}
                    >
                      {projectData?.paymentStatus === 'paid' ? 'PAID' : 
                       projectData?.paymentStatus === 'overdue' ? 'OVERDUE' : 'UNPAID'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {headerLayout === 'left-right' && (
        <div className="flex items-start justify-between">
          {/* Left: Logo & Company */}
          <div className="flex-1">
            {content.showLogo !== false && (
              <div className="mb-4">
                {businessSettings?.company_logo_url ? (
                  <img 
                    src={businessSettings.company_logo_url} 
                    alt="Company Logo" 
                    className="object-contain"
                    style={{ height: content.logoSize || '60px', maxWidth: '200px' }}
                  />
                ) : (
                  <div 
                    style={{ 
                      height: content.logoSize || '60px',
                      width: content.logoSize || '60px',
                      backgroundColor: '#2563eb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            )}
            <div className="text-xl font-bold mb-2">
              {content.companyName || getToken('company_name')}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{getToken('company_address')}</div>
              <div>{getToken('company_phone')}</div>
              <div>{getToken('company_email')}</div>
            </div>
          </div>

          {/* Right: Document Info */}
          <div className="text-right">
            <h1 className="text-2xl font-semibold mb-4">
              {(() => {
                const savedTitle = content.documentTitle;
                const docTypeTitle = docConfig.documentTitle;
                const legacyTitles = ['Quote', 'Invoice', 'Proposal', 'Estimate', 'Work Order'];
                const isLegacyMismatch = savedTitle && legacyTitles.includes(savedTitle) && savedTitle !== docTypeTitle;
                return isLegacyMismatch ? docTypeTitle : (savedTitle || docTypeTitle);
              })()}
            </h1>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Hash className="h-3 w-3" />
                <span>{content.quoteNumberLabel || docConfig.numberLabel}: {getToken('job_number')}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Calendar className="h-3 w-3" />
                <span>{docConfig.primaryDateLabel}: {getToken('date')}</span>
              </div>
              {docConfig.secondaryDateLabel && (
                <div className="flex items-center gap-2 justify-end">
                  <Calendar className="h-3 w-3" />
                  <span>{docConfig.secondaryDateLabel}: {getToken(docConfig.secondaryDateToken || 'valid_until')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {headerLayout === 'stacked' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {content.showLogo !== false && (
              <div>
                {businessSettings?.company_logo_url ? (
                  <img 
                    src={businessSettings.company_logo_url} 
                    alt="Company Logo" 
                    className="object-contain"
                    style={{ height: content.logoSize || '60px', maxWidth: '200px' }}
                  />
                ) : (
                  <div 
                    style={{ 
                      height: content.logoSize || '60px',
                      width: content.logoSize || '60px',
                      backgroundColor: '#2563eb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            )}
            <h1 className="text-3xl font-bold">
              {(() => {
                const savedTitle = content.documentTitle;
                const docTypeTitle = docConfig.documentTitle;
                const legacyTitles = ['Quote', 'Invoice', 'Proposal', 'Estimate', 'Work Order'];
                const isLegacyMismatch = savedTitle && legacyTitles.includes(savedTitle) && savedTitle !== docTypeTitle;
                return isLegacyMismatch ? docTypeTitle : (savedTitle || docTypeTitle);
              })()}
            </h1>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-4 border-t">
            {/* Company Info */}
            <div>
              <h4 className="font-semibold mb-2">From:</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <div className="font-medium text-gray-900">{getToken('company_name')}</div>
                <div>{getToken('company_address')}</div>
                <div>{getToken('company_phone')}</div>
              </div>
            </div>
            
            {/* Client & Quote Info */}
            <div>
              <h4 className="font-semibold mb-2">{content.clientLabel || 'To:'}</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <div className="font-medium text-gray-900">{getToken('client_name') || 'Client Name'}</div>
                <div>{getToken('client_email')}</div>
                {getToken('client_phone') && <div>{getToken('client_phone')}</div>}
              </div>
              <div className="mt-3 pt-3 border-t text-sm">
                <div><strong>{docConfig.numberLabel}:</strong> {getToken('job_number')}</div>
                <div><strong>{docConfig.primaryDateLabel}:</strong> {getToken('date')}</div>
                {docConfig.secondaryDateLabel && (
                  <div><strong>{docConfig.secondaryDateLabel}:</strong> {getToken(docConfig.secondaryDateToken || 'valid_until')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============= LINE ITEMS / PRODUCTS BLOCK =============
export const LineItemsBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  isPrintMode = false,
  isEditable = false,
  renderEditableText,
  onContentChange
}) => {
  const content = block.content || {};
  const items = projectData?.items || content.items || [
    { description: 'Custom Drapery Installation', quantity: 1, unit_price: 1250, total: 1250 }
  ];
  const businessSettings = projectData?.businessSettings || {};
  const currency = businessSettings?.currency || projectData?.currency || 'USD';

  return (
    <div className="mb-6">
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
        {content.title || 'Line Items'}
      </h3>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                Description
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#374151', borderBottom: '1px solid #e5e7eb', width: '80px' }}>
                Qty
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '14px', color: '#374151', borderBottom: '1px solid #e5e7eb', width: '120px' }}>
                Unit Price
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', fontSize: '14px', color: '#374151', borderBottom: '1px solid #e5e7eb', width: '120px' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} style={{ borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                  {item.description || item.name || 'Item'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                  {item.quantity || 1}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                  {formatCurrency(item.unit_price || item.unitPrice || 0, currency)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                  {formatCurrency(item.total || item.lineTotal || 0, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============= TOTALS BLOCK =============
export const TotalsBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  const currency = businessSettings?.currency || projectData?.currency || 'USD';
  
  const subtotal = projectData?.subtotal || 0;
  const taxRate = projectData?.taxRate || 0.1;
  const taxAmount = projectData?.taxAmount || (subtotal * taxRate);
  const total = projectData?.total || (subtotal + taxAmount);

  return (
    <div className="flex justify-end mb-6">
      <div style={{ minWidth: '280px' }}>
        {content.showSubtotal !== false && (
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#374151', fontSize: '14px' }}>Subtotal:</span>
            <span style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>
              {formatCurrency(subtotal, currency)}
            </span>
          </div>
        )}
        {content.showTax !== false && (
          <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <span style={{ color: '#374151', fontSize: '14px' }}>
              Tax ({(taxRate * 100).toFixed(1)}%):
            </span>
            <span style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>
              {formatCurrency(taxAmount, currency)}
            </span>
          </div>
        )}
        <div className="flex justify-between py-3" style={{ backgroundColor: '#f9fafb', marginTop: '8px', padding: '12px', borderRadius: '6px' }}>
          <span style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>Total:</span>
          <span style={{ fontWeight: '700', color: '#111827', fontSize: '18px' }}>
            {formatCurrency(total, currency)}
          </span>
        </div>

        {/* Deposit Payment Summary */}
        {projectData?.payment?.type === 'deposit' && projectData.payment.amount > 0 && (
          <div className="py-2 border-t mt-2" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex justify-between py-1">
              <span style={{ color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                Deposit ({projectData.payment.percentage || 50}%):
              </span>
              <span style={{ fontWeight: '600', color: '#2563eb', fontSize: '14px' }}>
                {formatCurrency(projectData.payment.amount, currency)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span style={{ color: '#6b7280', fontSize: '13px' }}>Balance Due:</span>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>
                {formatCurrency(total - projectData.payment.amount, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============= CLIENT INFO BLOCK =============
export const ClientInfoBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);

  return (
    <div className="mb-6">
      <div className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
        {content.label || 'Bill To'}
      </div>
      <div className="text-sm space-y-1">
        <div className="font-bold text-gray-900">{getToken('client_name') || 'Client Name'}</div>
        {content.showCompany !== false && getToken('client_company') && (
          <div className="text-gray-700">{getToken('client_company')}</div>
        )}
        {content.showEmail !== false && getToken('client_email') && (
          <div className="text-gray-700">{getToken('client_email')}</div>
        )}
        {content.showPhone !== false && getToken('client_phone') && (
          <div className="text-gray-700">{getToken('client_phone')}</div>
        )}
        {content.showAddress !== false && getToken('client_address') && (
          <div className="text-gray-700">{getToken('client_address')}</div>
        )}
      </div>
    </div>
  );
};

// ============= TERMS AND CONDITIONS BLOCK =============
export const TermsConditionsBlock: React.FC<BlockRendererProps> = ({
  block
}) => {
  const content = block.content || {};
  const style = block.style || {};

  // Support both new array format and legacy term1-4 format
  const getTermsToRender = (): string[] => {
    if (content.terms && Array.isArray(content.terms)) {
      return content.terms;
    }
    // Legacy format
    const legacyTerms: string[] = [];
    if (content.term1) legacyTerms.push(content.term1);
    if (content.term2) legacyTerms.push(content.term2);
    if (content.term3) legacyTerms.push(content.term3);
    if (content.term4) legacyTerms.push(content.term4);
    return legacyTerms;
  };

  const termsToRender = getTermsToRender();

  return (
    <div 
      className="mb-6 rounded-lg"
      style={{
        padding: style.padding || '16px',
        backgroundColor: style.backgroundColor || 'transparent'
      }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {content.title || 'Terms & Conditions'}
      </h3>
      <div className="text-sm text-gray-600 space-y-3">
        {termsToRender.length > 0 ? (
          termsToRender.map((term, index) => (
            <p key={index}>{term}</p>
          ))
        ) : (
          <>
            <p>1. Payment Terms: 50% deposit required upon acceptance. Remaining balance due upon completion.</p>
            <p>2. Timeline: Project completion estimated at 2-3 weeks from deposit receipt.</p>
            <p>3. Warranty: All work comes with a 1-year warranty against defects in workmanship.</p>
            <p>4. Cancellation: This quote is valid for 30 days.</p>
          </>
        )}
      </div>
    </div>
  );
};

// ============= INVOICE STATUS BLOCK (Shows payment status, amount paid, balance due) =============
export const InvoiceStatusBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  const style = block.style || {};
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);
  
  const paymentStatus = getToken('payment_status');
  const amountPaid = getToken('amount_paid');
  const balanceDue = getToken('balance_due');
  const total = getToken('total');
  
  // Determine status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'partial': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'overdue': return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
      default: return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
    }
  };
  
  const statusColors = getStatusColor(paymentStatus);
  
  return (
    <div 
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: style.backgroundColor || statusColors.bg,
        borderColor: style.borderColor || statusColors.border
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {paymentStatus === 'paid' ? (
            <CheckCircle2 className="h-6 w-6" style={{ color: statusColors.text }} />
          ) : paymentStatus === 'overdue' ? (
            <AlertCircle className="h-6 w-6" style={{ color: statusColors.text }} />
          ) : (
            <Clock className="h-6 w-6" style={{ color: statusColors.text }} />
          )}
          <div>
            <span 
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: statusColors.border,
                color: statusColors.text
              }}
            >
              {paymentStatus === 'paid' ? 'PAID' : 
               paymentStatus === 'partial' ? 'PARTIALLY PAID' :
               paymentStatus === 'overdue' ? 'OVERDUE' : 'UNPAID'}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <span>Total: </span>
            <span className="font-medium">{total}</span>
          </div>
          {paymentStatus !== 'unpaid' && (
            <div className="text-sm text-gray-600">
              <span>Amount Paid: </span>
              <span className="font-medium text-green-700">{amountPaid}</span>
            </div>
          )}
          {paymentStatus !== 'paid' && (
            <div className="text-base font-bold mt-1" style={{ color: statusColors.text }}>
              <span>Balance Due: </span>
              <span>{balanceDue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============= LATE PAYMENT TERMS BLOCK (Invoice-specific) =============
export const LatePaymentTermsBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);
  
  const latePaymentTerms = getToken('late_payment_terms');
  
  if (!latePaymentTerms) {
    return null;
  }

  const style = block.style || {};
  
  return (
    <div 
      className="mb-6 p-3 rounded border"
      style={{
        backgroundColor: style.backgroundColor || '#fffbeb',
        borderColor: style.borderColor || '#fef3c7'
      }}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-800">
          <span className="font-medium">Late Payment Policy: </span>
          <span>{latePaymentTerms}</span>
        </div>
      </div>
    </div>
  );
};

// ============= TAX BREAKDOWN BLOCK (Invoice-specific) =============
export const TaxBreakdownBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData
}) => {
  const businessSettings = projectData?.businessSettings || {};
  const style = block.style || {};
  
  const taxType = (businessSettings.tax_type || 'GST').toUpperCase();
  const taxRate = businessSettings.tax_rate || 10;
  const currency = projectData?.currency || businessSettings?.currency || 'AUD';
  
  const subtotal = projectData?.subtotal || 0;
  const taxAmount = projectData?.taxAmount || (subtotal * taxRate / 100);
  const total = projectData?.total || (subtotal + taxAmount);
  
  return (
    <div 
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: style.backgroundColor || '#f9fafb',
        borderColor: style.borderColor || '#e5e7eb'
      }}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{taxType} Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal (excl. {taxType})</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{taxType} @ {taxRate}%</span>
          <span className="font-medium text-gray-900">{formatCurrency(taxAmount, currency)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t border-gray-300 pt-2 mt-2">
          <span className="text-gray-800">Total (incl. {taxType})</span>
          <span className="text-gray-900">{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  );
};

// ============= PAYMENT DETAILS BLOCK (Invoice-specific) =============
export const PaymentDetailsBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);
  
  const bankDetails = getToken('company_bank_details');
  const paymentReference = getToken('payment_reference');
  
  if (!bankDetails) {
    return (
      <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-500 text-center">
          Bank details not configured. Go to Settings → Business to add your payment details.
        </p>
      </div>
    );
  }

  const style = block.style || {};
  
  return (
    <div 
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: style.backgroundColor || '#eff6ff',
        borderColor: style.borderColor || '#dbeafe'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Banknote className="h-5 w-5 text-blue-600" />
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af' }}>
          {content.title || 'Payment Details'}
        </h3>
      </div>
      <div className="text-sm text-gray-700 space-y-2">
        <p style={{ whiteSpace: 'pre-wrap' }}>{bankDetails}</p>
        {paymentReference && (
          <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-200">
            <span className="text-xs text-blue-600 font-medium">Payment Reference: </span>
            <span className="text-sm font-bold text-blue-800">{paymentReference}</span>
          </div>
        )}
        {content.paymentInstructions && (
          <p className="mt-2 text-gray-600">{content.paymentInstructions}</p>
        )}
        {businessSettings.default_payment_terms_days && (
          <p className="mt-2 font-medium text-blue-700">
            Payment Terms: Net {businessSettings.default_payment_terms_days} days
          </p>
        )}
      </div>
    </div>
  );
};

// ============= REGISTRATION FOOTER BLOCK (Invoice-specific) =============
export const RegistrationFooterBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);
  
  const registrationFooter = getToken('company_registration_footer');
  
  if (!registrationFooter) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="text-center text-xs text-gray-500">
        {registrationFooter}
      </div>
    </div>
  );
};

// ============= INSTALLATION DETAILS BLOCK (Work Order-specific) =============
export const InstallationDetailsBlock: React.FC<BlockRendererProps> = ({
  block,
  projectData,
  userTimezone = 'UTC',
  userDateFormat = 'M/d/yyyy'
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  
  const getToken = (token: string) => resolveToken(token, projectData, businessSettings, userTimezone, userDateFormat);

  const style = block.style || {};
  
  return (
    <div 
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: style.backgroundColor || '#fffbeb',
        borderColor: style.borderColor || '#fef3c7'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-amber-600" />
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
          {content.title || 'Installation Details'}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Installation Date:</span>
          <div className="font-medium text-gray-900">{getToken('due_date') || 'TBD'}</div>
        </div>
        <div>
          <span className="text-gray-500">Installer:</span>
          <div className="font-medium text-gray-900">{content.installerName || projectData?.installer?.name || 'TBD'}</div>
        </div>
        <div>
          <span className="text-gray-500">Site Contact:</span>
          <div className="font-medium text-gray-900">{getToken('client_name')}</div>
        </div>
        <div>
          <span className="text-gray-500">Contact Phone:</span>
          <div className="font-medium text-gray-900">{getToken('client_phone') || 'N/A'}</div>
        </div>
      </div>
      {content.accessInstructions && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <span className="text-gray-500 text-sm">Access Instructions:</span>
          <p className="text-sm text-gray-900">{content.accessInstructions}</p>
        </div>
      )}
    </div>
  );
};

// ============= INSTALLER SIGNOFF BLOCK (Work Order-specific) =============
export const InstallerSignoffBlock: React.FC<BlockRendererProps> = ({
  block,
  isPrintMode = false
}) => {
  const content = block.content || {};
  const style = block.style || {};

  return (
    <div 
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: style.backgroundColor || '#f0fdf4',
        borderColor: style.borderColor || '#dcfce7'
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#166534' }}>
          {content.title || 'Installation Sign-off'}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">Installer Signature</p>
          <div 
            style={{ 
              height: '60px', 
              borderBottom: '2px solid #374151',
              backgroundColor: isPrintMode ? 'transparent' : '#f9fafb'
            }} 
          />
          <p className="text-xs text-gray-400 mt-1">Name: ________________________</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Client Confirmation</p>
          <div 
            style={{ 
              height: '60px', 
              borderBottom: '2px solid #374151',
              backgroundColor: isPrintMode ? 'transparent' : '#f9fafb'
            }} 
          />
          <p className="text-xs text-gray-400 mt-1">Date: ________________________</p>
        </div>
      </div>
      {content.completionNotes && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">Notes:</p>
          <div 
            style={{ 
              minHeight: '40px', 
              borderBottom: '1px solid #d1d5db',
              backgroundColor: isPrintMode ? 'transparent' : '#f9fafb'
            }} 
          />
        </div>
      )}
    </div>
  );
};

// ============= MAIN BLOCK RENDERER =============
export const renderSharedBlock = (props: BlockRendererProps): React.ReactNode => {
  const { block } = props;
  const blockType = (block.type || '').toLowerCase().trim();
  
  switch (blockType) {
    case 'document-header':
    case 'quote-header':
      return <DocumentHeaderBlock {...props} />;
      
    case 'products':
    case 'items':
    case 'line-items':
      return <LineItemsBlock {...props} />;
      
    case 'totals':
    case 'summary':
    case 'total':
      return <TotalsBlock {...props} />;
    
    // Invoice-specific blocks
    case 'payment-details':
      return <PaymentDetailsBlock {...props} />;
      
    case 'registration-footer':
      return <RegistrationFooterBlock {...props} />;
    
    case 'invoice-status':
      return <InvoiceStatusBlock {...props} />;
      
    case 'late-payment-terms':
      return <LatePaymentTermsBlock {...props} />;
    
    case 'tax-breakdown':
      return <TaxBreakdownBlock {...props} />;
    
    // Work order-specific blocks
    case 'installation-details':
      return <InstallationDetailsBlock {...props} />;
      
    case 'installer-signoff':
      return <InstallerSignoffBlock {...props} />;
    
    // Client info block (used by all document types)
    case 'client-info':
    case 'client':
    case 'bill-to':
      return <ClientInfoBlock {...props} />;
    
    // Terms and conditions block
    case 'terms-conditions':
    case 'terms':
      return <TermsConditionsBlock {...props} />;
      
    default:
      return null; // Let parent handle unknown types
  }
};
