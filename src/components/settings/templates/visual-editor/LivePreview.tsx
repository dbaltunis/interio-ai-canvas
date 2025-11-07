import React, { Suspense } from 'react';
import { format } from "date-fns";
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
  Space,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SignatureCanvas } from './SignatureCanvas';
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { QuoteItemImage } from "@/components/quotes/QuoteItemImage";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import { formatJobNumber } from "@/lib/format-job-number";

interface LivePreviewBlockProps {
  block: any;
  projectData?: any;
  isEditable?: boolean;
  isPrintMode?: boolean;
  userBusinessSettings?: any;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
  groupByRoom?: boolean;
  onSettingsChange?: (settings: { showDetailedBreakdown?: boolean; showImages?: boolean; groupByRoom?: boolean }) => void;
}

const LivePreviewBlock = ({ 
  block, 
  projectData, 
  isEditable, 
  isPrintMode = false, 
  userBusinessSettings,
  showDetailedBreakdown: propsShowDetailed,
  showImages: propsShowImages,
  groupByRoom: propsGroupByRoom,
  onSettingsChange
}: LivePreviewBlockProps) => {
  const content = block.content || {};
  const style = content.style || {};
  
  // State for products block - use props if provided, otherwise use internal state
  const [internalShowDetailed, setInternalShowDetailed] = React.useState(
    content.showDetailed !== undefined ? content.showDetailed : false
  );
  const [internalGroupByRoom, setInternalGroupByRoom] = React.useState(
    content.groupByRoom !== undefined ? content.groupByRoom : false
  );
  const [internalShowImages, setInternalShowImages] = React.useState(
    content.showImages !== undefined ? content.showImages : false
  );
  
  // Use props if provided, otherwise use internal state
  const showDetailedProducts = propsShowDetailed !== undefined ? propsShowDetailed : internalShowDetailed;
  const groupByRoom = propsGroupByRoom !== undefined ? propsGroupByRoom : internalGroupByRoom;
  const showImages = propsShowImages !== undefined ? propsShowImages : internalShowImages;
  
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
      quote_number: formatJobNumber(project.job_number || project.quote_number) || 'QT-2024-001',
      job_number: formatJobNumber(project.job_number || project.quote_number) || 'JOB-2024-001',
      project_name: project.name || 'Window Treatment Project',
      project_id: project.id || '',
      
      // Dates
      date: project.start_date ? new Date(project.start_date).toLocaleDateString() : (project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString()),
      quote_date: project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      start_date: project.start_date ? new Date(project.start_date).toLocaleDateString() : '',
      due_date: project.due_date ? new Date(project.due_date).toLocaleDateString() : '',
      valid_until: project.due_date ? new Date(project.due_date).toLocaleDateString() : (projectData?.validUntil ? new Date(projectData.validUntil).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()),
      
      // Financial information with currency support
      currency: projectData?.currency || 'GBP',
      currency_code: projectData?.currency || 'GBP',
      currency_symbol: (() => {
        const curr = projectData?.currency || 'GBP';
        const symbols: Record<string, string> = {
          'GBP': '£',
          'EUR': '€',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'USD': '$',
          'ZAR': 'R'
        };
        return symbols[curr] || '£';
      })(),
      subtotal: (() => {
        if (!projectData?.subtotal) return '£0.00';
        const curr = projectData?.currency || 'GBP';
        const symbols: Record<string, string> = {
          'GBP': '£',
          'EUR': '€',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'USD': '$',
          'ZAR': 'R'
        };
        return `${symbols[curr] || '£'}${projectData.subtotal.toFixed(2)}`;
      })(),
      discount: (() => {
        if (!projectData?.discount?.amount) return '£0.00';
        const curr = projectData?.currency || 'GBP';
        const symbols: Record<string, string> = {
          'GBP': '£',
          'EUR': '€',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'USD': '$',
          'ZAR': 'R'
        };
        return `${symbols[curr] || '£'}${projectData.discount.amount.toFixed(2)}`;
      })(),
      tax_amount: (() => {
        if (!projectData?.taxAmount) return '£0.00';
        const curr = projectData?.currency || 'GBP';
        const symbols: Record<string, string> = {
          'GBP': '£',
          'EUR': '€',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'USD': '$',
          'ZAR': 'R'
        };
        return `${symbols[curr] || '£'}${projectData.taxAmount.toFixed(2)}`;
      })(),
      tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '0%',
      total: (() => {
        if (!projectData?.total) return '£0.00';
        const curr = projectData?.currency || 'GBP';
        const symbols: Record<string, string> = {
          'GBP': '£',
          'EUR': '€',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'USD': '$',
          'ZAR': 'R'
        };
        return `${symbols[curr] || '£'}${projectData.total.toFixed(2)}`;
      })(),
      
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
    case 'document-header':
      const headerLayout = content.layout || 'centered';
      return (
        <div 
          className="mb-8" 
          style={{ 
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '24px 20px',
            borderRadius: '0px',
            borderBottom: 'none',
            margin: '0 0 24px 0'
          }}
        >
          {headerLayout === 'centered' && (
            <div className="text-center space-y-4">
              {/* Logo */}
              {content.showLogo !== false && (
                <div className="flex justify-center mb-4">
                  {projectData?.businessSettings?.company_logo_url ? (
                    <img 
                      src={projectData.businessSettings.company_logo_url} 
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

              {/* Document Title */}
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', letterSpacing: '-0.025em' }}>
                {content.documentTitle || "Quotation"}
              </h1>

              {/* Tagline */}
              {content.tagline && (
                <p style={{ fontSize: '16px', color: '#374151', maxWidth: '672px', margin: '8px auto 0', fontWeight: '500' }}>
                  {content.tagline}
                </p>
              )}

              {/* Metadata Row */}
              <div className="flex items-start justify-between pt-5 mt-5" style={{ borderTop: isPrintMode ? 'none' : '2px solid #d0d0d0' }}>
                {/* Client Info - Left */}
                <div className="text-left">
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {content.clientLabel || "Sold to"}
                  </div>
                  <div className="text-sm space-y-1">
                    {/* Name - Always visible */}
                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>{renderTokenValue('client_name') || 'Client Name'}</div>
                    
                    {/* Company */}
                    {content.showClientCompany !== false && renderTokenValue('client_company') && (
                      <div style={{ color: '#111827', fontWeight: '500', fontSize: '14px' }}>{renderTokenValue('client_company')}</div>
                    )}
                    
                    {/* ABN */}
                    {content.showClientABN !== false && renderTokenValue('client_abn') && (
                      <div style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>ABN: {renderTokenValue('client_abn')}</div>
                    )}
                    
                    {/* Business Email */}
                    {content.showClientBusinessEmail !== false && renderTokenValue('client_business_email') && (
                      <div style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>{renderTokenValue('client_business_email')}</div>
                    )}
                    
                    {/* Business Phone */}
                    {content.showClientBusinessPhone !== false && renderTokenValue('client_business_phone') && (
                      <div style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>{renderTokenValue('client_business_phone')}</div>
                    )}
                    
                    {/* Contact Email */}
                    {content.showClientEmail !== false && renderTokenValue('client_email') && (
                      <div style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>{renderTokenValue('client_email')}</div>
                    )}
                    
                    {/* Contact Phone */}
                    {content.showClientPhone !== false && renderTokenValue('client_phone') && (
                      <div style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>{renderTokenValue('client_phone')}</div>
                    )}
                    
                    {/* Address */}
                    {content.showClientAddress !== false && renderTokenValue('client_address') && (
                      <div style={{ color: '#374151', fontWeight: '500', fontSize: '14px' }}>{renderTokenValue('client_address')}</div>
                    )}
                  </div>
                </div>

                {/* Quote Details - Right */}
                <div className="text-right">
                  <div className="text-sm space-y-1">
                    <div>
                      <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>{content.quoteNumberLabel || "Order number:"} </span>
                      <span style={{ fontWeight: 'bold', color: '#111827', fontSize: '14px' }}>{renderTokenValue('job_number')}</span>
                    </div>
                    <div>
                      <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>Start Date: </span>
                      <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14px' }}>{renderTokenValue('start_date') || (content.customDate ? format(new Date(content.customDate), 'M/d/yyyy') : renderTokenValue('date'))}</span>
                    </div>
                    <div>
                      <span style={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}>Due Date: </span>
                      <span style={{ color: '#111827', fontWeight: 'bold', fontSize: '14px' }}>{renderTokenValue('due_date') || (content.customValidUntil ? format(new Date(content.customValidUntil), 'M/d/yyyy') : renderTokenValue('valid_until'))}</span>
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
                    {projectData?.businessSettings?.company_logo_url ? (
                      <img 
                        src={projectData.businessSettings.company_logo_url} 
                        alt="Company Logo" 
                        className="object-contain"
                        style={{ 
                          height: content.logoSize || '60px',
                          maxWidth: '200px'
                        }}
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
                  {content.companyName || renderTokenValue('company_name')}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>{renderTokenValue('company_address')}</div>
                  <div>{renderTokenValue('company_phone')}</div>
                  <div>{renderTokenValue('company_email')}</div>
                </div>
              </div>

              {/* Right: Document Info */}
              <div className="text-right">
                <h1 className="text-2xl font-semibold mb-4">
                  {content.documentTitle || "Quote"}
                </h1>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 justify-end">
                    <Hash className="h-3 w-3" />
                    <span>{content.quoteNumberLabel || "Quote #"}: {renderTokenValue('quote_number')}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Calendar className="h-3 w-3" />
                    <span>{content.dateLabel || "Start Date"}: {renderTokenValue('start_date') || renderTokenValue('date')}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set timeline in Client & Project Overview</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Calendar className="h-3 w-3" />
                    <span>Due Date: {renderTokenValue('due_date') || renderTokenValue('valid_until')}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Set timeline in Client & Project Overview</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                    {projectData?.businessSettings?.company_logo_url ? (
                      <img 
                        src={projectData.businessSettings.company_logo_url} 
                        alt="Company Logo" 
                        className="object-contain"
                        style={{ 
                          height: content.logoSize || '60px',
                          maxWidth: '200px'
                        }}
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
                  {content.documentTitle || "Quote"}
                </h1>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-4 border-t">
                {/* Company Info */}
                <div>
                  <h4 className="font-semibold mb-2">From:</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div className="font-medium text-foreground">{renderTokenValue('company_name')}</div>
                    <div>{renderTokenValue('company_address')}</div>
                    <div>{renderTokenValue('company_phone')}</div>
                  </div>
                </div>
                
                {/* Client & Quote Info */}
                <div>
                  <h4 className="font-semibold mb-2">{content.clientLabel || "To:"}</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div className="font-medium text-foreground">{renderTokenValue('client_name')}</div>
                    <div>{renderTokenValue('client_email')}</div>
                    {renderTokenValue('client_phone') && (
                      <div>{renderTokenValue('client_phone')}</div>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t text-sm">
                    <div><strong>Quote #:</strong> {renderTokenValue('job_number')}</div>
                    <div className="flex items-center gap-1">
                      <strong>Start Date:</strong> {renderTokenValue('start_date') || renderTokenValue('date')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Set timeline in Client & Project Overview</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-1">
                      <strong>Due Date:</strong> {renderTokenValue('due_date') || renderTokenValue('valid_until')}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Set timeline in Client & Project Overview</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );

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
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          <h3 className="flex items-center gap-2" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            <User className="h-5 w-5" />
            {content.title || 'Bill To:'}
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <div className="space-y-1">
              {clientName && <p style={{ fontWeight: '500', color: '#000' }}>{clientName}</p>}
              {clientCompany && (
                <p style={{ color: '#4b5563', fontWeight: '500' }}>{clientCompany}</p>
              )}
              {isB2B && clientAbn && (
                <p style={{ color: '#4b5563', fontSize: '14px' }}>ABN: {clientAbn}</p>
              )}
              {isB2B && clientBusinessEmail && (
                <p style={{ color: '#4b5563', fontSize: '14px' }}>Business: {clientBusinessEmail}</p>
              )}
              {isB2B && clientBusinessPhone && (
                <p style={{ color: '#4b5563', fontSize: '14px' }}>Business Phone: {clientBusinessPhone}</p>
              )}
              {clientEmail && (
                <p style={{ color: '#4b5563' }}>{isB2B ? 'Contact: ' : ''}{clientEmail}</p>
              )}
              {clientPhone && (
                <p style={{ color: '#4b5563' }}>{isB2B ? 'Contact Phone: ' : 'Phone: '}{clientPhone}</p>
              )}
              {clientAddress && (
                <p style={{ color: '#4b5563' }}>{clientAddress}</p>
              )}
            </div>
          </div>
        </div>
      );

    case 'products':
      // Get real data
      const workshopItems = projectData?.workshopItems || [];
      const surfaces = projectData?.surfaces || [];
      const rooms = projectData?.rooms || [];
      const windowSummaries = projectData?.windowSummaries?.windows || [];
      
      // Use projectData.items as PRIMARY source (this is the data from treatments)
      let projectItems = [];
      
      console.log('[PRODUCTS BLOCK] Data sources:', {
        hasItems: !!(projectData?.items && projectData.items.length > 0),
        itemsCount: projectData?.items?.length || 0,
        items: projectData?.items,
        itemsSample: projectData?.items?.[0],
        hasTreatments: !!(projectData?.treatments && projectData.treatments.length > 0),
        treatmentsCount: projectData?.treatments?.length || 0,
        treatmentsSample: projectData?.treatments?.[0],
        workshopItemsCount: workshopItems.length,
        surfacesCount: surfaces.length
      });
      
      if (projectData?.items && projectData.items.length > 0) {
        projectItems = projectData.items.filter((item: any) => !item.isHeader && item.type !== 'room_header');
        console.log('[PRODUCTS BLOCK] Using projectData.items:', projectItems);
      } else if (projectData?.treatments && projectData.treatments.length > 0) {
        // Fallback to treatments if items not present
        projectItems = projectData.treatments.filter((item: any) => !item.isHeader && item.type !== 'room_header');
        console.log('[PRODUCTS BLOCK] Using projectData.treatments:', projectItems);
      } else if (workshopItems.length > 0 || surfaces.length > 0) {
        const surfaceMap = new Map(surfaces.map((s: any) => [s.id, s]));
        projectItems = [...workshopItems];
        
        const workshopSurfaceIds = new Set(workshopItems.map((wi: any) => wi.window_id).filter(Boolean));
        surfaces.forEach((surface: any) => {
          if (!workshopSurfaceIds.has(surface.id)) {
            projectItems.push({
              id: surface.id,
              surface_name: surface.name,
              window_number: surface.name,
              room_name: 'Pending Configuration',
              description: 'No treatment configured yet',
              total_cost: 0,
              unit_price: 0,
              total: 0,
              quantity: 1,
              notes: `Window: ${surface.width || 0}cm x ${surface.height || 0}cm`,
              _isPending: true
            });
          }
        });
        console.log('[PRODUCTS BLOCK] Using workshop/surfaces fallback:', projectItems);
      }
      
      const hasRealData = projectItems.length > 0;

      // Get comprehensive breakdown - FROM CHILDREN ARRAY (has correct pricing)
      const getItemizedBreakdown = (item: any) => {
        const breakdown = [];
        
        console.log('[BREAKDOWN] Processing item:', {
          name: item.name,
          has_children: !!item.children,
          children_count: item.children?.length || 0,
          sample_child: item.children?.[0]
        });
        
        // Children array has the breakdown with PRICES
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          item.children.forEach((child: any, idx: number) => {
            // Skip if this is not a real breakdown item
            if (!child.isChild) return;
            
            breakdown.push({
              id: child.id || `${item.id}-child-${idx}`,
              name: child.name || 'Item',
              category: child.category || 'Component',
              description: child.description || '',
              quantity: child.quantity || 0,
              unit: child.unit || '',
              unit_price: child.unit_price || 0,
              total_cost: child.total || 0,
              image_url: child.image_url
            });
            
            console.log('[BREAKDOWN] Added child:', {
              name: child.name,
              unit_price: child.unit_price,
              total: child.total,
              quantity: child.quantity
            });
          });
        }
        
        console.log('[BREAKDOWN] Final breakdown:', {
          item_name: item.name,
          breakdown_count: breakdown.length,
          breakdown_items: breakdown.map(b => ({ name: b.name, total: b.total_cost }))
        });
        
        return breakdown;
      };
      
      console.log('[PRODUCTS BLOCK] Rendering products:', {
        projectItemsCount: projectItems.length,
        windowSummariesCount: windowSummaries.length,
        rooms: rooms.map((r: any) => r.name),
        groupByRoom,
        showDetailedProducts,
        showImages,
        sampleItemChildren: projectItems[0]?.children?.map((c: any) => ({
          name: c.name,
          unit_price: c.unit_price,
          total: c.total
        }))
      });

      // Group items by room if enabled
      const groupedItems = groupByRoom && hasRealData ? 
        projectItems.reduce((acc: any, item: any) => {
          const room = item.room_name || item.location || 'Unassigned Room';
          if (!acc[room]) acc[room] = [];
          acc[room].push(item);
          return acc;
        }, {}) : 
        { 'All Items': projectItems };

      return (
        <div className="mb-4" style={{ pageBreakInside: 'avoid', backgroundColor: '#ffffff', padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', backgroundColor: '#ffffff' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#000', backgroundColor: '#ffffff', padding: '4px 0' }}>
              {content.title || 'Quote Items'}
            </h3>
          </div>

          {!hasRealData && (
            <div style={{ backgroundColor: '#f3f4f6', borderLeft: '4px solid #9ca3af', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                No project data available. Add treatments to your project to see itemized breakdown.
              </p>
            </div>
          )}

          {/* Get tax settings for dynamic headers */}
          {(() => {
            const businessSettings = projectData?.businessSettings || {};
            const pricingSettings = businessSettings.pricing_settings || {};
            const taxInclusive = pricingSettings.tax_inclusive || false;
            const taxType = (businessSettings.tax_type || 'VAT').toUpperCase();
            const totalColumnHeader = taxInclusive 
              ? `Total (incl. ${taxType})` 
              : `Total (excl. ${taxType})`;
            
            return null;
          })()}

          <div style={{ overflow: 'visible', width: '100%', backgroundColor: '#ffffff' }}>
            <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', backgroundColor: '#ffffff' }}>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '170px' }} />
              </colgroup>
              <thead style={{ backgroundColor: '#ffffff' }}>
                <tr style={{ borderBottom: isPrintMode ? 'none' : '1px solid #333', backgroundColor: '#ffffff' }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>Product/Service</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>
                    {(() => {
                      const businessSettings = projectData?.businessSettings || {};
                      const pricingSettings = businessSettings.pricing_settings || {};
                      const taxInclusive = pricingSettings.tax_inclusive || false;
                      const taxType = (businessSettings.tax_type || 'VAT').toUpperCase();
                      return taxInclusive ? `Total (incl. ${taxType})` : `Total (excl. ${taxType})`;
                    })()}
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {Object.entries(groupedItems).map(([roomName, items]: [string, any]) => (
                  <React.Fragment key={roomName}>
                    {groupByRoom && hasRealData && (
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td colSpan={5} style={{ padding: '8px 6px 4px 6px', fontSize: '14px', fontWeight: '500', color: '#000', borderTop: '1px solid rgba(0,0,0,0.15)', backgroundColor: '#fff' }}>
                          {roomName}
                        </td>
                      </tr>
                    )}
                    {(items as any[]).map((item: any, itemIndex: number) => {
                      const itemNumber = groupByRoom ? itemIndex + 1 : Object.values(groupedItems).flat().indexOf(item) + 1;
                      const breakdown = getItemizedBreakdown(item);
                      
                      console.log('[PRODUCT ROW]', {
                        itemNumber,
                        itemName: item.name || item.surface_name,
                        total_cost: item.total_cost,
                        unit_price: item.unit_price,
                        total: item.total,
                        allItemData: item
                      });
                      
                      return (
                        <React.Fragment key={`item-${roomName}-${itemIndex}`}>
                          {/* Main product row */}
                          <tr style={{ 
                            borderBottom: (breakdown.length > 0 && showDetailedProducts) || isPrintMode ? 'none' : '1px solid #ddd',
                            backgroundColor: '#fff'
                          }}>
                            <td style={{ padding: '5px 6px', fontSize: '15px', fontWeight: '500', color: '#000', verticalAlign: 'top', backgroundColor: '#ffffff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {showImages && item.image_url && (
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name || 'Product'} 
                                    className="print-image"
                                    style={{ 
                                      width: '35px', 
                                      height: '35px', 
                                      objectFit: 'cover', 
                                      borderRadius: '2px',
                                      border: isPrintMode ? 'none' : '1px solid #ddd',
                                      flexShrink: 0
                                    }}
                                  />
                                )}
                                <span>
                                  {item.treatment_type ? 
                                    item.treatment_type.charAt(0).toUpperCase() + item.treatment_type.slice(1) : 
                                    (item.name || item.surface_name || 'Window Treatment')
                                  }
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '5px 6px', fontSize: '13px', color: '#666', fontWeight: '400', verticalAlign: 'top', wordWrap: 'break-word', overflowWrap: 'break-word', backgroundColor: '#ffffff' }}>
                              {item.notes || item.description || '-'}
                            </td>
                            <td style={{ padding: '5px 6px', fontSize: '14px', fontWeight: '400', color: '#000', textAlign: 'center', verticalAlign: 'top', backgroundColor: '#ffffff' }}>
                              {item.quantity || 1}
                            </td>
                            <td style={{ padding: '5px 6px', fontSize: '14px', fontWeight: '400', color: '#000', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                              {`${renderTokenValue('currency_symbol')}${((item.unit_price || item.total_cost || item.total || 0) / (item.quantity || 1)).toFixed(2)}`}
                            </td>
                            <td style={{ padding: '5px 6px', fontSize: '14px', fontWeight: '500', color: '#000', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                              {`${renderTokenValue('currency_symbol')}${((item.total_cost || item.total || 0)).toFixed(2)}`}
                            </td>
                          </tr>
                          
                          {/* Detailed breakdown rows - indented */}
                          {breakdown.length > 0 && showDetailedProducts && breakdown.map((breakdownItem: any, bidx: number) => (
                            <tr key={bidx} style={{ 
                              backgroundColor: '#fff',
                              borderBottom: isPrintMode ? 'none' : (bidx === breakdown.length - 1 ? '1px solid #ddd' : '1px solid #e8e8e8')
                            }}>
                              <td style={{ padding: '3px 6px 3px 20px', fontSize: '13px', color: '#000', fontWeight: '400', backgroundColor: '#ffffff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {showImages && breakdownItem.image_url && (
                                    <img 
                                      src={breakdownItem.image_url} 
                                      alt={breakdownItem.name || 'Component'}
                                      className="print-image"
                                      style={{ 
                                        width: '25px', 
                                        height: '25px', 
                                        objectFit: 'cover', 
                                        borderRadius: '2px',
                                        border: isPrintMode ? 'none' : '1px solid #ddd',
                                        flexShrink: 0
                                      }}
                                    />
                                  )}
                                  <span>{breakdownItem.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666', fontWeight: '400', wordWrap: 'break-word', overflowWrap: 'break-word', backgroundColor: '#ffffff' }}>
                                {breakdownItem.description || '-'}
                              </td>
                              <td style={{ padding: '3px 6px', fontSize: '13px', color: '#000', fontWeight: '400', textAlign: 'center', backgroundColor: '#ffffff' }}>
                                {breakdownItem.quantity > 0 ? `${breakdownItem.quantity.toFixed(2)} ${breakdownItem.unit || ''}`.trim() : '-'}
                              </td>
                              <td style={{ padding: '3px 6px', fontSize: '13px', fontWeight: '400', color: '#000', textAlign: 'right', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                                {breakdownItem.unit_price > 0 ? `${renderTokenValue('currency_symbol')}${breakdownItem.unit_price.toFixed(2)}` : '-'}
                              </td>
                              <td style={{ padding: '3px 6px', fontSize: '13px', fontWeight: '400', color: '#000', textAlign: 'right', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                                {renderTokenValue('currency_symbol')}{(breakdownItem.total_cost || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'totals':
      return (
        <div style={{ marginBottom: '32px', backgroundColor: '#ffffff !important' }}>
          <div className="flex justify-end">
            <div 
              style={{ 
                backgroundColor: '#ffffff !important',
                border: 'none',
                minWidth: '340px',
                padding: '16px 32px',
                color: '#000 !important'
              }}
            >
              {/* Price excl. GST/Tax (Base Subtotal) */}
              {content.showSubtotal !== false && (
                <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                  <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                    <span style={{ fontSize: '14px', color: '#111827 !important' }}>
                      Subtotal: {renderTokenValue('subtotal')}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Discount (if applicable) */}
              {(() => {
                console.log('🎨 LivePreview - Discount check:', {
                  hasDiscount: projectData?.discount?.amount > 0,
                  discount: projectData?.discount,
                  _debug: (projectData as any)?._debug_discount
                });
                return projectData?.discount?.amount > 0 ? (
                  <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                    <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                      <span style={{ fontSize: '14px', color: '#dc2626 !important' }}>
                        Discount ({projectData.discount.type === 'percentage' ? `${projectData.discount.value}%` : 'Fixed'}): -{renderTokenValue('discount')}
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}
              
              {/* GST/Tax */}
              {content.showTax && (
                <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                  <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                    <span style={{ fontSize: '14px', color: '#111827 !important' }}>
                      {userBusinessSettings?.tax_type && userBusinessSettings.tax_type !== 'none' 
                        ? userBusinessSettings.tax_type.toUpperCase() 
                        : 'Tax'} ({renderTokenValue('tax_rate')}): {renderTokenValue('tax_amount')}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Grand total */}
              <div className="flex justify-end py-3 mt-2 border-t" style={{ backgroundColor: '#ffffff !important', borderColor: '#e5e7eb !important' }}>
                <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827 !important' }}>Total: {renderTokenValue('total')}</span>
                </div>
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
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '32px', backgroundColor: '#f9fafb' }}>
              <ImageIcon className="h-12 w-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
              <p style={{ color: '#6b7280' }}>Image placeholder</p>
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
        <div className="mb-6" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="flex items-center gap-2" style={{ fontSize: '18px', fontWeight: '600', color: '#000' }}>
              <ShoppingCart className="h-5 w-5" style={{ color: '#000' }} />
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
                <div key={categoryIndex} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '8px 16px', borderBottom: '1px solid #e5e7eb' }}>
                    <h4 style={{ fontWeight: '500', color: '#000' }}>{category.category}</h4>
                  </div>
                  <div style={{ overflowX: 'auto', backgroundColor: '#ffffff' }}>
                    <table style={{ width: '100%', backgroundColor: '#ffffff' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', fontSize: '14px' }}>
                          <th style={{ textAlign: 'left', padding: '12px', fontWeight: '500', color: '#000' }}>Item Description</th>
                          <th style={{ textAlign: 'center', padding: '12px', fontWeight: '500', width: '80px', color: '#000' }}>Qty</th>
                          <th style={{ textAlign: 'center', padding: '12px', fontWeight: '500', width: '80px', color: '#000' }}>Unit</th>
                          <th style={{ textAlign: 'right', padding: '12px', fontWeight: '500', width: '96px', color: '#000' }}>Unit Price</th>
                          <th style={{ textAlign: 'right', padding: '12px', fontWeight: '500', width: '96px', color: '#000' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: '#ffffff' }}>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                            <td style={{ padding: '12px', fontSize: '14px', color: '#000' }}>{item.name}</td>
                            <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center', color: '#000' }}>{item.quantity}</td>
                            <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center', color: '#000' }}>{item.unit}</td>
                            <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#000' }}>${item.unitPrice.toFixed(2)}</td>
                            <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', fontWeight: '500', color: '#000' }}>${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ backgroundColor: '#f9fafb', padding: '8px 16px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#000' }}>
                      <span style={{ color: '#000' }}>{category.category} Subtotal:</span>
                      <span style={{ color: '#000' }}>${category.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Simple View
            <div style={{ overflowX: 'auto', backgroundColor: '#ffffff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d1d5db', backgroundColor: '#ffffff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'left', fontWeight: '500', color: '#000' }}>Description</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'center', width: '96px', fontWeight: '500', color: '#000' }}>Qty</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right', width: '128px', fontWeight: '500', color: '#000' }}>Unit Price</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right', width: '128px', fontWeight: '500', color: '#000' }}>Total</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: '#ffffff' }}>
                  {simpleItems.map((item, index) => (
                    <tr key={index} style={{ backgroundColor: '#ffffff' }}>
                      <td style={{ border: '1px solid #d1d5db', padding: '12px', color: '#000' }}>{item.description}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'center', color: '#000' }}>{item.quantity}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right', color: '#000' }}>{item.unitPrice}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right', fontWeight: '500', color: '#000' }}>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '16px', backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '256px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingBottom: '4px' }}>
                  <span style={{ color: '#000' }}>Total:</span>
                  <span style={{ fontWeight: '500', color: '#000' }}>{projectData?.subtotal?.toFixed(2) || '0.00'}{renderTokenValue('currency_code')}</span>
                </div>
                
                {projectData?.discount && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingBottom: '4px', fontStyle: 'italic', color: '#dc2626' }}>
                      <span>
                        Discount: {projectData.discount.type === 'percentage' ? `${projectData.discount.value}%` : `${projectData.discount.value}${renderTokenValue('currency_code')}`}
                        {projectData.discount.scope === 'fabrics_only' && ' (Fabrics only)'}
                        {projectData.discount.scope === 'selected_items' && ' (Selected items)'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingBottom: '4px', color: '#dc2626' }}>
                      <span>Discount</span>
                      <span style={{ fontWeight: '500' }}>-{projectData.discount.amount.toFixed(2)}{renderTokenValue('currency_code')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingBottom: '4px' }}>
                      <span style={{ color: '#000' }}>Price after discount:</span>
                      <span style={{ fontWeight: '500', color: '#000' }}>
                        {((projectData.subtotal || 0) - projectData.discount.amount).toFixed(2)}{renderTokenValue('currency_code')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingBottom: '4px' }}>
                      <span style={{ color: '#000' }}>Price excl. GST:</span>
                      <span style={{ fontWeight: '500', color: '#000' }}>
                        {(((projectData.subtotal || 0) - projectData.discount.amount) / (1 + (projectData.taxRate || 0))).toFixed(2)}{renderTokenValue('currency_code')}
                      </span>
                    </div>
                  </>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', paddingBottom: '4px' }}>
                  <span style={{ color: '#000' }}>GST ({projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '0%'}):</span>
                  <span style={{ fontWeight: '500', color: '#000' }}>{projectData?.taxAmount?.toFixed(2) || '0.00'}{renderTokenValue('currency_code')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: '8px', borderTop: '1px solid #d1d5db', fontWeight: 'bold', fontSize: '18px' }}>
                  <span style={{ color: '#000' }}>Grand total:</span>
                  <span style={{ color: '#000' }}>{projectData?.total?.toFixed(2) || '0.00'}{renderTokenValue('currency_code')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'terms-conditions':
      return (
        <div style={{ marginBottom: '24px', backgroundColor: '#ffffff !important', padding: '16px', color: '#000 !important' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000 !important', backgroundColor: 'transparent !important' }}>
            {content.title || 'Terms & Conditions'}
          </h3>
          <div style={{ fontSize: '14px', color: '#000 !important', backgroundColor: '#ffffff !important' }}>
            <div style={{ marginBottom: '12px', color: '#000 !important' }}>1. Payment Terms: 50% deposit required upon acceptance of this quote. Remaining balance due upon completion.</div>
            <div style={{ marginBottom: '12px', color: '#000 !important' }}>2. Timeline: Project completion is estimated at 2-3 weeks from deposit receipt and final measurements.</div>
            <div style={{ marginBottom: '12px', color: '#000 !important' }}>3. Warranty: All work comes with a 1-year warranty against defects in workmanship.</div>
            <div style={{ marginBottom: '12px', color: '#000 !important' }}>4. Cancellation: This quote is valid for 30 days. Cancellation after work begins subject to materials and labor charges.</div>
          </div>
        </div>
      );

    case 'payment-info':
      return (
        <div className="mb-6" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign className="h-5 w-5" style={{ color: '#000' }} />
            {content.title || 'Payment Information'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
                <DollarSign className="h-4 w-4" style={{ color: '#000' }} />
                Payment Methods
              </h4>
              <div style={{ fontSize: '14px', color: '#000' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Cash, Check, or Credit Card</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Bank Transfer (ACH)</div>
                <div style={{ color: '#000' }}>• Financing Available</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#000' }}>Payment Schedule</h4>
              <div style={{ fontSize: '14px', color: '#000' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>Deposit: 50% upon signing</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>Progress: 25% at midpoint</div>
                <div style={{ color: '#000' }}>Final: 25% upon completion</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'project-scope':
      return (
        <div className="mb-6" style={{ backgroundColor: '#ffffff', padding: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000' }}>
            {content.title || 'Project Scope'}
          </h3>
          <div style={{ backgroundColor: '#ffffff' }}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#000' }}>Included:</h4>
              <div style={{ fontSize: '14px', paddingLeft: '16px' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>✓ Professional measurement and consultation</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>✓ Custom fabrication of drapery</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>✓ Hardware installation and mounting</div>
                <div style={{ color: '#000' }}>✓ Final styling and adjustments</div>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#000' }}>Not Included:</h4>
              <div style={{ fontSize: '14px', paddingLeft: '16px' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Wall repairs or painting</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Removal of existing treatments</div>
                <div style={{ color: '#000' }}>• Electrical work for motorization</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'signature':
      return (
        <div style={{ marginTop: '32px', marginBottom: '24px', backgroundColor: '#ffffff !important', padding: '16px', color: '#000 !important' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#000 !important', backgroundColor: 'transparent !important' }}>
            {content.title || 'Authorization'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', backgroundColor: '#ffffff !important' }}>
            <div style={{ backgroundColor: '#ffffff !important' }}>
              <p style={{ fontSize: '14px', marginBottom: '16px', color: '#000 !important' }}>{content.authorizationText || "By signing below, you authorize us to proceed with this work as described:"}</p>
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '8px', marginTop: '48px', backgroundColor: '#ffffff !important' }}>
                <div style={{ fontSize: '14px', color: '#000 !important', backgroundColor: '#ffffff !important' }}>
                  <div style={{ fontWeight: '500', color: '#000 !important' }}>{content.clientSignatureLabel || "Client Signature"}</div>
                  <div style={{ color: '#000 !important' }}>{content.printNameLabel || "Print Name"}: {renderTokenValue('client_name')}</div>
                  <div style={{ color: '#000 !important' }}>{content.dateLabel || "Date"}: _________________</div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff !important' }}>
              <p style={{ fontSize: '14px', marginBottom: '16px', color: '#000 !important' }}>{content.thankYouText || "Thank you for choosing us for your project!"}</p>
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '8px', marginTop: '48px', backgroundColor: '#ffffff !important' }}>
                <div style={{ fontSize: '14px', color: '#000 !important', backgroundColor: '#ffffff !important' }}>
                  <div style={{ fontWeight: '500', color: '#000 !important' }}>{content.companySignatureLabel || "Company Representative"}</div>
                  <div style={{ color: '#000 !important' }}>{content.printNameLabel || "Print Name"}: _________________</div>
                  <div style={{ color: '#000 !important' }}>{content.dateLabel || "Date"}: _________________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'footer':
      const businessSettings = projectData?.businessSettings || {};
      return (
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #d1d5db', backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            {content.footerText && (
              <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '12px' }}>
                {content.footerText}
              </p>
            )}
            {content.showCompanyInfo !== false && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p style={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}>{renderTokenValue('company_name')}</p>
                {businessSettings?.address && (
                  <p style={{ color: '#666', marginBottom: '4px' }}>{renderTokenValue('company_address')}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {businessSettings?.business_phone && (
                    <span style={{ color: '#666' }}>📞 {renderTokenValue('company_phone')}</span>
                  )}
                  {businessSettings?.business_email && (
                    <span style={{ color: '#666' }}>✉️ {renderTokenValue('company_email')}</span>
                  )}
                  {businessSettings?.website && (
                    <span style={{ color: '#666' }}>🌐 {businessSettings.website}</span>
                  )}
                </div>
              </div>
            )}
            {content.additionalText && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                {content.additionalText}
              </p>
            )}
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
  isPrintMode?: boolean;
  onBlocksChange?: (blocks: any[]) => void;
  containerStyles?: any;
  onContainerStylesChange?: (styles: any) => void;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
  groupByRoom?: boolean;
  onSettingsChange?: (settings: { showDetailedBreakdown?: boolean; showImages?: boolean; groupByRoom?: boolean }) => void;
}

export const LivePreview = ({ 
  blocks, 
  projectData, 
  isEditable = false,
  isPrintMode = false,
  onBlocksChange,
  containerStyles,
  onContainerStylesChange,
  showDetailedBreakdown,
  showImages,
  groupByRoom,
  onSettingsChange
}: LivePreviewProps) => {
  const { data: businessSettings } = useBusinessSettings();
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

  // Print Mode: Clean rendering without wrappers, borders, or UI elements
  if (isPrintMode) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff !important',
          color: '#000000 !important',
          padding: 0,
          margin: 0,
          width: '100%'
        }}
      >
        {blocks.map((block, index) => (
          <LivePreviewBlock
            key={block.id || index}
            block={block}
            projectData={projectData}
            isEditable={false}
            isPrintMode={true}
            userBusinessSettings={businessSettings}
            showDetailedBreakdown={showDetailedBreakdown}
            showImages={showImages}
            groupByRoom={groupByRoom}
            onSettingsChange={onSettingsChange}
          />
        ))}
      </div>
    );
  }

  // Editor Mode: Full UI with borders, scrolling, and indicators
  return (
    <ScrollArea className="h-full w-full bg-muted/20">
      <div className="flex justify-center py-8 px-4">
        {/* A4 Page Container with visible borders */}
        <div 
          className="relative bg-white shadow-lg"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            minHeight: '1123px',
            backgroundColor: containerStyles?.backgroundColor || '#ffffff',
            border: isPrintMode ? 'none' : '2px solid hsl(var(--border))',
            boxShadow: isPrintMode ? 'none' : '0 0 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Print cut line indicator at top - barely visible */}
          <div 
            className="no-print absolute top-0 left-0 right-0 h-px border-t border-dashed border-primary/5"
            style={{ borderTopWidth: '1px' }}
          />
          
          {/* Print cut line indicator at bottom - more visible for cutting reference */}
          <div 
            className="no-print absolute bottom-0 left-0 right-0 h-px border-b-2 border-dashed border-destructive/20"
            style={{ borderBottomWidth: '2px' }}
          />
          
          {/* Side cut lines - barely visible */}
          <div 
            className="no-print absolute top-0 bottom-0 left-0 w-px border-l border-dashed border-primary/5"
            style={{ borderLeftWidth: '1px', left: '15mm' }}
          />
          
          <div 
            className="no-print absolute top-0 bottom-0 right-0 w-px border-r border-dashed border-primary/5"
            style={{ borderRightWidth: '1px', right: '15mm' }}
          />
          
          {/* Content area */}
          <div 
            className="w-full print:!p-0 print:!m-0"
            style={{ 
              padding: '10mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxWidth: '794px'
            }}
          >
            {blocks.map((block, index) => (
              <LivePreviewBlock 
                key={block.id || index} 
                block={block} 
                projectData={projectData}
                isEditable={isEditable}
                isPrintMode={false}
                userBusinessSettings={businessSettings}
                showDetailedBreakdown={showDetailedBreakdown}
                showImages={showImages}
                groupByRoom={groupByRoom}
                onSettingsChange={onSettingsChange}
              />
            ))}
          </div>
          
          {/* Page break indicator every 297mm - subtle */}
          <div 
            className="no-print absolute left-0 right-0 border-t border-dashed border-destructive/10 pointer-events-none"
            style={{ 
              top: '297mm',
              borderTopWidth: '1px'
            }}
          />
        </div>
      </div>
    </ScrollArea>
  );
};
