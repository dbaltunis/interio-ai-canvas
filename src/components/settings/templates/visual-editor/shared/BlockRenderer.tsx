import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Hash, 
  Calendar,
  User,
  Info
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/utils/formatCurrency';

interface BlockRendererProps {
  block: any;
  projectData?: any;
  userTimezone?: string;
  userDateFormat?: string;
  isPrintMode?: boolean;
  isEditable?: boolean;
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
    
    // Import country-specific labels dynamically
    const { getRegistrationLabels } = require('@/utils/businessRegistrationLabels');
    const labels = getRegistrationLabels(country);
    
    if (businessSettings.abn) parts.push(`ABN: ${businessSettings.abn}`);
    if (businessSettings.registration_number) {
      parts.push(`${labels.registrationLabel}: ${businessSettings.registration_number}`);
    }
    if (businessSettings.tax_number) {
      parts.push(`${labels.taxLabel}: ${businessSettings.tax_number}`);
    }
    
    return parts.join(' | ');
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
  renderEditableText,
  onContentChange
}) => {
  const content = block.content || {};
  const businessSettings = projectData?.businessSettings || {};
  const headerLayout = content.layout || 'centered';
  
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

          {/* Document Title */}
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', letterSpacing: '-0.025em', marginTop: '16px' }}>
            {isEditable ? renderText(
              content.documentTitle || 'Invoice',
              (v) => updateContent({ documentTitle: v }),
              'text-3xl font-bold',
              'Document Title'
            ) : (content.documentTitle || 'Invoice')}
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

            {/* Quote Details - Right */}
            <div className="text-right">
              <div className="text-sm space-y-1">
                <div>
                  <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>
                    {content.quoteNumberLabel || 'Invoice no #:'}{' '}
                  </span>
                  <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>
                    {getToken('job_number')}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>Date: </span>
                  <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14px' }}>
                    {getToken('date')}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>Valid Until: </span>
                  <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14px' }}>
                    {getToken('valid_until')}
                  </span>
                </div>
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
              {content.documentTitle || 'Quote'}
            </h1>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Hash className="h-3 w-3" />
                <span>{content.quoteNumberLabel || 'Quote #'}: {getToken('quote_number')}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Calendar className="h-3 w-3" />
                <span>Date: {getToken('date')}</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Calendar className="h-3 w-3" />
                <span>Valid Until: {getToken('valid_until')}</span>
              </div>
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
            <h1 className="text-3xl font-bold">{content.documentTitle || 'Quote'}</h1>
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
                <div><strong>Quote #:</strong> {getToken('job_number')}</div>
                <div><strong>Date:</strong> {getToken('date')}</div>
                <div><strong>Valid Until:</strong> {getToken('valid_until')}</div>
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
      
    default:
      return null; // Let parent handle unknown types
  }
};
